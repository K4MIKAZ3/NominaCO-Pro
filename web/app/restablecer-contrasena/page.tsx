import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Define una nueva contraseña para tu cuenta Nominapp.",
  robots: privatePageRobots,
};

export default function ResetPasswordPage() {
  return (
    <main className="page-main">
      <div className="container">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
