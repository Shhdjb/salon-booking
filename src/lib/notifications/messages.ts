/**
 * Message templates for SALON SHAHD notifications
 * موعد / زيارة / حجز
 */

import type { NotificationType } from "@prisma/client";

const SALON = "صالون شهد";

export function getMessageForType(
  type: NotificationType,
  data: {
    customerName?: string;
    serviceName?: string;
    date?: string;
    time?: string;
    extra?: string;
  }
): { title: string; body: string; smsBody: string } {
  const { customerName = "", serviceName = "", date = "", time = "", extra = "" } = data;

  const templates: Record<
    NotificationType,
    { title: string; body: string; smsBody: string }
  > = {
    APPOINTMENT_CREATED: {
      title: "تم إنشاء موعدكِ",
      body: `مرحباً ${customerName}، تم إنشاء موعدكِ في ${SALON}. الخدمة: ${serviceName}، التاريخ: ${date}، الوقت: ${time}. نتطلع لرؤيتكِ.`,
      smsBody: `${SALON}: تم إنشاء موعدكِ - ${serviceName} يوم ${date} الساعة ${time}. نتطلع لرؤيتكِ.`,
    },
    APPOINTMENT_CONFIRMED: {
      title: "تأكيد الموعد",
      body: `مرحباً ${customerName}، تم تأكيد موعدكِ في ${SALON}. الخدمة: ${serviceName}، التاريخ: ${date}، الوقت: ${time}.`,
      smsBody: `${SALON}: تم تأكيد موعدكِ - ${serviceName} يوم ${date} الساعة ${time}.`,
    },
    APPOINTMENT_REMINDER: {
      title: "تذكير بالموعد",
      body: `مرحباً ${customerName}، تذكير: موعدكِ خلال 24 ساعة في ${SALON} — ${serviceName} يوم ${date} الساعة ${time}. نتطلع لرؤيتكِ.`,
      smsBody: `${SALON}: تذكير — موعدكِ خلال 24 ساعة: ${serviceName} ${date} الساعة ${time}.`,
    },
    APPOINTMENT_MODIFIED: {
      title: "تعديل الموعد",
      body: `مرحباً ${customerName}، تم تعديل موعدكِ في ${SALON}. ${extra || `الخدمة: ${serviceName}، التاريخ: ${date}، الوقت: ${time}.`}`,
      smsBody: `${SALON}: تم تعديل موعدكِ. ${extra || `${serviceName} - ${date} ${time}`}.`,
    },
    APPOINTMENT_CANCELLED: {
      title: "إلغاء الموعد",
      body: `مرحباً ${customerName}، تم إلغاء موعدكِ في ${SALON}. ${extra || "للاستفسار تواصلي معنا."}`,
      smsBody: `${SALON}: تم إلغاء موعدكِ. ${extra || "للاستفسار تواصلي معنا."}`,
    },
    VISIT_COMPLETED: {
      title: "اكتمال الزيارة",
      body: `مرحباً ${customerName}، شكراً لزيارتكِ ${SALON}. نتمنى أن تكوني قد استمتعتي بخدماتنا. نتطلع لرؤيتكِ مجدداً.`,
      smsBody: `${SALON}: شكراً لزيارتكِ. نتمنى أن تكوني قد استمتعتي. نتطلع لرؤيتكِ مجدداً.`,
    },
    APPOINTMENT_COMPLETED: {
      title: "اكتمال الموعد",
      body: `مرحباً ${customerName}، تم تسجيل اكتمال موعدكِ في ${SALON}. شكراً لثقتكِ بنا — ${serviceName}.`,
      smsBody: `${SALON}: تم تسجيل اكتمال موعدكِ. شكراً لزيارتكِ — ${serviceName}.`,
    },
    LOYALTY_UPDATE: {
      title: "تحديث بطاقة الولاء",
      body: `مرحباً ${customerName}، ${extra || "تم تحديث نقاط الولاء الخاصة بكِ."} ${SALON}`,
      smsBody: `${SALON}: ${extra || "تحديث بطاقة الولاء."}`,
    },
    LOYALTY_REWARD_UNLOCKED: {
      title: "مكافأة ولاء جديدة",
      body: `مرحباً ${customerName}، ${extra || "لقد فتحتِ مستوى ولاء جديداً في صالون شهد!"}`,
      smsBody: `${SALON}: ${extra || "مستوى ولاء جديد!"}`,
    },
  };

  return templates[type];
}
