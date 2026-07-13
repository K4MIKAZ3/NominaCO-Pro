export const site = {
  name: "Nominapp",
  tagline: "Liquidación de nómina personal en Colombia",
  description:
    "App Android gratuita para registrar jornadas, calcular devengados y descuentos según la normativa laboral colombiana 2026. Uso personal.",
  url: "https://www.nominapp.xyz",
  country: "Colombia",
  year: 2026,
  contactEmail: "contacto@nominapp.xyz",
  contentAuthor: "Equipo Nominapp",
  githubUrl: "https://github.com/K4MIKAZ3/NominaCO-Pro",
  auth: {
    loginPath: "/login",
    homePath: "/inicio",
    resetPasswordPath: "/restablecer-contrasena",
  },
  /** Rutas públicas que deben indexarse */
  indexedPaths: ["/", "/terminos", "/guia"] as const,
  /** Último APK publicado por CI en GitHub Releases (main) */
  apkDownloadUrl:
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ??
    "https://github.com/K4MIKAZ3/NominaCO-Pro/releases/latest/download/Nominapp.apk",
  featuresList: [
    "Calendario de jornadas laborales",
    "Liquidación mensual con devengados y descuentos",
    "Períodos quincenales, semanales y mensuales",
    "Control de gastos personales",
    "Estimación de prestaciones sociales",
    "Respaldo opcional en la nube",
    "Exportación a PDF",
  ],
} as const;

export const heroStats = [
  { value: "Gratis", label: "Sin suscripción" },
  { value: "Android 8+", label: "Instalación directa" },
  { value: "2026", label: "Parámetros legales CO" },
] as const;

export const howItWorks = [
  {
    step: "1",
    title: "Descarga la APK",
    description:
      "Instala Nominapp desde el enlace oficial. No necesitas Play Store.",
  },
  {
    step: "2",
    title: "Configura tu perfil",
    description:
      "Indica salario, jornada, tipo de contrato y período de cobro (quincenal, mensual, etc.).",
  },
  {
    step: "3",
    title: "Registra y consulta",
    description:
      "Marca tus días trabajados, revisa la liquidación estimada y exporta PDF si lo necesitas.",
  },
] as const;

export const audiencePoints = [
  {
    title: "Empleados con nómina quincenal o mensual",
    description:
      "Lleva el control de lo devengado, descuentos de salud y pensión, y tu neto estimado mes a mes.",
  },
  {
    title: "Trabajadores con horarios variables",
    description:
      "Registra entrada, salida, dominical, festivo y recargos nocturnos desde el calendario.",
  },
  {
    title: "Quienes quieren ordenar sus finanzas",
    description:
      "Combina tu nómina con gastos fijos y variables para ver cuánto te queda realmente.",
  },
] as const;

export const faqItems = [
  {
    question: "¿Nominapp reemplaza la nómina oficial de mi empleador?",
    answer:
      "No. Nominapp es una herramienta personal de estimación. Los valores son orientativos según la información que tú registras y la normativa configurada. Para decisiones legales o contables consulta a un profesional o a tu área de nómina.",
  },
  {
    question: "¿Sirve para calcular mi liquidación en Colombia?",
    answer:
      "Sí, está pensada para trabajadores en Colombia. Incorpora referencias como SMMLV, auxilio de transporte, recargos, salud, pensión y prestaciones estimadas según jornadas registradas, con parámetros actualizados a 2026.",
  },
  {
    question: "¿Necesito crear una cuenta para usar la app?",
    answer:
      "No. Puedes usar Nominapp en modo local sin registrarte. La cuenta con correo y contraseña es opcional y sirve para respaldar y sincronizar tus datos entre dispositivos.",
  },
  {
    question: "¿Por qué se descarga como APK y no desde Play Store?",
    answer:
      "Por ahora la distribución es directa (sideload) desde este sitio oficial. Descarga solo desde nominapp.xyz para evitar archivos alterados. La app está firmada y puede actualizarse desde Ajustes.",
  },
  {
    question: "¿Mis datos están seguros en la nube?",
    answer:
      "Si activas la cuenta, tus datos se almacenan en Supabase con aislamiento por usuario (RLS). Puedes usar la app sin subir nada a la nube. Consulta los términos y privacidad para más detalle.",
  },
  {
    question: "¿Puedo exportar mi liquidación?",
    answer:
      "Sí. Desde la app puedes generar PDFs de la liquidación mensual y del reporte de días laborados para tu archivo personal.",
  },
] as const;

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
    image: "/images/feature-calendar.webp",
  },
  {
    title: "Liquidación mensual",
    description:
      "Devengados, recargos nocturnos, dominical y festivos, salud, pensión y neto a pagar.",
    image: "/images/feature-payroll.webp",
  },
  {
    title: "Períodos de cobro",
    description:
      "Semanal, quincenal, ventana de 21 días o mensual. Avances, bonos y saldo pendiente.",
    image: "/images/feature-periods.webp",
  },
  {
    title: "Control de gastos",
    description:
      "Registra egresos personales, marca gastos fijos cada mes (arriendo, alimentación…) y compara neto vs gastos.",
    image: "/images/feature-expenses.webp",
  },
  {
    title: "Prestaciones estimadas",
    description:
      "Prima, cesantías e indicadores de liquidación según jornadas registradas (base CST).",
    image: "/images/feature-benefits.webp",
  },
  {
    title: "Respaldo en la nube",
    description:
      "Cuenta con correo y contraseña. Sincroniza perfil, jornadas, egresos de nómina y gastos personales.",
    image: "/images/feature-cloud.webp",
  },
  {
    title: "Exportar PDF",
    description:
      "Genera comprobantes de nómina y reporte de días laborados para tu archivo personal.",
    image: "/images/feature-pdf.webp",
  },
] as const;

export const legalHighlights = [
  "SMMLV, auxilio de transporte y topes 2026",
  "Recargo nocturno Ley 2466/2025",
  "Dominical y festivo remunerado",
  "Salud 4% · Pensión 4%",
] as const;
