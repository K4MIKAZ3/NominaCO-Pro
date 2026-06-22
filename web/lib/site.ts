export const site = {
  name: "Vibe Coding Company",
  tagline: "A new wAI to development",
  description:
    "Creamos proyectos de inteligencia artificial, automatizaciones, agentes y experiencias digitales para empresas que quieren construir más rápido.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibe-coding-company.vercel.app",
  country: "Colombia",
  year: 2026,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@vibecoding.company",
  auth: {
    loginPath: "/login",
    homePath: "/inicio",
    resetPasswordPath: "/restablecer-contrasena",
  },
  /** Rutas públicas que deben indexarse */
  indexedPaths: ["/", "/terminos"] as const,
  apkDownloadUrl:
    process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ??
    "https://github.com/K4MIKAZ3/NominaCO-Pro/releases/latest/download/Nominapp.apk",
  featuresList: [
    "Agentes de IA a medida",
    "Chatbots para ventas y soporte",
    "Automatización de procesos",
    "Dashboards inteligentes",
    "Integraciones con APIs y CRMs",
    "Landing pages y MVPs con IA",
  ],
} as const;

export const heroStats = [
  { value: "IA", label: "Aplicada a problemas reales" },
  { value: "MVP", label: "De idea a producto usable" },
  { value: "24/7", label: "Automatizaciones siempre activas" },
] as const;

export const processSteps = [
  {
    step: "1",
    title: "Entendemos tu operación",
    description:
      "Revisamos tu idea, dolores del negocio, datos disponibles y flujo actual para detectar oportunidades reales con IA.",
  },
  {
    step: "2",
    title: "Diseñamos el prototipo",
    description:
      "Definimos el alcance, arquitectura, experiencia de usuario e integraciones necesarias antes de construir.",
  },
  {
    step: "3",
    title: "Construimos y desplegamos",
    description:
      "Entregamos una solución responsiva, medible y lista para Vercel, con iteraciones rápidas y soporte para evolucionarla.",
  },
] as const;

export const projectHighlights = [
  {
    title: "Agentes IA para atención y ventas",
    description:
      "Asistentes que califican leads, responden preguntas frecuentes, capturan datos y escalan casos complejos a tu equipo.",
    tag: "Conversacional",
  },
  {
    title: "Automatización de procesos internos",
    description:
      "Flujos que conectan formularios, correos, hojas de cálculo, CRMs y APIs para reducir tareas repetitivas.",
    tag: "Operaciones",
  },
  {
    title: "Dashboards y análisis con IA",
    description:
      "Paneles que resumen información clave, detectan patrones y ayudan a decidir con datos claros.",
    tag: "Data",
  },
  {
    title: "MVPs y landing pages inteligentes",
    description:
      "Sitios, prototipos y productos web con formularios, pagos, bases de datos, contenido dinámico e IA integrada.",
    tag: "Producto",
  },
] as const;

export const faqItems = [
  {
    question: "¿Qué tipo de proyectos de IA pueden cotizar?",
    answer:
      "Podemos cotizar chatbots, agentes internos, automatizaciones, paneles de datos, landing pages, MVPs y herramientas web conectadas a APIs, CRMs o bases de datos.",
  },
  {
    question: "¿Necesito tener todo definido antes de contactarlos?",
    answer:
      "No. Puedes escribir con una idea inicial, un problema operativo o un proceso manual que quieras mejorar. Te ayudamos a convertirlo en un alcance claro.",
  },
  {
    question: "¿La web queda lista para desplegarse en Vercel?",
    answer:
      "Sí. Diseñamos y construimos con tecnologías compatibles con Vercel para que el despliegue sea rápido, seguro y escalable.",
  },
  {
    question: "¿También trabajan sobre proyectos existentes?",
    answer:
      "Sí. Podemos revisar una web, app o flujo existente, identificar puntos de automatización e integrar IA sin rehacer todo desde cero.",
  },
  {
    question: "¿Cómo empieza una cotización?",
    answer:
      "Envíanos tu objetivo, referencias, presupuesto aproximado si lo tienes y datos de contacto. Respondemos con preguntas clave y una propuesta de alcance.",
  },
] as const;

export function absoluteUrl(path: string): string {
  return `${site.url.replace(/\/$/, "")}${path}`;
}

export function resetPasswordRedirectUrl(): string {
  return absoluteUrl(site.auth.resetPasswordPath);
}

export const services = [
  {
    title: "Consultoría y estrategia IA",
    description:
      "Priorizamos casos de uso, elegimos herramientas y trazamos una ruta técnica que tenga impacto medible.",
  },
  {
    title: "Desarrollo web con IA",
    description:
      "Creamos interfaces modernas, responsivas y optimizadas con modelos de lenguaje, formularios y automatizaciones.",
  },
  {
    title: "Integraciones y automatización",
    description:
      "Conectamos servicios como WhatsApp, correo, Google Sheets, Supabase, CRMs, pagos y APIs de terceros.",
  },
  {
    title: "Optimización y despliegue",
    description:
      "Preparamos builds para Vercel, mejoramos performance y dejamos bases sólidas para crecer.",
  },
] as const;

export const techHighlights = [
  "Next.js + Vercel",
  "Agentes y chatbots IA",
  "Automatizaciones con APIs",
  "UX responsiva y moderna",
] as const;
