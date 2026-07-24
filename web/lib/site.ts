export const site = {
  name: "Nominapp",
  tagline: "Nómina personal para empleados en Colombia",
  description:
    "App Android gratuita para empleados en Colombia: registra jornadas, calcula tu liquidación (devengados, salud, pensión y neto) según la normativa laboral 2026. Uso personal, no es software empresarial.",
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
  indexedPaths: ["/", "/terminos", "/guia", "/acerca"] as const,
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

/** Señales reales de confianza (sin inventar descargas ni testimonios). */
export const heroStats = [
  { value: "Gratis", label: "Sin suscripción" },
  { value: "11", label: "Guías con fuentes oficiales" },
  { value: "2026", label: "SMMLV y parámetros legales" },
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
    title: "Configura tu perfil de empleado",
    description:
      "Indica tu salario, jornada, tipo de contrato y período de cobro (quincenal, mensual, etc.).",
  },
  {
    step: "3",
    title: "Registra y consulta tu neto",
    description:
      "Marca tus días trabajados, revisa la liquidación estimada y exporta PDF si lo necesitas.",
  },
] as const;

/** Público principal: empleados. El resto son beneficios del mismo perfil. */
export const primaryAudience = {
  title: "Hecha para empleados, no para empresas",
  description:
    "Nominapp es una calculadora de nómina personal: tú registras tus jornadas y ves una estimación de tu liquidación. No es software de RR.HH. ni reemplaza la nómina oficial de tu empleador.",
} as const;

export const audiencePoints = [
  {
    title: "Tu quincena o mes, con neto estimado",
    description:
      "Devengados, auxilio de transporte, salud 4 %, pensión 4 % y neto orientativo según lo que registres.",
  },
  {
    title: "Turnos, nocturnos y festivos",
    description:
      "Si tu horario varía, marca entrada, salida, dominical y recargos desde el calendario.",
  },
  {
    title: "Gastos contra tu nómina",
    description:
      "Opcional: compara egresos fijos y variables con tu neto para ver cuánto te queda.",
  },
] as const;

/** Ejemplo basado en liquidación real de prueba (julio 2026). */
export const payrollExample = {
  title: "Ejemplo real: jornadas → neto",
  subtitle:
    "Liquidación de julio 2026 con 20 días laborados. Mismos conceptos que ves en la app: SBP, auxilio, dominicales y festivos.",
  rows: [
    { label: "Total devengado", value: "$2.289.395", tone: "positive" as const },
    { label: "Total deducciones", value: "− $183.150", tone: "negative" as const },
  ],
  details: [
    { label: "SBP · salario base proporcional", value: "$1.633.333" },
    { label: "ST · subsidio de transporte", value: "$166.063" },
    { label: "DRD · dominical (4 días)", value: "$326.666" },
    { label: "FER · festivo (2 días)", value: "$163.333" },
  ],
  netLabel: "Total a pagar",
  netValue: "$2.106.245",
  note: "Cifras de una liquidación de prueba en Nominapp. Tu resultado depende de tu salario, jornadas y descuentos. Contrasta siempre con el desprendible de tu empleador.",
  guideHref: "/guia/calcular-liquidacion-quincenal-colombia",
  guideLabel: "Ver el cálculo paso a paso",
} as const;

export const productShots = [
  {
    src: "/images/real/nomina.webp",
    alt: "Pantalla Nómina: total a pagar $2.106.245 con desglose de devengados",
    caption: "Nómina · neto y desglose",
  },
  {
    src: "/images/real/calendario.webp",
    alt: "Pantalla Calendario julio 2026 con 20 días trabajados y festivos",
    caption: "Calendario · jornadas",
  },
  {
    src: "/images/real/gastos.webp",
    alt: "Pantalla Gastos: balance del mes $1.592.245 tras restar egresos",
    caption: "Gastos · neto menos egresos",
  },
  {
    src: "/images/real/periodos.webp",
    alt: "Subperíodo 16–31 julio: neto $887.577 tras descuentos legales",
    caption: "Períodos · quincena",
  },
  {
    src: "/images/real/prestaciones.webp",
    alt: "Prima, cesantías e intereses 2026 con estimación de liquidación",
    caption: "Prestaciones · prima y cesantías",
  },
  {
    src: "/images/real/pdf-export.webp",
    alt: "PDF de liquidación julio 2026 con datos personales tapados",
    caption: "PDF · liquidación exportada",
  },
] as const;

export const usageModes = [
  {
    title: "Modo local",
    description:
      "Usa la app sin crear cuenta. Tus datos quedan en el dispositivo. Ideal para empezar ya.",
  },
  {
    title: "Modo nube (opcional)",
    description:
      "Con correo y contraseña respaldas y sincronizas perfil, jornadas y gastos entre dispositivos.",
  },
] as const;

/** Artículos prioritarios para enlaces internos desde la home. */
export const featuredGuiaSlugs = [
  "calcular-liquidacion-quincenal-colombia",
  "descuentos-salud-pension-nomina",
  "auxilio-transporte-salario-minimo-2026",
  "recargo-nocturno-colombia-2026",
] as const;

export const faqItems = [
  {
    question: "¿Nominapp reemplaza la nómina oficial de mi empleador?",
    answer:
      "No. Nominapp es una herramienta personal de estimación para empleados. Los valores son orientativos según la información que tú registras y la normativa configurada. Para decisiones legales o contables consulta a un profesional o a tu área de nómina.",
  },
  {
    question: "¿Sirve para calcular mi liquidación en Colombia?",
    answer:
      "Sí, está pensada para empleados y trabajadores en Colombia. Incorpora referencias como SMMLV, auxilio de transporte, recargos, salud, pensión y prestaciones estimadas según jornadas registradas, con parámetros actualizados a 2026.",
  },
  {
    question: "¿Necesito crear una cuenta para usar la app?",
    answer:
      "No. Puedes usar Nominapp en modo local sin registrarte. La cuenta es opcional (modo nube) para respaldar y sincronizar entre dispositivos. Lo explicamos arriba en «Modo local o nube».",
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
