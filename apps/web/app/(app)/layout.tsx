import {
  getActiveCompany,
  listCompanies,
  requireUser,
} from "@/lib/supabase/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  // Prefetch so child pages share auth; children still load their own data.
  await Promise.all([listCompanies(), getActiveCompany()]);
  return children;
}
