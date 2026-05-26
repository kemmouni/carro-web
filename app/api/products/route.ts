import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit     = Math.min(48, parseInt(searchParams.get("limit") ?? "24"));
    const q         = searchParams.get("q");
    const category  = searchParams.get("category");
    const brand     = searchParams.get("brand");
    const carMake   = searchParams.get("carMake");
    const carModel  = searchParams.get("carModel");
    const carYear   = searchParams.get("carYear") ? parseInt(searchParams.get("carYear")!) : null;
    const condition = searchParams.get("condition");
    const minPrice  = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : null;
    const maxPrice  = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : null;
    const featured  = searchParams.get("featured") === "true" ? true : null;
    const storeId   = searchParams.get("storeId");
    const sort      = searchParams.get("sort") ?? "newest";
    // Listing-type aware filters
    const typeRaw   = searchParams.get("type");
    const type      = typeRaw === "services" ? "SERVICE"
                    : typeRaw === "cars"     ? "CAR"
                    : typeRaw === "parts"    ? "PART"
                    : (typeRaw === "PART" || typeRaw === "SERVICE" || typeRaw === "CAR") ? typeRaw
                    : null;
    const service   = searchParams.get("service"); // service slug -> brand column
    const body      = searchParams.get("body");    // car body slug -> brand column

    let query = supabaseAdmin
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug),
        store:stores(id, name, slug, city, "isVerified"),
        images:product_images(id, url, "isPrimary", "sortOrder")
      `, { count: "exact" })
      .eq("isActive", true)
      .eq("approvalStatus", "ACTIVE")
      .range((page - 1) * limit, page * limit - 1);

    if (q)         query = query.ilike("title", `%${q}%`);
    if (brand)     query = query.ilike("brand", brand);
    if (carMake)   query = query.ilike("carMake", carMake);
    if (carModel)  query = query.ilike("carModel", carModel);
    if (condition) query = query.eq("condition", condition);
    if (featured)  query = query.eq("isFeatured", true);
    if (storeId)   query = query.eq("storeId", storeId);
    if (minPrice !== null) query = query.gte("price", minPrice);
    if (maxPrice !== null) query = query.lte("price", maxPrice);
    if (carYear)   query = query.lte("carYear", carYear).gte("carYearTo", carYear);

    // Listing-type filtering (PART rows may have null listingType for legacy data)
    if (type === "PART") {
      query = query.or('"listingType".eq.PART,"listingType".is.null');
    } else if (type) {
      query = query.eq("listingType", type);
    }
    // Services + Cars reuse `brand` column for category slug
    if (service) query = query.eq("brand", service);
    if (body)    query = query.eq("brand", body);

    // Filter by category slug — only meaningful for PART listings
    if (category && (type === "PART" || type === null)) {
      const { data: cat } = await supabaseAdmin
        .from("categories").select("id").eq("slug", category).single();
      if (cat) query = query.eq("categoryId", cat.id);
    }

    // Sorting
    if (sort === "price_asc")   query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else if (sort === "views")  query = query.order("viewCount", { ascending: false });
    else query = query.order("createdAt", { ascending: false });

    const { data, count, error } = await query;
    if (error) throw error;

    // Sort images: primary first
    const products = (data ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      images: ((p.images as Array<{ sortOrder: number }>) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    }));

    return NextResponse.json(
      { success: true, data: products, pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) } },
      // Cache public product listings for 30s at the CDN edge
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Auth + ownership: verify the storeId belongs to the caller
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data: store } = await supabaseAdmin.from("stores").select("userId").eq("id", body.storeId).single();
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    if (store.userId !== user.id) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const slug = body.slug ?? body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert({
        id:            crypto.randomUUID(),
        storeId:       body.storeId,
        categoryId:    body.categoryId,
        title:         body.title,
        slug,
        description:   body.description,
        price:         body.price,
        originalPrice: body.originalPrice,
        currency:      body.currency ?? "QAR",
        condition:     body.condition,
        partNumber:    body.partNumber,
        brand:         body.brand,
        carMake:       body.carMake,
        carModel:      body.carModel,
        carYear:       body.carYear,
        carYearTo:     body.carYearTo,
        isFeatured:     body.isFeatured ?? false,
        isActive:       false,
        approvalStatus: "PENDING",
        updatedAt:      new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Insert images
    if (body.images?.length && product) {
      await supabaseAdmin.from("product_images").insert(
        body.images.map((img: { url: string; isPrimary?: boolean }, i: number) => ({
          id:        crypto.randomUUID(),
          productId: (product as { id: string }).id,
          url:       img.url,
          isPrimary: img.isPrimary ?? i === 0,
          sortOrder: i,
        }))
      );
    }

    // Notify all admins of new pending product
    if (product) {
      const { data: admins } = await supabaseAdmin
        .from("users").select("id").eq("role", "ADMIN");
      if (admins?.length) {
        await supabaseAdmin.from("notifications").insert(
          admins.map((a: { id: string }) => ({
            id:      crypto.randomUUID(),
            userId:  a.id,
            type:    "new_product_pending",
            title:   "New listing pending review",
            message: `"${body.title}" needs your approval.`,
            link:    "/admin/products",
          }))
        );
      }
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/products]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
