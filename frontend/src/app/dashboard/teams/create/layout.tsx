import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Team - TeamSync",
  description: "Create a new team on TeamSync platform",
};

export default function CreateTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 