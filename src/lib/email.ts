// This file is server-only
import "server-only";

import { Resend } from "resend";

// Singleton instance
let resendClient: Resend | null = null;

function getResend(): Resend {
	if (resendClient) {
		return resendClient;
	}

	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		throw new Error("Missing RESEND_API_KEY environment variable");
	}

	resendClient = new Resend(apiKey);
	return resendClient;
}

interface SendConfirmationEmailParams {
	to: string;
	name: string;
	role: string;
	talentId: string;
	language: "en" | "ar";
}

// Email templates for different languages
const emailTemplates = {
	en: {
		subject: "We received your application – Jeem",
		getHtml: (firstName: string, role: string) => `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">Hey ${firstName} 👋</h1>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    Thanks for applying to join Jeem as a <strong>${role}</strong>. We've received your application and it's now in our review queue.
  </p>
  
  <div style="background: #f5f5f4; border-radius: 8px; padding: 20px; margin: 24px 0;">
    <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What happens next?</h2>
    <ol style="margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;">We review your portfolio and application (2-3 business days)</li>
      <li style="margin-bottom: 8px;">If there's a fit, we'll schedule a quick intro call</li>
      <li style="margin-bottom: 8px;">You get matched with projects that suit your skills</li>
    </ol>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    We review every application personally, so please be patient. If you don't hear from us within a week, feel free to reply to this email.
  </p>
  
  <p style="margin: 24px 0 0 0; color: #666;">
    – The Jeem Team
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
  
  <p style="font-size: 12px; color: #999; margin: 0;">
    You received this email because you applied to join Jeem. If you didn't apply, you can safely ignore this email.
  </p>
</body>
</html>
		`,
		getText: (firstName: string, role: string) => `Hey ${firstName}!

Thanks for applying to join Jeem as a ${role}. We've received your application and it's now in our review queue.

What happens next?
1. We review your portfolio and application (2-3 business days)
2. If there's a fit, we'll schedule a quick intro call
3. You get matched with projects that suit your skills

We review every application personally, so please be patient. If you don't hear from us within a week, feel free to reply to this email.

– The Jeem Team
		`
	},
	ar: {
		subject: "استلمنا طلبك – Jeem",
		getHtml: (firstName: string, role: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', sans-serif; line-height: 1.8; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; direction: rtl; text-align: right;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">أهلاً ${firstName} 👋</h1>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    شكراً لتقديمك على Jeem كـ <strong>${role}</strong>. استلمنا طلبك وهو الآن في قائمة المراجعة.
  </p>
  
  <div style="background: #f5f5f4; border-radius: 8px; padding: 20px; margin: 24px 0;">
    <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">شو الخطوات الجاية؟</h2>
    <ol style="margin: 0; padding-right: 20px; padding-left: 0;">
      <li style="margin-bottom: 8px;">نراجع البورتفوليو والطلب (٢-٣ أيام عمل)</li>
      <li style="margin-bottom: 8px;">إذا في توافق، بنحدد مكالمة تعارف قصيرة</li>
      <li style="margin-bottom: 8px;">بنوصلك بمشاريع تناسب مهاراتك</li>
    </ol>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    نراجع كل طلب شخصياً، فنرجو الصبر. إذا ما وصلك رد خلال أسبوع، رد على هذا الإيميل.
  </p>
  
  <p style="margin: 24px 0 0 0; color: #666;">
    – فريق Jeem
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
  
  <p style="font-size: 12px; color: #999; margin: 0;">
    وصلك هذا الإيميل لأنك قدّمت على Jeem. إذا ما قدّمت، تجاهل هذا الإيميل.
  </p>
</body>
</html>
		`,
		getText: (firstName: string, role: string) => `أهلاً ${firstName}!

شكراً لتقديمك على Jeem كـ ${role}. استلمنا طلبك وهو الآن في قائمة المراجعة.

شو الخطوات الجاية؟
١. نراجع البورتفوليو والطلب (٢-٣ أيام عمل)
٢. إذا في توافق، بنحدد مكالمة تعارف قصيرة
٣. بنوصلك بمشاريع تناسب مهاراتك

نراجع كل طلب شخصياً، فنرجو الصبر. إذا ما وصلك رد خلال أسبوع، رد على هذا الإيميل.

– فريق Jeem
		`
	}
};

/**
 * Sends a confirmation email to a new talent applicant.
 * Returns { success: true } or { success: false, error: string }
 */
export async function sendConfirmationEmail({
	to,
	name,
	role,
	talentId,
	language = "en"
}: SendConfirmationEmailParams): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResend();

		// Use talent ID as idempotency key to prevent duplicate sends
		const idempotencyKey = `talent-confirmation-${talentId}`;

		const firstName = name.split(" ")[0];
		const template = emailTemplates[language];

		const { error } = await resend.emails.send({
			// TODO: Change to your verified domain (e.g., "Jeem <noreply@jeem.work>")
			// For testing, using Resend's test domain
			from: "Jeem <hello@jeem.now>",
			to: [to],
			subject: template.subject,
			headers: {
				"X-Idempotency-Key": idempotencyKey
			},
			html: template.getHtml(firstName, role),
			text: template.getText(firstName, role)
		});

		if (error) {
			console.error("Resend error:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Email send error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

// ============================================================================
// COMPANY CONFIRMATION EMAIL
// ============================================================================

interface SendCompanyConfirmationEmailParams {
	to: string;
	contactName: string;
	companyName: string;
	companyId: string;
	language: "en" | "ar";
}

const companyEmailTemplates = {
	en: {
		subject: "We received your inquiry – Jeem",
		getHtml: (firstName: string, companyName: string) => `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">Hey ${firstName} 👋</h1>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    Thanks for reaching out about hiring talent through Jeem for <strong>${companyName}</strong>. We've received your inquiry and it's now in our queue.
  </p>
  
  <div style="background: #f5f5f4; border-radius: 8px; padding: 20px; margin: 24px 0;">
    <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What happens next?</h2>
    <ol style="margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;">We review your requirements (within 24-48 hours)</li>
      <li style="margin-bottom: 8px;">We schedule a quick call to understand your needs better</li>
      <li style="margin-bottom: 8px;">We present you with pre-vetted candidates that match your criteria</li>
    </ol>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    We work with companies of all sizes and pride ourselves on matching you with talent that actually delivers. If you have any urgent questions, feel free to reply to this email.
  </p>
  
  <p style="margin: 24px 0 0 0; color: #666;">
    – The Jeem Team
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
  
  <p style="font-size: 12px; color: #999; margin: 0;">
    You received this email because you submitted an inquiry on Jeem. If you didn't submit this, you can safely ignore this email.
  </p>
</body>
</html>
		`,
		getText: (firstName: string, companyName: string) => `Hey ${firstName}!

Thanks for reaching out about hiring talent through Jeem for ${companyName}. We've received your inquiry and it's now in our queue.

What happens next?
1. We review your requirements (within 24-48 hours)
2. We schedule a quick call to understand your needs better
3. We present you with pre-vetted candidates that match your criteria

We work with companies of all sizes and pride ourselves on matching you with talent that actually delivers. If you have any urgent questions, feel free to reply to this email.

– The Jeem Team
		`
	},
	ar: {
		subject: "استلمنا طلبك – Jeem",
		getHtml: (firstName: string, companyName: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', sans-serif; line-height: 1.8; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; direction: rtl; text-align: right;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">أهلاً ${firstName} 👋</h1>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    شكراً لتواصلك معنا بخصوص توظيف مواهب من Jeem لـ <strong>${companyName}</strong>. استلمنا طلبك وهو الآن في قائمة المراجعة.
  </p>
  
  <div style="background: #f5f5f4; border-radius: 8px; padding: 20px; margin: 24px 0;">
    <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">شو الخطوات الجاية؟</h2>
    <ol style="margin: 0; padding-right: 20px; padding-left: 0;">
      <li style="margin-bottom: 8px;">نراجع متطلباتك (خلال ٢٤-٤٨ ساعة)</li>
      <li style="margin-bottom: 8px;">نحدد مكالمة قصيرة لفهم احتياجاتك بشكل أفضل</li>
      <li style="margin-bottom: 8px;">نعرض عليك مرشحين مفحوصين يطابقون معاييرك</li>
    </ol>
  </div>
  
  <p style="margin: 0 0 16px 0;">
    نشتغل مع شركات من كل الأحجام ونفتخر بتوصيلك بمواهب بتسلّم فعلاً. إذا عندك أي أسئلة عاجلة، رد على هذا الإيميل.
  </p>
  
  <p style="margin: 24px 0 0 0; color: #666;">
    – فريق Jeem
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
  
  <p style="font-size: 12px; color: #999; margin: 0;">
    وصلك هذا الإيميل لأنك قدّمت طلب على Jeem. إذا ما قدّمت، تجاهل هذا الإيميل.
  </p>
</body>
</html>
		`,
		getText: (firstName: string, companyName: string) => `أهلاً ${firstName}!

شكراً لتواصلك معنا بخصوص توظيف مواهب من Jeem لـ ${companyName}. استلمنا طلبك وهو الآن في قائمة المراجعة.

شو الخطوات الجاية؟
١. نراجع متطلباتك (خلال ٢٤-٤٨ ساعة)
٢. نحدد مكالمة قصيرة لفهم احتياجاتك بشكل أفضل
٣. نعرض عليك مرشحين مفحوصين يطابقون معاييرك

نشتغل مع شركات من كل الأحجام ونفتخر بتوصيلك بمواهب بتسلّم فعلاً. إذا عندك أي أسئلة عاجلة، رد على هذا الإيميل.

– فريق Jeem
		`
	}
};

/**
 * Sends a confirmation email to a company inquiry.
 */
export async function sendCompanyConfirmationEmail({
	to,
	contactName,
	companyName,
	companyId,
	language = "en"
}: SendCompanyConfirmationEmailParams): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResend();

		const idempotencyKey = `company-confirmation-${companyId}`;

		const firstName = contactName.split(" ")[0];
		const template = companyEmailTemplates[language];

		const { error } = await resend.emails.send({
			from: "Jeem <hello@jeem.now>",
			to: [to],
			subject: template.subject,
			headers: {
				"X-Idempotency-Key": idempotencyKey
			},
			html: template.getHtml(firstName, companyName),
			text: template.getText(firstName, companyName)
		});

		if (error) {
			console.error("Resend error:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Email send error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

// ============================================================================
// TALENT STATUS UPDATE EMAIL
// ============================================================================

type TalentStatus =
	| "under_review"
	| "screening"
	| "interviewing"
	| "training"
	| "pending_matching"
	| "matched"
	| "rejected";

interface SendTalentStatusUpdateEmailParams {
	to: string;
	name: string;
	role: string;
	talentId: string;
	newStatus: TalentStatus;
	language: "en" | "ar";
}

const talentStatusEmailContent = {
	en: {
		under_review: {
			subject: "Your application is under review – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `Your application for ${role} is currently being reviewed by our team. We'll update you soon!`,
				text: `Your application for ${role} is currently being reviewed by our team. We'll update you soon!`
			})
		},
		screening: {
			subject: "Screening in progress – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `Your ${role} application is being screened. We'll be in touch soon!`,
				text: `Your ${role} application is being screened. We'll be in touch soon!`
			})
		},
		interviewing: {
			subject: "Interview invitation – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `Great news ${firstName}! We'd like to schedule an interview with you for the ${role} position. Please book a 30-minute call with us using this link: <a href="https://calendly.com/jeem-team/30min" style="color: #2563eb;">https://calendly.com/jeem-team/30min</a>`,
				text: `Great news ${firstName}! We'd like to schedule an interview with you for the ${role} position. Please book a 30-minute call with us using this link: https://calendly.com/jeem-team/30min`
			})
		},
		training: {
			subject: "Welcome to Jeem training – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `Congratulations ${firstName}! You've been accepted into our training program for ${role}. We'll send you details about the next steps shortly.`,
				text: `Congratulations ${firstName}! You've been accepted into our training program for ${role}. We'll send you details about the next steps shortly.`
			})
		},
		pending_matching: {
			subject: "Ready for project matching – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `Great news ${firstName}! You're now in our talent pool and we're actively looking for projects that match your ${role} skills.`,
				text: `Great news ${firstName}! You're now in our talent pool and we're actively looking for projects that match your ${role} skills.`
			})
		},
		matched: {
			subject: "You've been matched with a project! – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `Exciting news ${firstName}! We've matched you with a project that fits your ${role} profile. We'll be reaching out with project details and next steps.`,
				text: `Exciting news ${firstName}! We've matched you with a project that fits your ${role} profile. We'll be reaching out with project details and next steps.`
			})
		},
		rejected: {
			subject: "Application update – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `Thank you for your interest in joining Jeem as a ${role}. Unfortunately, we won't be moving forward with your application at this time. We encourage you to apply again in the future as our needs evolve.`,
				text: `Thank you for your interest in joining Jeem as a ${role}. Unfortunately, we won't be moving forward with your application at this time. We encourage you to apply again in the future as our needs evolve.`
			})
		}
	},
	ar: {
		under_review: {
			subject: "طلبك قيد المراجعة – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `طلبك لـ ${role} قيد المراجعة من قبل فريقنا حالياً. راح نحدّثك قريباً!`,
				text: `طلبك لـ ${role} قيد المراجعة من قبل فريقنا حالياً. راح نحدّثك قريباً!`
			})
		},
		screening: {
			subject: "قيد الفحص – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `طلبك لـ ${role} قيد الفحص حالياً. راح نتواصل معك قريباً!`,
				text: `طلبك لـ ${role} قيد الفحص حالياً. راح نتواصل معك قريباً!`
			})
		},
		interviewing: {
			subject: "دعوة للمقابلة – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `خبر سار ${firstName}! نحب نحدد معك مقابلة لمنصب ${role}. احجز مكالمة ٣٠ دقيقة معنا من هنا: <a href="https://calendly.com/jeem-team/30min" style="color: #2563eb;">https://calendly.com/jeem-team/30min</a>`,
				text: `خبر سار ${firstName}! نحب نحدد معك مقابلة لمنصب ${role}. احجز مكالمة ٣٠ دقيقة معنا من هنا: https://calendly.com/jeem-team/30min`
			})
		},
		training: {
			subject: "أهلاً فيك ببرنامج التدريب – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `مبروك ${firstName}! تم قبولك في برنامج التدريب لـ ${role}. راح نبعثلك تفاصيل الخطوات الجاية قريباً.`,
				text: `مبروك ${firstName}! تم قبولك في برنامج التدريب لـ ${role}. راح نبعثلك تفاصيل الخطوات الجاية قريباً.`
			})
		},
		pending_matching: {
			subject: "جاهز للمطابقة مع المشاريع – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `خبر سار ${firstName}! صرت الآن ضمن مجموعة المواهب وعم ندور على مشاريع تناسب مهاراتك بـ ${role}.`,
				text: `خبر سار ${firstName}! صرت الآن ضمن مجموعة المواهب وعم ندور على مشاريع تناسب مهاراتك بـ ${role}.`
			})
		},
		matched: {
			subject: "تمت مطابقتك مع مشروع! – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `خبر مفرح ${firstName}! طابقناك مع مشروع يناسب ملفك كـ ${role}. راح نتواصل معك بتفاصيل المشروع والخطوات الجاية.`,
				text: `خبر مفرح ${firstName}! طابقناك مع مشروع يناسب ملفك كـ ${role}. راح نتواصل معك بتفاصيل المشروع والخطوات الجاية.`
			})
		},
		rejected: {
			subject: "تحديث على طلبك – Jeem",
			getContent: (firstName: string, role: string) => ({
				html: `شكراً لاهتمامك بالانضمام لـ Jeem كـ ${role}. للأسف، ما راح نكمل مع طلبك بهاللحظة. بنشجعك تقدّم مرة تانية بالمستقبل لما احتياجاتنا تتغير.`,
				text: `شكراً لاهتمامك بالانضمام لـ Jeem كـ ${role}. للأسف، ما راح نكمل مع طلبك بهاللحظة. بنشجعك تقدّم مرة تانية بالمستقبل لما احتياجاتنا تتغير.`
			})
		}
	}
};

