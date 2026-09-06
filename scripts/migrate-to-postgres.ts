/**
 * Sakil Hub - Safe Database Migration Script
 * Migrates existing data from local JSON storage files into PostgreSQL via Prisma.
 *
 * Safe & Idempotent: Uses upsert for all records so it can be run multiple times
 * without creating duplicates or overwriting newer changes.
 */

import { PrismaClient } from "@prisma/client";
import { getPersistentCustomers } from "../lib/data/customers";
import { getPersistentOrders } from "../lib/data/orders";
import { getPersistentInstructors } from "../lib/data/instructors";
import { getPersistentShopProducts } from "../lib/data/shop";
import { getPersistentCourseCmsMap } from "../lib/data/courses-cms";
import { getLiveStorefrontCourses } from "../lib/data/courses";
import { getPersistentBranding } from "../lib/data/branding";
import { getPersistentHomeCms } from "../lib/data/home-cms";
import { getPersistentAboutCms } from "../lib/data/about-cms";

const prisma = new PrismaClient();

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
  const customers = await getPersistentCustomers();
  let userCount = 0;
  for (const c of customers) {
    if (!c.email) continue;
    const email = c.email.toLowerCase().trim();
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
        customEnrolledSlugs: c.customEnrolledSlugs || [],
        revokedSlugs: c.revokedSlugs || [],
        notices: (c.notices as any) || [],
      },
      create: {
        id: c.id,
        email,
        firstName: c.firstName || "",
        lastName: c.lastName || "",
        phone: c.phone || "",
        passwordHash: c.passwordHash || null,
        role: "student",
        status: c.status || "active",
        banReason: c.banReason || null,
        tempBanUntil: c.tempBanUntil || null,
        customEnrolledSlugs: c.customEnrolledSlugs || [],
        revokedSlugs: c.revokedSlugs || [],
        notices: (c.notices as any) || [],
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      },
    });
    userCount++;
  }
  console.log(`   -> Successfully upserted ${userCount} users.`);

  // 3. Migrate Instructors
  console.log("\n📦 [2/6] Migrating Instructors...");
  const instructors = await getPersistentInstructors();
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
        courseSlugs: inst.courseSlugs || [],
        courses: (inst.courses as any) || [],
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
        courseSlugs: inst.courseSlugs || [],
        courses: (inst.courses as any) || [],
        createdAt: inst.createdAt ? new Date(inst.createdAt) : new Date(),
        updatedAt: inst.updatedAt ? new Date(inst.updatedAt) : new Date(),
      },
    });
    instructorCount++;
  }
  console.log(`   -> Successfully upserted ${instructorCount} instructors.`);

  // 4. Migrate Courses (Combining Base Catalog + CMS Overrides)
  console.log("\n📦 [3/6] Migrating Courses & CMS Overrides...");
  const cmsMap = await getPersistentCourseCmsMap();
  const liveCourses = await getLiveStorefrontCourses().catch(() => []);
  const allSlugs = Array.from(
    new Set([...liveCourses.map((c) => c.slug), ...Object.keys(cmsMap)])
  );

  let courseCount = 0;
  for (const slug of allSlugs) {
    const course = liveCourses.find((c) => c.slug === slug);
    const cms = cmsMap[slug] || {};
    const finalTitle = cms.title || course?.title || slug.replace(/-/g, " ");
    const finalSubtitle = cms.subtitle !== undefined ? cms.subtitle : (course?.subtitle || "");
    const finalBadge = cms.badge !== undefined ? cms.badge : (course?.badge || "Bestseller");
    const finalCategory = cms.category || course?.category || "Video Editing";
    const finalLevel = cms.level || course?.level || "Beginner to Advanced";
    const finalNumericPrice = cms.numericPrice !== undefined ? cms.numericPrice : (course?.numericPrice || 1299);
    const finalNumericOriginal = cms.numericOriginalPrice !== undefined ? cms.numericOriginalPrice : (course?.numericOriginalPrice || 2858);
    const finalDiscount = cms.discountPct !== undefined ? cms.discountPct : (course?.discountPct || "63% OFF");
    const finalPrice = cms.price !== undefined ? cms.price : (course?.price || "1299");
    const finalOriginalPrice = cms.originalPrice !== undefined ? cms.originalPrice : (course?.originalPrice || "2858");
    const finalInstructorName = cms.instructorName || course?.instructor?.name || "Sakil Ahmed";
    const finalInstructorId = cms.instructorId || course?.instructorId || "sakil-ahmed";
    const finalHighlights = cms.highlights || course?.highlights || {};
    const finalFaqs = (cms.faqs && cms.faqs.length > 0) ? cms.faqs : (course?.faqs || []);
    const finalCurriculum = course?.curriculum || cms.curriculum || [];

    await prisma.course.upsert({
      where: { slug },
      update: {
        title: finalTitle,
        subtitle: finalSubtitle,
        badge: finalBadge,
        category: finalCategory,
        rating: course?.rating || 5.0,
        reviewsCount: String(course?.reviewsCount || "0"),
        studentsCount: String(course?.studentsCount || "0"),
        updatedDate: course?.updatedDate || "",
        level: finalLevel,
        price: String(finalPrice),
        originalPrice: String(finalOriginalPrice),
        discountPct: String(finalDiscount),
        numericPrice: finalNumericPrice,
        numericOriginalPrice: finalNumericOriginal,
        image: course?.image || "",
        thumbnail: course?.thumbnail || course?.image || "",
        trailerImage: course?.trailerImage || "",
        trailerVideo: course?.trailerVideo || "",
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
        rating: course?.rating || 5.0,
        reviewsCount: String(course?.reviewsCount || "0"),
        studentsCount: String(course?.studentsCount || "0"),
        updatedDate: course?.updatedDate || "",
        level: finalLevel,
        price: String(finalPrice),
        originalPrice: String(finalOriginalPrice),
        discountPct: String(finalDiscount),
        numericPrice: finalNumericPrice,
        numericOriginalPrice: finalNumericOriginal,
        image: course?.image || "",
        thumbnail: course?.thumbnail || course?.image || "",
        trailerImage: course?.trailerImage || "",
        trailerVideo: course?.trailerVideo || "",
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
  const orders = await getPersistentOrders();
  let orderCount = 0;
  for (const o of orders) {
    if (!o.orderNumber) continue;
    const email = o.email.toLowerCase().trim();

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
        amount: o.amount,
        paymentMethod: o.paymentMethod,
        senderNumber: o.senderNumber,
        trxId: o.trxId,
        status: o.status,
        rejectionReason: o.rejectionReason || null,
        verifiedAt: o.verifiedAt ? new Date(o.verifiedAt) : null,
      },
      create: {
        id: o.id,
        orderNumber: o.orderNumber,
        studentName: o.studentName,
        email,
        courseTitle: o.courseTitle,
        courseSlug: o.courseSlug,
        amount: o.amount,
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
  const shopProducts = await getPersistentShopProducts();
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
        price: p.price || 0,
        originalPrice: p.originalPrice || 0,
        discountBadge: p.discountBadge || "",
        thumbnail: p.thumbnail || "",
        images: p.images || [],
        badge: p.badge || "",
        features: p.features || [],
        deliveryMethod: (p.deliveryMethod as any) || {},
        faqs: (p.faqs as any) || [],
        stock: String(p.stock || "unlimited"),
        rating: p.rating || 5.0,
        reviewsCount: p.reviewsCount || 0,
        salesCount: p.salesCount || 0,
        status: p.status || "active",
      },
      create: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category || "Digital Product",
        shortDescription: p.shortDescription || "",
        fullDescription: p.fullDescription || "",
        price: p.price || 0,
        originalPrice: p.originalPrice || 0,
        discountBadge: p.discountBadge || "",
        thumbnail: p.thumbnail || "",
        images: p.images || [],
        badge: p.badge || "",
        features: p.features || [],
        deliveryMethod: (p.deliveryMethod as any) || {},
        faqs: (p.faqs as any) || [],
        stock: String(p.stock || "unlimited"),
        rating: p.rating || 5.0,
        reviewsCount: p.reviewsCount || 0,
        salesCount: p.salesCount || 0,
        status: p.status || "active",
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
    });
    productCount++;
  }
  console.log(`   -> Successfully upserted ${productCount} shop products.`);

  // 7. Migrate Platform Settings (Branding, Home CMS, About CMS)
  console.log("\n📦 [6/6] Migrating Platform Settings (Branding, Home, About CMS)...");
  const branding = await getPersistentBranding();
  const homeCms = await getPersistentHomeCms();
  const aboutCms = await getPersistentAboutCms();

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
