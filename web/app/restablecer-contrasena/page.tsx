import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Define una nueva contraseña para tu cuenta Nominapp.",
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
