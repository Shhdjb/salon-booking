import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@salonshahd.com" },
    update: {
      role: "ADMIN",
      passwordHash,
      deletedAt: null,
      name: "مدير الصالون",
    },
    create: {
      name: "مدير الصالون",
      email: "admin@salonshahd.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin user:", admin.email, "(password reset to admin123 if existed)");

  const services = [
    {
      name: "ليزر",
      description:
        "إزالة الشعر بالليزر بأحدث التقنيات. نتائج دائمة وناعمة مع رعاية فائقة لبشرتك.",
      duration: 45,
      price: 350,
      category: "العناية بالبشرة",
    },
    {
      name: "قص شعر",
      description:
        "قص احترافي يناسب شكل وجهكِ وأسلوب حياتك. يشمل الغسيل والتجفيف والتنسيق النهائي.",
      duration: 60,
      price: 120,
      category: "الشعر",
    },
    {
      name: "صبغة",
      description:
        "صبغة شعر فاخرة بألوان طبيعية ومتجددة. نستخدم أفضل المنتجات للحفاظ على صحة شعركِ.",
      duration: 120,
      price: 250,
      category: "الشعر",
    },
    {
      name: "إزالة الشعر بالشمع",
      description:
        "إزالة الشعر بالشمع الطبيعي للحصول على بشرة ناعمة لفترة أطول.",
      duration: 45,
      price: 100,
      category: "العناية بالجسم",
    },
    {
      name: "فرد الشعر",
      description:
        "فرد الشعر الاحترافي لنتائج ناعمة ولامعة تدوم لأسابيع. علاج كيراتين فاخر.",
      duration: 180,
      price: 400,
      category: "الشعر",
    },
    {
      name: "تسريحات للمناسبات",
      description: "تسريحات فاخرة للمناسبات الخاصة: أعراس، حفلات، ومناسبات.",
      duration: 90,
      price: 220,
      category: "التسريحات",
    },
    {
      name: "تسريحات يومية وضفائر",
      description: "ضفائر أنيقة وتسريحات يومية عملية.",
      duration: 60,
      price: 90,
      category: "التسريحات",
    },
    {
      name: "علاج البشرة",
      description: "تنظيف عميق للبشرة مع علاجات مخصصة. بشرة متجددة ومشرقة.",
      duration: 75,
      price: 160,
      category: "العناية بالبشرة",
    },
    {
      name: "تمليس الشعر لفترة طويلة",
      description: "تمليس احترافي لشعر ناعم وحريري يدوم أشهراً. علاج مكثف بمنتجات فاخرة لنتائج طويلة المدى.",
      duration: 180,
      price: 450,
      category: "الشعر",
    },
    {
      name: "مكياج",
      description: "مكياج احترافي للمناسبات واليوميات. إطلالة متكاملة تناسبكِ.",
      duration: 60,
      price: 150,
      category: "التجميل",
    },
    {
      name: "تلبيس شالات",
      description: "لفّ وتنسيق الشالات بأناقة. إطلالة عربية أصيلة تناسب المناسبات.",
      duration: 45,
      price: 90,
      category: "الإكسسوارات",
    },
  ];

  const existingServices = await prisma.service.count();
  if (existingServices === 0) {
    await prisma.service.createMany({
      data: services.map((s) => ({
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
        category: s.category,
      })),
    });
    console.log("Services created");
  } else {
    const newServices = [
      { name: "تمليس الشعر لفترة طويلة", description: "تمليس احترافي لشعر ناعم وحريرי يدوم أشهراً. علاج مكثف بمنتجات فاخرة لنتائج طويلة المدى.", duration: 180, price: 450, category: "الشعر" },
      { name: "مكياج", description: "مكياج احترافي للمناسبات واليوميات. إطلالة متكاملة تناسبكِ.", duration: 60, price: 150, category: "التجميل" },
      { name: "تلبيس شالات", description: "لفّ وتنسيق الشالات بأناقة. إطلالة عربية أصيلة تناسب المناسبات.", duration: 45, price: 90, category: "الإكسسوارات" },
    ];
    for (const s of newServices) {
      const exists = await prisma.service.findFirst({ where: { name: s.name } });
      if (!exists) {
        await prisma.service.create({ data: s });
        console.log("Added service:", s.name);
      }
    }
  }

  const workingHours = [
    { dayOfWeek: 0, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
    { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isClosed: true },
    { dayOfWeek: 6, openTime: "09:00", closeTime: "18:00", isClosed: false },
  ];

  for (const wh of workingHours) {
    await prisma.workingHour.upsert({
      where: { dayOfWeek: wh.dayOfWeek },
      update: wh,
      create: wh,
    });
  }

  console.log("Working hours created");

  const allServices = await prisma.service.findMany({ take: 2 });
  if (allServices.length >= 2) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    await prisma.appointment.createMany({
      data: [
        {
          serviceId: allServices[0].id,
          customerName: "مريم أحمد",
          phone: "+972501234567",
          date: dateStr,
          startTime: "10:00",
          endTime: "11:00",
          status: "confirmed",
          originalPrice: allServices[0].price,
          finalPrice: allServices[0].price,
        },
        {
          serviceId: allServices[1].id,
          customerName: "لينا محمد",
          phone: "+972559876543",
          date: tomorrowStr,
          startTime: "14:00",
          endTime: "14:45",
          status: "pending",
          originalPrice: allServices[1].price,
          finalPrice: allServices[1].price,
        },
      ],
    });
    console.log("Sample appointments created");
  }

  const existingBlocked = await prisma.blockedTime.count();
  if (existingBlocked === 0) {
      await prisma.blockedTime.create({
      data: {
        date: new Date().toISOString().split("T")[0],
        startTime: "12:00",
        endTime: "14:00",
        reason: "اجتماع فريق العمل",
      },
    });
    console.log("Blocked time created");
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
