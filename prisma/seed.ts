import { PrismaClient, UserRole, Condition, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // ── Categories ────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "engine" },     update: {}, create: { name: "Engine & Drivetrain",   slug: "engine",     imageUrl: "/images/cat-engine.png" } }),
    prisma.category.upsert({ where: { slug: "brakes" },     update: {}, create: { name: "Brakes & Suspension",   slug: "brakes",     imageUrl: "/images/cat-brakes.png" } }),
    prisma.category.upsert({ where: { slug: "electrical" }, update: {}, create: { name: "Electrical & Lighting", slug: "electrical", imageUrl: "/images/cat-electrical.png" } }),
    prisma.category.upsert({ where: { slug: "ac-heating" }, update: {}, create: { name: "AC & Heating",          slug: "ac-heating", imageUrl: "/images/cat-ac.png" } }),
    prisma.category.upsert({ where: { slug: "filters" },    update: {}, create: { name: "Filters & Fluids",      slug: "filters",    imageUrl: "/images/cat-filters.png" } }),
    prisma.category.upsert({ where: { slug: "body" },       update: {}, create: { name: "Body & Exterior",       slug: "body",       imageUrl: "/images/cat-body.png" } }),
    prisma.category.upsert({ where: { slug: "interior" },   update: {}, create: { name: "Interior & Accessories",slug: "interior",   imageUrl: "/images/cat-interior.png" } }),
    prisma.category.upsert({ where: { slug: "wheels" },     update: {}, create: { name: "Wheels & Tires",        slug: "wheels",     imageUrl: "/images/cat-wheels.png" } }),
  ]);
  console.log(`✅ ${categories.length} categories`);

  // ── Users ─────────────────────────────────────────────────
  const seller1 = await prisma.user.upsert({
    where: { email: "seller1@carro.qa" },
    update: {},
    create: {
      email: "seller1@carro.qa",
      name: "Mohammed Al-Rashid",
      role: UserRole.SELLER,
      phone: "+974 5555 1001",
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "seller2@carro.qa" },
    update: {},
    create: {
      email: "seller2@carro.qa",
      name: "Ahmed Hassan",
      role: UserRole.SELLER,
      phone: "+974 5555 1002",
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: "buyer1@carro.qa" },
    update: {},
    create: {
      email: "buyer1@carro.qa",
      name: "Khalid Al-Thani",
      role: UserRole.BUYER,
      phone: "+974 5555 2001",
    },
  });
  console.log("✅ 3 users");

  // ── Stores ────────────────────────────────────────────────
  const store1 = await prisma.store.upsert({
    where: { slug: "auto-parts-doha" },
    update: {},
    create: {
      userId: seller1.id,
      name: "Auto Parts Doha",
      slug: "auto-parts-doha",
      description: "Qatar's leading supplier of genuine and aftermarket auto parts. Specializing in Toyota, Nissan, and Lexus parts with over 10 years of experience.",
      city: "Doha",
      country: "Qatar",
      address: "Industrial Area, Street 22, Doha, Qatar",
      phone: "+974 4444 5678",
      email: "info@autopartsdoha.qa",
      website: "www.autopartsdoha.qa",
      workingHours: "Sat–Thu: 8:00 AM – 9:00 PM\nFri: 2:00 PM – 9:00 PM",
      isVerified: true,
      responseRate: 98,
      totalSales: 342,
      avgRating: 4.8,
      lat: 25.2854,
      lng: 51.531,
    },
  });

  const store2 = await prisma.store.upsert({
    where: { slug: "parts-zone-qatar" },
    update: {},
    create: {
      userId: seller2.id,
      name: "Parts Zone Qatar",
      slug: "parts-zone-qatar",
      description: "Wide selection of OEM and aftermarket parts for all vehicle makes and models. Fast delivery across Qatar.",
      city: "Al Rayyan",
      country: "Qatar",
      address: "Al Rayyan Road, Al Rayyan, Qatar",
      phone: "+974 4444 6789",
      email: "info@partszoneqatar.qa",
      workingHours: "Sat–Thu: 9:00 AM – 8:00 PM",
      isVerified: true,
      responseRate: 94,
      totalSales: 218,
      avgRating: 4.6,
      lat: 25.2916,
      lng: 51.4209,
    },
  });
  console.log("✅ 2 stores");

  // ── Products ──────────────────────────────────────────────
  const acCategoryId = categories.find(c => c.slug === "ac-heating")!.id;
  const engCategoryId = categories.find(c => c.slug === "engine")!.id;
  const brakesCategoryId = categories.find(c => c.slug === "brakes")!.id;
  const filtersCategoryId = categories.find(c => c.slug === "filters")!.id;

  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "oem-ac-compressor-toyota-lc-2016-s1" },
      update: {},
      create: {
        storeId: store1.id, categoryId: acCategoryId,
        title: "OEM AC Compressor — Toyota Land Cruiser 2016",
        slug: "oem-ac-compressor-toyota-lc-2016-s1",
        description: "Genuine OEM AC compressor for Toyota Land Cruiser 2016–2020. Part number 88320-6A320. Tested and working. Comes with 6-month warranty.",
        price: 850, originalPrice: 1450, currency: "QAR",
        condition: Condition.LIKE_NEW, partNumber: "88320-6A320",
        brand: "Toyota", carMake: "Toyota", carModel: "Land Cruiser",
        carYear: 2016, carYearTo: 2020,
        isFeatured: true, isActive: true, viewCount: 234,
        images: { create: [{ url: "/images/ac-compressor.jpg", isPrimary: true, sortOrder: 0 }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: "garrett-gt2554r-turbocharger" },
      update: {},
      create: {
        storeId: store1.id, categoryId: engCategoryId,
        title: "Garrett GT2554R Turbocharger",
        slug: "garrett-gt2554r-turbocharger",
        description: "High-performance Garrett GT2554R turbocharger. Suitable for Toyota Supra, Celica, MR2 2JZ-GTE applications. Excellent boost response.",
        price: 1250, originalPrice: 1800, currency: "QAR",
        condition: Condition.USED, partNumber: "GT2554R",
        brand: "Garrett", carMake: "Toyota", carModel: "Supra",
        carYear: 1993, carYearTo: 2002,
        isFeatured: true, isActive: true, viewCount: 189,
        images: { create: [{ url: "/images/turbocharger.jpg", isPrimary: true, sortOrder: 0 }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: "brembo-front-brake-kit" },
      update: {},
      create: {
        storeId: store2.id, categoryId: brakesCategoryId,
        title: "Brembo Front Brake Kit (2 Pcs)",
        slug: "brembo-front-brake-kit",
        description: "Genuine Brembo front brake disc kit. Pair of 2 discs. Fits BMW 3-Series F30 and F31. Factory OEM spec.",
        price: 1100, originalPrice: 1500, currency: "QAR",
        condition: Condition.NEW, partNumber: "09.9793.11",
        brand: "Brembo", carMake: "BMW", carModel: "3 Series",
        carYear: 2012, carYearTo: 2019,
        isFeatured: true, isActive: true, viewCount: 156,
        images: { create: [{ url: "/images/brake-kit.jpg", isPrimary: true, sortOrder: 0 }] },
      },
    }),
    prisma.product.upsert({
      where: { slug: "kn-performance-air-filter-toyota" },
      update: {},
      create: {
        storeId: store2.id, categoryId: filtersCategoryId,
        title: "K&N Performance Air Filter — Toyota",
        slug: "kn-performance-air-filter-toyota",
        description: "K&N high-flow air filter for Toyota Land Cruiser 200 Series. Washable and reusable. Improves airflow up to 50% over paper filters.",
        price: 180, originalPrice: 260, currency: "QAR",
        condition: Condition.NEW, partNumber: "33-2129",
        brand: "K&N", carMake: "Toyota", carModel: "Land Cruiser",
        carYear: 2008, carYearTo: 2021,
        isFeatured: true, isActive: true, viewCount: 312,
        images: { create: [{ url: "/images/air-filter.jpg", isPrimary: true, sortOrder: 0 }] },
      },
    }),
  ]);
  console.log(`✅ ${products.length} products`);

  // ── Reviews ───────────────────────────────────────────────
  await Promise.all([
    prisma.review.upsert({
      where: { id: "rev-seed-1" },
      update: {},
      create: {
        id: "rev-seed-1",
        storeId: store1.id, userId: buyer1.id,
        rating: 5,
        comment: "Excellent service and genuine parts. The AC compressor I bought works perfectly. Delivery was on time and well packed.",
      },
    }),
    prisma.review.upsert({
      where: { id: "rev-seed-2" },
      update: {},
      create: {
        id: "rev-seed-2",
        storeId: store1.id, userId: seller2.id,
        rating: 4,
        comment: "Good quality parts, fast response. Slight delay in delivery but overall a positive experience.",
      },
    }),
  ]);
  console.log("✅ 2 reviews");

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