function getStatusEmailTemplate(status: TalentStatus, language: "en" | "ar", firstName: string, role: string) {
	const content = talentStatusEmailContent[language][status].getContent(firstName, role);

	return {
		subject: talentStatusEmailContent[language][status].subject,
		html:
			language === "en"
				? `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">Hey ${firstName} 👋</h1>
  </div>

  <p style="margin: 0 0 16px 0;">
    ${content.html}
  </p>

  <p style="margin: 24px 0 0 0; color: #666;">
    – The Jeem Team
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <p style="font-size: 12px; color: #999; margin: 0;">
    You received this email because you applied to join Jeem.
  </p>
</body>
</html>
		`
				: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', sans-serif; line-height: 1.8; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; direction: rtl; text-align: right;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">أهلاً ${firstName} 👋</h1>
  </div>

  <p style="margin: 0 0 16px 0;">
    ${content.html}
  </p>

  <p style="margin: 24px 0 0 0; color: #666;">
    – فريق Jeem
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <p style="font-size: 12px; color: #999; margin: 0;">
    وصلك هذا الإيميل لأنك قدّمت على Jeem.
  </p>
</body>
</html>
		`,
		text: content.text
	};
}

export async function sendTalentStatusUpdateEmail({
	to,
	name,
	role,
	talentId,
	newStatus,
	language = "en"
}: SendTalentStatusUpdateEmailParams): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResend();
		const idempotencyKey = `talent-status-${talentId}-${newStatus}-${Date.now()}`;
		const firstName = name.split(" ")[0];
		const template = getStatusEmailTemplate(newStatus, language, firstName, role);

		const { error } = await resend.emails.send({
			from: "Jeem <hello@jeem.now>",
			to: [to],
			subject: template.subject,
			headers: {
				"X-Idempotency-Key": idempotencyKey
			},
			html: template.html,
			text: template.text
		});

		if (error) {
			console.error("Resend error:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Email send error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

// ============================================================================
// COMPANY STATUS UPDATE EMAIL
// ============================================================================

type CompanyStatus =
	| "under_review"
	| "reviewing_candidates"
	| "interviewing_candidates"
	| "negotiating"
	| "matched"
	| "rejected";

interface SendCompanyStatusUpdateEmailParams {
	to: string;
	contactName: string;
	companyName: string;
	companyId: string;
	newStatus: CompanyStatus;
	language: "en" | "ar";
}

const companyStatusEmailContent = {
	en: {
		under_review: {
			subject: "Your inquiry is under review – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `Your hiring inquiry for ${companyName} is currently being reviewed by our team. We'll update you soon!`,
				text: `Your hiring inquiry for ${companyName} is currently being reviewed by our team. We'll update you soon!`
			})
		},
		reviewing_candidates: {
			subject: "Reviewing candidates for you – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `We're currently reviewing our talent pool to find the best matches for ${companyName}'s requirements. We'll share candidate profiles with you shortly.`,
				text: `We're currently reviewing our talent pool to find the best matches for ${companyName}'s requirements. We'll share candidate profiles with you shortly.`
			})
		},
		interviewing_candidates: {
			subject: "Candidate interviews scheduled – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `We're scheduling interviews with potential candidates for ${companyName}. We'll coordinate with you to set up meetings with the most promising talent.`,
				text: `We're scheduling interviews with potential candidates for ${companyName}. We'll coordinate with you to set up meetings with the most promising talent.`
			})
		},
		negotiating: {
			subject: "Moving to contract negotiation – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `Great progress! We're now in the negotiation phase for ${companyName}. We'll work with you to finalize terms and get started.`,
				text: `Great progress! We're now in the negotiation phase for ${companyName}. We'll work with you to finalize terms and get started.`
			})
		},
		matched: {
			subject: "Talent matched successfully! – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `Excellent news! We've successfully matched ${companyName} with talent from our network. We'll be in touch with contract details and next steps.`,
				text: `Excellent news! We've successfully matched ${companyName} with talent from our network. We'll be in touch with contract details and next steps.`
			})
		},
		rejected: {
			subject: "Inquiry update – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `Thank you for your interest in hiring through Jeem for ${companyName}. Unfortunately, we don't have suitable candidates available at this time. We encourage you to reach out again as your needs evolve.`,
				text: `Thank you for your interest in hiring through Jeem for ${companyName}. Unfortunately, we don't have suitable candidates available at this time. We encourage you to reach out again as your needs evolve.`
			})
		}
	},
	ar: {
		under_review: {
			subject: "طلبك قيد المراجعة – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `طلب التوظيف لـ ${companyName} قيد المراجعة من قبل فريقنا حالياً. راح نحدّثك قريباً!`,
				text: `طلب التوظيف لـ ${companyName} قيد المراجعة من قبل فريقنا حالياً. راح نحدّثك قريباً!`
			})
		},
		reviewing_candidates: {
			subject: "عم نراجع المرشحين – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `عم نراجع حالياً مجموعة المواهب لإيجاد أفضل مطابقة لمتطلبات ${companyName}. راح نشاركك ملفات المرشحين قريباً.`,
				text: `عم نراجع حالياً مجموعة المواهب لإيجاد أفضل مطابقة لمتطلبات ${companyName}. راح نشاركك ملفات المرشحين قريباً.`
			})
		},
		interviewing_candidates: {
			subject: "جدولة مقابلات المرشحين – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `عم نجدول مقابلات مع مرشحين محتملين لـ ${companyName}. راح ننسق معك لترتيب لقاءات مع أفضل المواهب.`,
				text: `عم نجدول مقابلات مع مرشحين محتملين لـ ${companyName}. راح ننسق معك لترتيب لقاءات مع أفضل المواهب.`
			})
		},
		negotiating: {
			subject: "الانتقال للتفاوض على العقد – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `تقدم ممتاز! وصلنا لمرحلة التفاوض لـ ${companyName}. راح نشتغل معك لإنهاء الشروط والبدء.`,
				text: `تقدم ممتاز! وصلنا لمرحلة التفاوض لـ ${companyName}. راح نشتغل معك لإنهاء الشروط والبدء.`
			})
		},
		matched: {
			subject: "تمت المطابقة بنجاح! – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `خبر ممتاز! طابقنا ${companyName} بنجاح مع مواهب من شبكتنا. راح نتواصل معك بتفاصيل العقد والخطوات الجاية.`,
				text: `خبر ممتاز! طابقنا ${companyName} بنجاح مع مواهب من شبكتنا. راح نتواصل معك بتفاصيل العقد والخطوات الجاية.`
			})
		},
		rejected: {
			subject: "تحديث على الطلب – Jeem",
			getContent: (firstName: string, companyName: string) => ({
				html: `شكراً لاهتمامك بالتوظيف من خلال Jeem لـ ${companyName}. للأسف، ما عنا مرشحين مناسبين بهاللحظة. بنشجعك تتواصل معنا مرة تانية لما احتياجاتك تتطور.`,
				text: `شكراً لاهتمامك بالتوظيف من خلال Jeem لـ ${companyName}. للأسف، ما عنا مرشحين مناسبين بهاللحظة. بنشجعك تتواصل معنا مرة تانية لما احتياجاتك تتطور.`
			})
		}
	}
};

