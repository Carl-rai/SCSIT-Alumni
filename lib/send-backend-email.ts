type EmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

type EmailResponseLike = {
  email_delivery_mode?: string;
  email_payload?: EmailPayload;
  email_sent_by_backend?: boolean;
};

export type IDRequestEmailSource = {
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  email?: string;
  alumni_id?: string | null;
  course?: string | null;
  year_graduate?: number | string | null;
  note?: string | null;
  created_at?: string;
};

function fullName(source: IDRequestEmailSource) {
  const middle = source.middle_name ? ` ${source.middle_name}` : "";
  return `${source.first_name || ""}${middle} ${source.last_name || ""}`.trim();
}

export function buildIdRequestExportEmailPayload(source: IDRequestEmailSource): EmailPayload {
  const name = fullName(source);
  return {
    to: source.email || "",
    subject: "ID Request Processed - SCSIT Alumni",
    text: `Dear ${name},\n\nYour alumni ID request has been processed by the SCSIT Alumni ID staff.\nYour request has been exported and is now being prepared for printing.\n\nRequest details:\nAlumni ID: ${source.alumni_id || "N/A"}\nName: ${name}\nEmail: ${source.email || "N/A"}\nRequested at: ${source.created_at || "N/A"}\n\nWe will email you again once your ID is ready to claim.\n\nBest regards,\nSCSIT Alumni\n`,
  };
}

export function buildIdRequestReadyEmailPayload(source: IDRequestEmailSource): EmailPayload {
  const name = fullName(source);
  return {
    to: source.email || "",
    subject: "Your Alumni ID Is Ready to Claim - SCSIT Alumni",
    text: `Dear ${name},\n\nGood news. Your alumni ID is now ready to claim at SCSIT Alumni.\n\nRequest details:\nAlumni ID: ${source.alumni_id || "N/A"}\nName: ${name}\nEmail: ${source.email || "N/A"}\nCourse: ${source.course || "N/A"}\nYear Graduated: ${source.year_graduate || "N/A"}\nRequest Note: ${source.note || "N/A"}\nStatus: Ready to Claim\n\nPlease bring any valid identification required by the office when you visit.\n\nBest regards,\nSCSIT Alumni\n`,
  };
}

export async function sendBackendEmailPayload(payload?: EmailPayload | null) {
  if (!payload) return false;

  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to send email from frontend.");
  }

  return true;
}

export async function sendBackendEmailFromResponse(data?: EmailResponseLike | null) {
  if (!data?.email_payload || data.email_sent_by_backend === true) {
    return false;
  }

  return sendBackendEmailPayload(data.email_payload);
}
