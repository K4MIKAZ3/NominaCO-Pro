"use client";

import { setActiveCompanyAction } from "@/app/actions";
import type { Company } from "@/lib/types";

export function CompanySwitcher({
  companies,
  activeId,
}: {
  companies: Company[];
  activeId?: string;
}) {
  if (companies.length <= 1) return null;
  return (
    <form action={setActiveCompanyAction} style={{ marginTop: "0.55rem" }}>
      <select
        name="companyId"
        defaultValue={activeId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        style={{
          width: "100%",
          minHeight: "2.1rem",
          borderRadius: 8,
          border: "1px solid rgba(247,243,235,0.2)",
          background: "rgba(0,0,0,0.2)",
          color: "var(--sand-50)",
          padding: "0.25rem 0.4rem",
        }}
      >
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </form>
  );
}