function getCompanyStatusEmailTemplate(
	status: CompanyStatus,
	language: "en" | "ar",
	firstName: string,
	companyName: string
) {
	const content = companyStatusEmailContent[language][status].getContent(firstName, companyName);

	return {
		subject: companyStatusEmailContent[language][status].subject,
		html:
			language === "en"
				? `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">Hey ${firstName} 👋</h1>
  </div>

  <p style="margin: 0 0 16px 0;">
    ${content.html}
  </p>

  <p style="margin: 24px 0 0 0; color: #666;">
    – The Jeem Team
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <p style="font-size: 12px; color: #999; margin: 0;">
    You received this email because you submitted an inquiry on Jeem.
  </p>
</body>
</html>
		`
				: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', sans-serif; line-height: 1.8; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; direction: rtl; text-align: right;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">أهلاً ${firstName} 👋</h1>
  </div>

  <p style="margin: 0 0 16px 0;">
    ${content.html}
  </p>

  <p style="margin: 24px 0 0 0; color: #666;">
    – فريق Jeem
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <p style="font-size: 12px; color: #999; margin: 0;">
    وصلك هذا الإيميل لأنك قدّمت طلب على Jeem.
  </p>
</body>
</html>
		`,
		text: content.text
	};
}

export async function sendCompanyStatusUpdateEmail({
	to,
	contactName,
	companyName,
	companyId,
	newStatus,
	language = "en"
}: SendCompanyStatusUpdateEmailParams): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResend();
		const idempotencyKey = `company-status-${companyId}-${newStatus}-${Date.now()}`;
		const firstName = contactName.split(" ")[0];
		const template = getCompanyStatusEmailTemplate(newStatus, language, firstName, companyName);

		const { error } = await resend.emails.send({
			from: "Jeem <hello@jeem.now>",
			to: [to],
			subject: template.subject,
			headers: {
				"X-Idempotency-Key": idempotencyKey
			},
			html: template.html,
			text: template.text
		});

		if (error) {
			console.error("Resend error:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Email send error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}

// ============================================================================
// CUSTOM TALENT EMAIL (ADMIN-INITIATED)
// ============================================================================

interface SendCustomTalentEmailParams {
	to: string;
	name: string;
	talentId: string;
	subject: string;
	body: string;
}

/**
 * Sends a custom email from admin to a talent.
 * Body text is preserved with line breaks and sent as-is.
 */
export async function sendCustomTalentEmail({
	to,
	name,
	talentId,
	subject,
	body
}: SendCustomTalentEmailParams): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResend();

		// Use timestamp for idempotency since these are one-off messages
		const idempotencyKey = `talent-custom-${talentId}-${Date.now()}`;

		const firstName = name.split(" ")[0];

		// Check if body is HTML (contains HTML tags)
		const isHtml = /<[^>]+>/.test(body);

		// If HTML, use as-is. If plain text, convert to HTML with preserved line breaks
		const htmlBody = isHtml
			? body
			: body
					.split("\n")
					.map((line) => (line.trim() === "" ? "<br>" : `<p style="margin: 0 0 16px 0;">${line}</p>`))
					.join("\n");

		const htmlContent = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">Hey ${firstName} 👋</h1>
  </div>

  <div>
    ${htmlBody}
  </div>

  <p style="margin: 24px 0 0 0; color: #666;">
    – The Jeem Team
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

  <p style="font-size: 12px; color: #999; margin: 0;">
    You received this email because you applied to join Jeem.
  </p>
</body>
</html>
		`;

		// Strip HTML tags for text version
		const textBody = isHtml
			? body
					.replace(/<[^>]+>/g, "")
					.replace(/\s+/g, " ")
					.trim()
			: body;
		const textContent = `Hey ${firstName}!\n\n${textBody}\n\n– The Jeem Team`;

		const { error } = await resend.emails.send({
			from: "Jeem <hello@jeem.now>",
			to: [to],
			subject: subject,
			headers: {
				"X-Idempotency-Key": idempotencyKey
			},
			html: htmlContent,
			text: textContent
		});

		if (error) {
			console.error("Resend error:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Email send error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		};
	}
}
