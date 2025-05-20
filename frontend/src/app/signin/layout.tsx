import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - TeamSync",
  description: "Sign in to your TeamSync account",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 