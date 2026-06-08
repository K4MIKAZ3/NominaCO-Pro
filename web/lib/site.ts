export const site = {
  name: "Nominapp",
  tagline: "Liquidación de nómina personal en Colombia",
  description:
    "App Android para registrar jornadas, calcular devengados y descuentos según la normativa laboral colombiana 2026. Uso personal.",
  url: "https://nominapp.xyz",
  country: "Colombia",
  year: 2026,
  contactEmail: "contacto@nominapp.xyz",
  auth: {
    loginPath: "/login",
    resetPasswordPath: "/restablecer-contrasena",
  },
  /** Último APK publicado por CI en GitHub Releases (main) */
  apkDownloadUrl:
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ??
    "https://github.com/K4MIKAZ3/NominaCO-Pro/releases/latest/download/Nominapp.apk",
} as const;

export function absoluteUrl(path: string): string {
  return `${site.url.replace(/\/$/, "")}${path}`;
}

export function resetPasswordRedirectUrl(): string {
  return absoluteUrl(site.auth.resetPasswordPath);
}

export const features = [
  {
    title: "Calendario de jornadas",
    description:
      "Marca días trabajados, domingos y festivos. Registra entrada, salida y notas por jornada.",
    image: "/images/feature-calendar.png",
  },
  {
    title: "Liquidación mensual",
    description:
      "Devengados, recargos nocturnos, dominical y festivos, salud, pensión y neto a pagar.",
    image: "/images/feature-payroll.png",
  },
  {
    title: "Períodos de cobro",
    description:
      "Semanal, quincenal, ventana de 21 días o mensual. Avances, bonos y saldo pendiente.",
  },
  {
    title: "Prestaciones estimadas",
    description:
      "Prima, cesantías e indicadores de liquidación según jornadas registradas (base CST).",
  },
  {
    title: "Respaldo en la nube",
    description:
      "Cuenta con correo y contraseña. Sincroniza perfil, jornadas y egresos entre dispositivos.",
  },
  {
    title: "Exportar PDF",
    description:
      "Genera comprobantes de nómina y reporte de días laborados para tu archivo personal.",
  },
] as const;

export const legalHighlights = [
  "SMMLV, auxilio de transporte y topes 2026",
  "Recargo nocturno Ley 2466/2025",
  "Dominical y festivo remunerado",
  "Salud 4% · Pensión 4%",
] as const;
