/** Fuentes oficiales y oficiales-compiladas para citas en guías. */
export type OfficialSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  note?: string;
};

export const SOURCES = {
  decreto1469: {
    id: "decreto-1469-2025",
    title: "Decreto 1469 de 2025 — Salario mínimo legal mensual 2026",
    publisher: "Presidencia / MinTrabajo (Diario Oficial)",
    url: "https://cancilleria.gov.co/normograma/compilacion/docs/decreto_1469_2025.htm",
    note: "Fija el SMMLV 2026 en $1.750.905 a partir del 1 de enero de 2026.",
  },
  decreto1470: {
    id: "decreto-1470-2025",
    title: "Decreto 1470 de 2025 — Auxilio de transporte 2026",
    publisher: "Presidencia / MinTrabajo (Diario Oficial)",
    url: "https://cancilleria.gov.co/normograma/compilacion/docs/decreto_1470_2025.htm",
    note: "Fija el auxilio de transporte 2026 en $249.095 para quien devenga hasta 2 SMMLV.",
  },
  decreto159: {
    id: "decreto-159-2026",
    title: "Decreto 159 de 2026 — SMMLV transitorio 2026",
    publisher: "Gobierno Nacional",
    url: "https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_0159_2026.htm",
    note: "Mantiene transitoriamente $1.750.905 mientras se resuelve el proceso ante el Consejo de Estado.",
  },
  ley2101: {
    id: "ley-2101-2021",
    title: "Ley 2101 de 2021 — Reducción de la jornada laboral semanal",
    publisher: "Congreso de la República",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=167997",
    note: "Cronograma de reducción gradual de la jornada máxima semanal.",
  },
  ley2466: {
    id: "ley-2466-2025",
    title: "Ley 2466 de 2025 — Reforma laboral",
    publisher: "Congreso de la República / Función Pública",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676",
    note: "Recargos, jornada nocturna, contratos, licencias y demás cambios al CST.",
  },
  cst: {
    id: "cst",
    title: "Código Sustantivo del Trabajo (CST)",
    publisher: "República de Colombia",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=33104",
    note: "Marco general de salarios, jornadas, recargos y prestaciones.",
  },
  mintrabajo: {
    id: "mintrabajo",
    title: "Ministerio del Trabajo — portal oficial",
    publisher: "MinTrabajo",
    url: "https://www.mintrabajo.gov.co/",
    note: "Canal para quejas, orientación laboral y novedades normativas.",
  },
  ley100: {
    id: "ley-100-1993",
    title: "Ley 100 de 1993 — Sistema de Seguridad Social Integral",
    publisher: "Congreso de la República",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5248",
    note: "Base del sistema de salud y pensiones; cotizaciones del trabajador y empleador.",
  },
} as const satisfies Record<string, OfficialSource>;

export type SourceKey = keyof typeof SOURCES;

export function pickSources(...keys: SourceKey[]): OfficialSource[] {
  return keys.map((key) => SOURCES[key]);
}
