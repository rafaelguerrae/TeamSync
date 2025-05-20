import { Metadata } from "next";
import DashboardLayout from "./layout-client";

export const metadata: Metadata = {
  title: "Dashboard - TeamSync",
  description: "Manage your teams and projects on TeamSync dashboard",
};

export default function ServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 