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

export async function sendBackendEmailFromResponse(data?: EmailResponseLike | null) {
  if (!data?.email_payload || data.email_sent_by_backend === true) {
    return false;
  }

  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data.email_payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to send email from frontend.");
  }

  return true;
}
