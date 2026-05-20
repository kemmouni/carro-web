import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
