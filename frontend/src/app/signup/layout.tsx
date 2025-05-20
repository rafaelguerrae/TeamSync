import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - TeamSync",
  description: "Sign up for a new TeamSync account and start collaborating with your team",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 