import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(48, parseInt(searchParams.get("limit") ?? "20"));
    const q     = searchParams.get("q");
    const city  = searchParams.get("city");

    const where: Record<string, unknown> = {};
    if (q)    where.name = { contains: q, mode: "insensitive" };
    if (city) where.city = { equals: city, mode: "insensitive" };

    const [total, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        orderBy: { avgRating: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { products: true, reviews: true } } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: stores,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/stores]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
