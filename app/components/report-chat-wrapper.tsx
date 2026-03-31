"use client";

import { usePathname } from "next/navigation";
import ReportChat from "./report-chat";

export default function ReportChatWrapper() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin-dashboard") || pathname.startsWith("/staff-dashboard") || pathname.startsWith("/edit-user") || pathname.startsWith("/edit-staff")|| pathname.startsWith("/edit-alumni")) return null;

  return <ReportChat />;
}
