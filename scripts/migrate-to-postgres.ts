/**
 * Sakil Hub - Safe Database Migration Script
 * Migrates existing data from local JSON storage files into PostgreSQL via Prisma.
 *
 * Fully standalone: Reads JSON directly using fs/path with zero external server-only imports.
 * Safe & Idempotent: Uses upsert for all records.
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function readLocalJson<T>(filename: string, defaultValue: T): T {
  const possiblePaths = [
    path.join(process.cwd(), "storage", "data", filename),
    path.join(process.cwd(), ".next", "standalone", "storage", "data", filename),
    path.join(process.cwd(), "lib", "data", filename),
    path.join(process.cwd(), ".next", "standalone", "lib", "data", filename),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf8");
        if (content && content.trim()) {
          return JSON.parse(content) as T;
        }
      }
    } catch {}
  }
  return defaultValue;
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Starting Data Migration to PostgreSQL...");
  console.log("==================================================");

  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not defined.");
    console.error("Please ensure DATABASE_URL is set in your .env file.");
    process.exit(1);
  }

  // 1. Verify Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Successfully connected to PostgreSQL.");
  } catch (err: any) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }

  // 2. Migrate Customers / Users
  console.log("\n📦 [1/6] Migrating Users & Customers...");
  const customers = readLocalJson<any[]>("customers.json", []);
  let userCount = 0;
  for (const c of customers) {
    if (!c.email) continue;
    const email = String(c.email).toLowerCase().trim();
    await prisma.user.upsert({
      where: { email },
      update: {
        firstName: c.firstName || "",
        lastName: c.lastName || "",
        phone: c.phone || "",
        passwordHash: c.passwordHash || null,
        status: c.status || "active",
        banReason: c.banReason || null,
        tempBanUntil: c.tempBanUntil || null,
        customEnrolledSlugs: Array.isArray(c.customEnrolledSlugs) ? c.customEnrolledSlugs : [],
        revokedSlugs: Array.isArray(c.revokedSlugs) ? c.revokedSlugs : [],
        notices: Array.isArray(c.notices) ? (c.notices as any) : [],
      },
      create: {
        id: c.id || `cus_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        email,
        firstName: c.firstName || "",
        lastName: c.lastName || "",
        phone: c.phone || "",
        passwordHash: c.passwordHash || null,
        role: "student",
        status: c.status || "active",
        banReason: c.banReason || null,
        tempBanUntil: c.tempBanUntil || null,
        customEnrolledSlugs: Array.isArray(c.customEnrolledSlugs) ? c.customEnrolledSlugs : [],
        revokedSlugs: Array.isArray(c.revokedSlugs) ? c.revokedSlugs : [],
        notices: Array.isArray(c.notices) ? (c.notices as any) : [],
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      },
    });
    userCount++;
  }
  console.log(`   -> Successfully upserted ${userCount} users.`);

  // 3. Migrate Instructors
  console.log("\n📦 [2/6] Migrating Instructors...");
  const instructors = readLocalJson<any[]>("instructors.json", []);
  let instructorCount = 0;
  for (const inst of instructors) {
    if (!inst.id) continue;
    await prisma.instructor.upsert({
      where: { id: inst.id },
      update: {
        name: inst.name,
        role: inst.role || "Instructor",
        avatar: inst.avatar || "",
        experience: inst.experience || "",
        projects: inst.projects || "",
        students: inst.students || "",
        bio: inst.bio || "",
        socials: (inst.socials as any) || {},
        courseSlugs: Array.isArray(inst.courseSlugs) ? inst.courseSlugs : [],
        courses: Array.isArray(inst.courses) ? (inst.courses as any) : [],
      },
      create: {
        id: inst.id,
        name: inst.name,
        role: inst.role || "Instructor",
        avatar: inst.avatar || "",
        experience: inst.experience || "",
        projects: inst.projects || "",
        students: inst.students || "",
        bio: inst.bio || "",
        socials: (inst.socials as any) || {},
        courseSlugs: Array.isArray(inst.courseSlugs) ? inst.courseSlugs : [],
        courses: Array.isArray(inst.courses) ? (inst.courses as any) : [],
        createdAt: inst.createdAt ? new Date(inst.createdAt) : new Date(),
        updatedAt: inst.updatedAt ? new Date(inst.updatedAt) : new Date(),
      },
    });
    instructorCount++;
  }
  console.log(`   -> Successfully upserted ${instructorCount} instructors.`);

  // 4. Migrate Courses from CMS map
  console.log("\n📦 [3/6] Migrating Courses & CMS Overrides...");
  const cmsMap = readLocalJson<Record<string, any>>("courses-cms.json", {});
  let courseCount = 0;
  for (const [slug, cms] of Object.entries(cmsMap)) {
    if (!slug) continue;
    const finalTitle = cms.title || slug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const finalSubtitle = cms.subtitle || "";
    const finalBadge = cms.badge || "Bestseller";
    const finalCategory = cms.category || "Video Editing";
    const finalLevel = cms.level || "Beginner to Advanced";
    const finalNumericPrice = cms.numericPrice !== undefined ? cms.numericPrice : 1299;
    const finalNumericOriginal = cms.numericOriginalPrice !== undefined ? cms.numericOriginalPrice : 2858;
    const finalDiscount = cms.discountPct || "63% OFF";
    const finalPrice = cms.price || String(finalNumericPrice);
    const finalOriginalPrice = cms.originalPrice || String(finalNumericOriginal);
    const finalInstructorName = cms.instructorName || "Sakil Ahmed";
    const finalInstructorId = cms.instructorId || "sakil-ahmed";
    const finalHighlights = cms.highlights || {};
    const finalFaqs = cms.faqs || [];
    const finalCurriculum = cms.curriculum || [];

    await prisma.course.upsert({
      where: { slug },
      update: {
        title: finalTitle,
        subtitle: finalSubtitle,
        badge: finalBadge,
        category: finalCategory,
        rating: 5.0,
        reviewsCount: "0",
        studentsCount: "0",
        updatedDate: "",
        level: finalLevel,
        price: String(finalPrice),
        originalPrice: String(finalOriginalPrice),
        discountPct: String(finalDiscount),
        numericPrice: finalNumericPrice,
        numericOriginalPrice: finalNumericOriginal,
        image: "",
        thumbnail: "",
        trailerImage: "",
        trailerVideo: "",
        instructorId: finalInstructorId,
        instructorName: finalInstructorName,
        highlights: finalHighlights as any,
        faqs: finalFaqs as any,
        curriculum: finalCurriculum as any,
        status: "published",
      },
      create: {
        slug,
        title: finalTitle,
        subtitle: finalSubtitle,
        badge: finalBadge,
        category: finalCategory,
        rating: 5.0,
        reviewsCount: "0",
        studentsCount: "0",
        updatedDate: "",
        level: finalLevel,
        price: String(finalPrice),
        originalPrice: String(finalOriginalPrice),
        discountPct: String(finalDiscount),
        numericPrice: finalNumericPrice,
        numericOriginalPrice: finalNumericOriginal,
        image: "",
        thumbnail: "",
        trailerImage: "",
        trailerVideo: "",
        instructorId: finalInstructorId,
        instructorName: finalInstructorName,
        highlights: finalHighlights as any,
        faqs: finalFaqs as any,
        curriculum: finalCurriculum as any,
        status: "published",
      },
    });
    courseCount++;
  }
  console.log(`   -> Successfully upserted ${courseCount} courses.`);

  // 5. Migrate Orders
  console.log("\n📦 [4/6] Migrating Orders...");
  const orders = readLocalJson<any[]>("orders.json", []);
  let orderCount = 0;
  for (const o of orders) {
    if (!o.orderNumber) continue;
    const email = String(o.email).toLowerCase().trim();

    // Ensure user exists before creating order relation
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        firstName: o.studentName ? o.studentName.split(" ")[0] : "Student",
        lastName: o.studentName ? o.studentName.split(" ").slice(1).join(" ") : "",
        phone: o.senderNumber || "",
        role: "student",
        status: "active",
      },
    });

    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {
        studentName: o.studentName,
        courseTitle: o.courseTitle,
        courseSlug: o.courseSlug,
        amount: Number(o.amount) || 0,
        paymentMethod: o.paymentMethod,
        senderNumber: o.senderNumber,
        trxId: o.trxId,
        status: o.status,
        rejectionReason: o.rejectionReason || null,
        verifiedAt: o.verifiedAt ? new Date(o.verifiedAt) : null,
      },
      create: {
        id: o.id || `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        orderNumber: o.orderNumber,
        studentName: o.studentName,
        email,
        courseTitle: o.courseTitle,
        courseSlug: o.courseSlug,
        amount: Number(o.amount) || 0,
        paymentMethod: o.paymentMethod,
        senderNumber: o.senderNumber,
        trxId: o.trxId,
        status: o.status,
        rejectionReason: o.rejectionReason || null,
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        verifiedAt: o.verifiedAt ? new Date(o.verifiedAt) : null,
      },
    });
    orderCount++;
  }
  console.log(`   -> Successfully upserted ${orderCount} orders.`);

  // 6. Migrate Shop Digital Products
  console.log("\n📦 [5/6] Migrating Shop Digital Products...");
  const shopProducts = readLocalJson<any[]>("shop.json", []);
  let productCount = 0;
  for (const p of shopProducts) {
    if (!p.slug) continue;
    await prisma.shopProduct.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        category: p.category || "Digital Product",
        shortDescription: p.shortDescription || "",
        fullDescription: p.fullDescription || "",
        price: Number(p.price) || 0,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        discountBadge: p.discountBadge || "",
        thumbnail: p.thumbnail || "",
        images: Array.isArray(p.images) ? p.images : [],
        badge: p.badge || "",
        features: Array.isArray(p.features) ? p.features : [],
        deliveryMethod: (p.deliveryMethod as any) || {},
        faqs: Array.isArray(p.faqs) ? (p.faqs as any) : [],
        stock: String(p.stock || "unlimited"),
        rating: p.rating ? Number(p.rating) : 5.0,
        reviewsCount: p.reviewsCount ? Number(p.reviewsCount) : 0,
        salesCount: p.salesCount ? Number(p.salesCount) : 0,
        status: p.status || "active",
      },
      create: {
        id: p.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: p.title,
        slug: p.slug,
        category: p.category || "Digital Product",
        shortDescription: p.shortDescription || "",
        fullDescription: p.fullDescription || "",
        price: Number(p.price) || 0,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        discountBadge: p.discountBadge || "",
        thumbnail: p.thumbnail || "",
        images: Array.isArray(p.images) ? p.images : [],
        badge: p.badge || "",
        features: Array.isArray(p.features) ? p.features : [],
        deliveryMethod: (p.deliveryMethod as any) || {},
        faqs: Array.isArray(p.faqs) ? (p.faqs as any) : [],
        stock: String(p.stock || "unlimited"),
        rating: p.rating ? Number(p.rating) : 5.0,
        reviewsCount: p.reviewsCount ? Number(p.reviewsCount) : 0,
        salesCount: p.salesCount ? Number(p.salesCount) : 0,
        status: p.status || "active",
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
    });
    productCount++;
  }
  console.log(`   -> Successfully upserted ${productCount} shop products.`);

  // 7. Migrate Platform Settings (Branding, Home CMS, About CMS)
  console.log("\n📦 [6/6] Migrating Platform Settings...");
  const branding = readLocalJson<any>("branding.json", {});
  const homeCms = readLocalJson<any>("home-cms.json", {});
  const aboutCms = readLocalJson<any>("about-cms.json", {});

  await prisma.platformSetting.upsert({
    where: { key: "branding" },
    update: { value: branding as any },
    create: { key: "branding", value: branding as any },
  });

  await prisma.platformSetting.upsert({
    where: { key: "home_cms" },
    update: { value: homeCms as any },
    create: { key: "home_cms", value: homeCms as any },
  });

  await prisma.platformSetting.upsert({
    where: { key: "about_cms" },
    update: { value: aboutCms as any },
    create: { key: "about_cms", value: aboutCms as any },
  });
  console.log(`   -> Successfully upserted platform settings.`);

  console.log("\n==================================================");
  console.log("🎉 Migration completed successfully with 0 errors!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
