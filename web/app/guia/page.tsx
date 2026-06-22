import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Vibe Coding Company",
  robots: { index: false, follow: false },
};

export default function GuiaIndexPage() {
  redirect("/");
}
