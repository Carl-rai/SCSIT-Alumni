import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  const { to, subject, text, html } = await req.json();

  if (!to || !subject || (!text && !html)) {
    return NextResponse.json({ error: "to, subject, and text/html are required" }, { status: 400 });
  }

  try {
    await transporter.sendMail({
      from: `"Alumni Management System" <${process.env.EMAIL_HOST_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
