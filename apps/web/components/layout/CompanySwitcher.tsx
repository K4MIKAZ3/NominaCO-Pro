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
    <form action={setActiveCompanyAction}>
      <select
        className="side-select"
        name="companyId"
        defaultValue={activeId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
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
