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
			from: "Jeem <onboarding@resend.dev>",
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
