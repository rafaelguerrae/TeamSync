import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams - TeamSync Dashboard",
  description: "View and manage your teams on TeamSync platform",
};

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 