import { reformaArticles } from "./articles-reforma";

export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  /** ISO date; defaults to publishedAt when omitted */
  updatedAt?: string;
  readingMinutes: number;
  heroImage?: string;
  sections: BlogSection[];
};

export function getArticleModifiedAt(article: BlogArticle): string {
  return article.updatedAt ?? article.publishedAt;
}

export function estimateArticleWordCount(article: BlogArticle): number {
  const parts: string[] = [article.title, article.description];
  for (const section of article.sections) {
    if (section.type === "p" || section.type === "h2" || section.type === "callout") {
      parts.push(section.text);
    } else if (section.type === "ul") {
      parts.push(...section.items);
    } else if (section.type === "image") {
      parts.push(section.alt, section.caption ?? "");
    }
  }
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "calcular-liquidacion-quincenal-colombia",
    title: "Cómo calcular tu liquidación quincenal en Colombia",
    description:
      "Guía práctica para estimar devengados, descuentos de salud y pensión, y neto a pagar en nómina quincenal según la normativa laboral colombiana.",
    keywords: [
      "liquidación quincenal Colombia",
      "calcular nómina quincenal",
      "devengados y descuentos",
      "neto a pagar quincena",
    ],
    publishedAt: "2026-06-14",
    readingMinutes: 6,
    heroImage: "/images/guia/liquidacion-quincenal-colombia.png",
    sections: [
      {
        type: "p",
        text: "Si cobras cada quince días, tu liquidación no es simplemente «el salario partido en dos». Incluye días trabajados, recargos, auxilio de transporte proporcional y descuentos legales. Esta guía te explica cómo estimar tu quincena sin confundirte con hojas de cálculo.",
      },
      {
        type: "h2",
        text: "¿Qué es una nómina quincenal?",
      },
      {
        type: "p",
        text: "En Colombia muchos contratos pagan dos veces al mes (períodos del 1 al 15 y del 16 al fin de mes, u otras ventanas acordadas). Lo devengado en cada quincena depende de los días efectivamente laborados, no solo de dividir el salario mensual entre dos.",
      },
      {
        type: "h2",
        text: "Pasos para estimar tu quincena",
      },
      {
        type: "ul",
        items: [
          "Identifica tu salario básico mensual y el auxilio de transporte si aplica (según tope legal vigente).",
          "Calcula el valor diario: salario mensual ÷ 30 (base habitual en liquidaciones laborales).",
          "Multiplica por los días trabajados en la quincena (incluyendo dominical o festivo si laboraste).",
          "Suma recargos nocturnos, extras u otros conceptos devengados del período.",
          "Resta salud (4 %) y pensión (4 %) sobre la base de cotización, y otros descuentos autorizados.",
        ],
      },
      {
        type: "h2",
        text: "Errores comunes",
      },
      {
        type: "ul",
        items: [
          "Dividir el salario entre 2 sin contar días reales trabajados.",
          "Olvidar el auxilio de transporte proporcional cuando corresponde.",
          "No registrar dominical o festivo laborado (genera recargo adicional).",
          "Confundir el neto del empleador con tu estimación personal sin ver el desprendible oficial.",
        ],
      },
      {
        type: "callout",
        text: "Nominapp registra jornadas día a día y calcula la liquidación quincenal o mensual según tu perfil. Es una estimación personal: siempre contrasta con el desprendible de tu empleador.",
      },
    ],
  },
  {
    slug: "recargo-nocturno-colombia-2026",
    title: "Recargo nocturno en Colombia: cómo se calcula en 2026",
    description:
      "Explicación del recargo por trabajo nocturno según la Ley 2466/2025 y la jornada nocturna en Colombia. Porcentajes y ejemplo práctico.",
    keywords: [
      "recargo nocturno Colombia",
      "jornada nocturna",
      "Ley 2466 2025",
      "hora nocturna trabajo",
    ],
    publishedAt: "2026-06-14",
    readingMinutes: 5,
    heroImage: "/images/guia/recargo-nocturno-colombia.png",
    sections: [
      {
        type: "p",
        text: "Trabajar en horario nocturno genera un recargo sobre el valor ordinario de la hora. Desde la Ley 2466 de 2025, la jornada nocturna inicia a las 7:00 p. m. (antes era 9:00 p. m.). Si registras turnos nocturnos, conviene llevar el control para verificar tu liquidación.",
      },
      {
        type: "h2",
        text: "¿Qué es la jornada nocturna?",
      },
      {
        type: "p",
        text: "Es el trabajo realizado entre las 7:00 p. m. y las 6:00 a. m. del día siguiente. Las horas dentro de ese rango tienen un recargo del 35 % sobre el valor de la hora ordinaria (salvo pactos colectivos más favorables).",
      },
      {
        type: "h2",
        text: "Ejemplo simplificado",
      },
      {
        type: "ul",
        items: [
          "Salario mensual: $3.000.000 → valor hora ordinaria ≈ salario ÷ 240 horas mensuales de referencia.",
          "Si trabajas 4 horas nocturnas en un día, cada hora nocturna se paga como hora ordinaria + 35 % de recargo.",
          "En Nominapp marcas entrada y salida; la app identifica el tramo nocturno automáticamente.",
        ],
      },
      {
        type: "h2",
        text: "Recargo nocturno vs. hora extra",
      },
      {
        type: "p",
        text: "Son conceptos distintos. La hora extra es trabajo adicional a la jornada legal; el recargo nocturno es el sobreprecio por laborar en franja nocturna aunque sea jornada ordinaria. Pueden combinarse en algunos escenarios; revisa tu contrato y el desprendible.",
      },
      {
        type: "callout",
        text: "Registra cada jornada con hora de entrada y salida. Sin ese dato es imposible estimar bien el recargo nocturno acumulado del mes.",
      },
    ],
  },
  {
    slug: "auxilio-transporte-salario-minimo-2026",
    title: "Auxilio de transporte y salario mínimo 2026 en Colombia",
    description:
      "Cuándo aplica el auxilio de transporte, tope salarial, valor de referencia 2026 y cómo se incluye en la liquidación mensual o quincenal.",
    keywords: [
      "auxilio de transporte 2026",
      "salario mínimo Colombia 2026",
      "SMMLV",
      "tope auxilio transporte",
    ],
    publishedAt: "2026-06-14",
    readingMinutes: 5,
    heroImage: "/images/guia/auxilio-transporte-salario-minimo-colombia.png",
    sections: [
      {
        type: "p",
        text: "El auxilio de transporte es un apoyo legal para quienes devengan hasta dos salarios mínimos mensuales legales vigentes (SMMLV). No hace parte del salario base para prestaciones, pero sí impacta tu pago mensual si cumples requisitos.",
      },
      {
        type: "h2",
        text: "¿Quién tiene derecho?",
      },
      {
        type: "ul",
        items: [
          "Trabajadores con contrato laboral que devenguen hasta 2 SMMLV.",
          "No aplica a contratos donde el empleador asume transporte de forma distinta o en ciertos roles exceptuados por ley.",
          "Si superas el tope salarial, pierdes el auxilio de transporte legal.",
        ],
      },
      {
        type: "h2",
        text: "Valor y proporcionalidad",
      },
      {
        type: "p",
        text: "El valor se fija anualmente por el Gobierno. En la liquidación se paga de forma proporcional a los días trabajados del mes (base 30). Si faltaste días sin justificación, el auxilio se reduce en la misma proporción.",
      },
      {
        type: "h2",
        text: "Relación con el SMMLV 2026",
      },
      {
        type: "p",
        text: "Nominapp incorpora los parámetros legales de 2026 (SMMLV, auxilio, topes de salud y pensión). Configura tu salario mensual en el perfil y la app aplicará el auxilio si estás dentro del rango permitido.",
      },
      {
        type: "callout",
        text: "El auxilio no se descuenta por salud ni pensión, pero tampoco se incluye en la base de cesantías, prima o vacaciones.",
      },
    ],
  },
  {
    slug: "descuentos-salud-pension-nomina",
    title: "Descuentos de salud y pensión en la nómina colombiana",
    description:
      "Qué son los aportes a salud (4 %) y pensión (4 %), sobre qué base se calculan y cómo verificar que tu empleador los aplique bien.",
    keywords: [
      "descuento salud nómina",
      "descuento pensión 4 por ciento",
      "aportes empleado Colombia",
      "base de cotización",
    ],
    publishedAt: "2026-06-14",
    readingMinutes: 5,
    heroImage: "/images/guia/descuentos-salud-pension-colombia.png",
    sections: [
      {
        type: "p",
        text: "En cada liquidación tu empleador descuenta tu parte de seguridad social: 4 % a salud y 4 % a pensión sobre la base de cotización del período. Entender esto te ayuda a detectar errores en el desprendible.",
      },
      {
        type: "h2",
        text: "Base de cotización",
      },
      {
        type: "p",
        text: "Generalmente incluye el salario devengado del período (básico, comisiones devengadas y algunos auxilios según norma). No todos los pagos entran en la base; los bonos ocasionales pueden tratarse distinto según el caso.",
      },
      {
        type: "h2",
        text: "Los dos descuentos del 4 %",
      },
      {
        type: "ul",
        items: [
          "Salud (EPS): 4 % a cargo del trabajador sobre la base cotizable.",
          "Pensión (AFP): 4 % a cargo del trabajador sobre la misma base.",
          "El empleador paga aportes adicionales que no se reflejan en tu neto, pero sí en costo laboral.",
        ],
      },
      {
        type: "h2",
        text: "Topes mínimos y máximos",
      },
      {
        type: "p",
        text: "Existen topes de cotización vinculados al SMMLV (mínimo 1 SMMLV, máximo 25 SMMLV para pensión en reglas generales). Nominapp aplica los topes configurados para 2026 al estimar tu liquidación.",
      },
      {
        type: "callout",
        text: "Compara el total de descuentos de Nominapp con tu colilla de pago. Diferencias pequeñas pueden deberse a conceptos no registrados en la app (bonos, incapacidades, etc.).",
      },
    ],
  },
  {
    slug: "prestaciones-prima-cesantias-colombia",
    title: "Prima, cesantías e intereses: prestaciones en Colombia",
    description:
      "Resumen de prestaciones sociales (prima de servicios, cesantías, intereses) y cómo estimarlas según tu salario y tiempo laborado.",
    keywords: [
      "prima de servicios Colombia",
      "cesantías",
      "intereses cesantías",
      "prestaciones sociales empleado",
    ],
    publishedAt: "2026-06-14",
    readingMinutes: 6,
    heroImage: "/images/guia/prestaciones-prima-cesantias-colombia.png",
    sections: [
      {
        type: "p",
        text: "Además del salario periódico, el trabajador acumula prestaciones sociales: prima de servicios, cesantías e intereses sobre cesantías. Conocerlas ayuda a planear finanzas personales y validar pagos anuales o semestrales.",
      },
      {
        type: "h2",
        text: "Prima de servicios",
      },
      {
        type: "p",
        text: "Equivale a 15 días de salario por cada semestre trabajado (junio y diciembre en la mayoría de casos). Se calcula sobre salario base + auxilios que hacen base (no incluye auxilio de transporte en la base de prestaciones).",
      },
      {
        type: "h2",
        text: "Cesantías e intereses",
      },
      {
        type: "ul",
        items: [
          "Cesantías: un mes de salario por año trabajado, proporcional al tiempo.",
          "Se consignan a fondo de cesantías antes del 14 de febrero del año siguiente.",
          "Intereses: 12 % anual sobre el saldo de cesantías, pagados en enero o junio según el caso.",
        ],
      },
      {
        type: "h2",
        text: "Estimación personal",
      },
      {
        type: "p",
        text: "Nominapp estima indicadores de prestaciones según jornadas y salario registrados. Son referencias basadas en el Código Sustantivo del Trabajo, no certificaciones oficiales de fondo o empleador.",
      },
      {
        type: "callout",
        text: "Las prestaciones reales pueden variar si tuviste licencias, suspensiones o cambios de salario mid-año. Mantén tu perfil laboral actualizado en la app.",
      },
    ],
  },
  {
    slug: "dominical-festivo-trabajo-colombia",
    title: "Dominical y festivo laborado: recargos en Colombia",
    description:
      "Cómo se remuneran el domingo y los festivos laborados, compensatorio y registro en calendario para liquidar bien tu nómina.",
    keywords: [
      "dominical festivo Colombia",
      "recargo dominical",
      "festivo laborado",
      "compensatorio",
    ],
    publishedAt: "2026-06-14",
    readingMinutes: 5,
    heroImage: "/images/guia/dominical-festivo-trabajo-colombia.png",
    sections: [
      {
        type: "p",
        text: "Trabajar un domingo o un festivo no es lo mismo que un día ordinario. La ley colombiana prevé recargos y, en algunos casos, día compensatorio. Si no los registras, tu estimación de nómina quedará por debajo de lo real.",
      },
      {
        type: "h2",
        text: "Recargo dominical y festivo",
      },
      {
        type: "p",
        text: "El trabajo en domingo o festivo tiene un recargo del 75 % sobre el valor ordinario de la jornada (salvo reglas especiales en ciertos sectores). Además puede aplicar el recargo nocturno si parte de la jornada cae en horario nocturno.",
      },
      {
        type: "h2",
        text: "Día compensatorio",
      },
      {
        type: "p",
        text: "Cuando laboras domingo o festivo, además del recargo puede acordarse un día de descanso compensatorio. En Nominapp puedes marcar el tipo de día en el calendario para que el cálculo refleje dominical, festivo o jornada normal.",
      },
      {
        type: "h2",
        text: "Festivos manuales",
      },
      {
        type: "p",
        text: "Colombia tiene festivos fijos y móviles. La app incluye calendario de referencia y permite marcar festivos adicionales o cambios locales. Revisa que cada día laborado tenga el tipo correcto antes de cerrar el mes.",
      },
      {
        type: "callout",
        text: "Un error frecuente es registrar un domingo trabajado como día normal. Eso subestima devengados y recargos en tu resumen mensual.",
      },
    ],
  },
  ...reformaArticles,
];

export function getAllArticles(): BlogArticle[] {
  return blogArticles;
}

export function getArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogArticles.map((article) => article.slug);
}
