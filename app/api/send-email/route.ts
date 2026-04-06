import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const emailUser =
  process.env.MAILER_GMAIL_USER || process.env.EMAIL_HOST_USER || "";
const emailPassword =
  process.env.MAILER_GMAIL_APP_PASSWORD || process.env.EMAIL_HOST_PASSWORD || "";
const fromEmail =
  process.env.MAILER_FROM_EMAIL || emailUser;
const fromName =
  process.env.MAILER_FROM_NAME || "Alumni Management System";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

export async function POST(req: NextRequest) {
  const { to, subject, text, html } = await req.json();

  if (!emailUser || !emailPassword) {
    return NextResponse.json(
      { error: "Email server is not configured." },
      { status: 500 }
    );
  }

  if (!to || !subject || (!text && !html)) {
    return NextResponse.json({ error: "to, subject, and text/html are required" }, { status: 400 });
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    console.error("Nodemailer error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
