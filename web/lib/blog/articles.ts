import { reformaArticles } from "./articles-reforma";
import type { OfficialSource } from "./sources";
import { pickSources } from "./sources";

export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export type BlogFaqItem = { question: string; answer: string };

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
  sources?: OfficialSource[];
  relatedSlugs?: string[];
  faq?: BlogFaqItem[];
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
  if (article.faq) {
    for (const item of article.faq) {
      parts.push(item.question, item.answer);
    }
  }
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "calcular-liquidacion-quincenal-colombia",
    title: "Cómo calcular tu liquidación quincenal en Colombia",
    description:
      "Guía práctica 2026 para estimar devengados, auxilio de transporte ($249.095), descuentos de salud y pensión (4 %+4 %), y neto a pagar en nómina quincenal según el CST y decretos oficiales.",
    keywords: [
      "liquidación quincenal Colombia",
      "calcular nómina quincenal",
      "devengados y descuentos",
      "neto a pagar quincena",
      "SMMLV 2026 liquidación",
      "salario diario base 30",
    ],
    publishedAt: "2026-06-14",
    updatedAt: "2026-07-13",
    readingMinutes: 9,
    heroImage: "/images/guia/liquidacion-quincenal-colombia.png",
    sources: pickSources("decreto1469", "decreto1470", "decreto159", "cst", "ley100", "ley2466"),
    relatedSlugs: [
      "descuentos-salud-pension-nomina",
      "auxilio-transporte-salario-minimo-2026",
      "dominical-festivo-trabajo-colombia",
    ],
    faq: [
      {
        question: "¿La quincena es siempre el salario mensual dividido entre dos?",
        answer:
          "No. En liquidaciones laborales colombianas lo habitual es usar salario mensual ÷ 30 como valor diario y multiplicar por los días efectivamente laborados (y pagados) del período. Una quincena del 1 al 15 puede tener distintos días laborables, dominicales o festivos según el mes.",
      },
      {
        question: "¿Cuál es el salario mínimo y el auxilio de transporte en 2026?",
        answer:
          "Según el Decreto 1469 de 2025 (y el Decreto 159 de 2026 en régimen transitorio), el SMMLV es $1.750.905. El Decreto 1470 de 2025 fija el auxilio de transporte en $249.095 para quien devenga hasta 2 SMMLV ($3.501.810).",
      },
      {
        question: "¿Salud y pensión se descuentan sobre el auxilio de transporte?",
        answer:
          "No. El auxilio de transporte no hace parte de la base de cotización a salud ni pensión. Los aportes del trabajador (4 % salud + 4 % pensión) se calculan sobre el salario cotizable del período, con topes mínimos y máximos legales.",
      },
      {
        question: "¿Qué pasa si trabajé un domingo en la quincena?",
        answer:
          "Ese día genera recargo dominical/festivo según el calendario de la Ley 2466: 80 % hasta el 30 de junio de 2026 y 90 % desde el 1 de julio de 2026 (hacia 100 % en julio de 2027). Además puede sumarse recargo nocturno si laboraste entre las 7:00 p. m. y las 6:00 a. m.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "Si cobras cada quince días, tu liquidación no es simplemente «el salario partido en dos». Incluye días trabajados, recargos, auxilio de transporte proporcional y descuentos legales de seguridad social. Esta guía te explica cómo estimar tu quincena con cifras oficiales de 2026.",
      },
      {
        type: "h2",
        text: "Parámetros oficiales 2026 que debes tener a mano",
      },
      {
        type: "p",
        text: "El Decreto 1469 de 2025 fijó el salario mínimo mensual legal vigente (SMMLV) en $1.750.905 a partir del 1 de enero de 2026. El Decreto 159 de 2026 mantiene ese monto de forma transitoria. El Decreto 1470 de 2025 fijó el auxilio de transporte en $249.095 para trabajadores que devengan hasta dos SMMLV ($3.501.810).",
      },
      {
        type: "ul",
        items: [
          "SMMLV 2026: $1.750.905 (Decretos 1469/2025 y 159/2026).",
          "Auxilio de transporte: $249.095 / mes (Decreto 1470/2025), proporcional a días trabajados sobre base 30.",
          "Tope para recibir auxilio: hasta $3.501.810 de salario mensual (2 SMMLV).",
          "Descuentos del trabajador: 4 % salud + 4 % pensión sobre la base de cotización (Ley 100 de 1993 y normas del sistema).",
        ],
      },
      {
        type: "h2",
        text: "¿Qué es una nómina quincenal?",
      },
      {
        type: "p",
        text: "En Colombia muchos contratos pagan dos veces al mes (períodos del 1 al 15 y del 16 al fin de mes, u otras ventanas acordadas). Lo devengado en cada quincena depende de los días efectivamente laborados y de los conceptos del Código Sustantivo del Trabajo (CST): salario ordinario, recargos, auxilios y descuentos autorizados.",
      },
      {
        type: "h2",
        text: "Pasos para estimar tu quincena",
      },
      {
        type: "ul",
        items: [
          "Identifica tu salario básico mensual y si aplicas al auxilio ($249.095) por no superar 2 SMMLV.",
          "Calcula el valor diario: salario mensual ÷ 30 (base habitual en liquidaciones laborales).",
          "Multiplica por los días trabajados (o pagados) en la quincena, incluyendo domingo/festivo si laboraste.",
          "Suma recargos nocturnos (35 % entre 7:00 p. m. y 6:00 a. m.), extras u otros conceptos del período.",
          "Resta salud (4 %) y pensión (4 %) sobre la base de cotización, y otros descuentos autorizados.",
        ],
      },
      {
        type: "h2",
        text: "Ejemplo numérico con salario mínimo 2026",
      },
      {
        type: "p",
        text: "Supón un trabajador con SMMLV ($1.750.905) y 15 días laborados en la primera quincena, sin recargos. Valor diario ≈ $58.363,50 → básico quincenal ≈ $875.452. Auxilio proporcional ≈ ($249.095 × 15) / 30 = $124.547. Base cotizable típica ≈ $875.452 → salud 4 % ≈ $35.018 y pensión 4 % ≈ $35.018. Neto aproximado ≈ $875.452 + $124.547 − $70.036 = $929.963 (estimación; tu colilla puede incluir más conceptos).",
      },
      {
        type: "h2",
        text: "Recargos que pueden subir la quincena",
      },
      {
        type: "p",
        text: "Con la Ley 2466 de 2025, el recargo por trabajo en domingo o festivo es del 80 % del 1 de julio de 2025 al 30 de junio de 2026, y del 90 % desde el 1 de julio de 2026 (100 % desde el 1 de julio de 2027). El recargo nocturno ordinario es del 35 % entre las 7:00 p. m. y las 6:00 a. m. Desde el 15 de julio de 2026 la jornada máxima semanal baja a 42 horas (Ley 2101 de 2021 / Ley 2466).",
      },
      {
        type: "h2",
        text: "Errores comunes",
      },
      {
        type: "ul",
        items: [
          "Dividir el salario entre 2 sin contar días reales trabajados.",
          "Olvidar el auxilio de transporte proporcional ($249.095 / 30 × días) cuando corresponde.",
          "No registrar dominical o festivo laborado (recargo 80 % o 90 % según la fecha).",
          "Descontar salud/pensión sobre el auxilio de transporte (no corresponde).",
          "Confundir tu estimación personal con el desprendible oficial del empleador.",
        ],
      },
      {
        type: "callout",
        text: "Nominapp registra jornadas día a día y calcula la liquidación quincenal o mensual según tu perfil y los parámetros 2026. Es una estimación personal: siempre contrasta con el desprendible de tu empleador y la norma oficial.",
      },
    ],
  },
  {
    slug: "recargo-nocturno-colombia-2026",
    title: "Recargo nocturno en Colombia: cómo se calcula en 2026",
    description:
      "Recargo nocturno del 35 % entre las 7:00 p. m. y las 6:00 a. m. según la Ley 2466/2025. Ejemplo con SMMLV $1.750.905 y cómo diferenciarlo de la hora extra.",
    keywords: [
      "recargo nocturno Colombia",
      "jornada nocturna 7pm",
      "Ley 2466 2025",
      "hora nocturna trabajo",
      "recargo 35 por ciento",
      "jornada nocturna Colombia 2026",
    ],
    publishedAt: "2026-06-14",
    updatedAt: "2026-07-13",
    readingMinutes: 8,
    heroImage: "/images/guia/recargo-nocturno-colombia.png",
    sources: pickSources("ley2466", "cst", "decreto1469", "mintrabajo"),
    relatedSlugs: [
      "recargos-dominicales-nocturnos-colombia-2026",
      "jornada-42-horas-colombia-2026",
      "dominical-festivo-trabajo-colombia",
    ],
    faq: [
      {
        question: "¿A qué hora empieza la jornada nocturna en 2026?",
        answer:
          "Desde la Ley 2466 de 2025, la jornada nocturna va de las 7:00 p. m. a las 6:00 a. m. del día siguiente. Antes iniciaba a las 9:00 p. m.; el cambio anticipó dos horas de recargo nocturno.",
      },
      {
        question: "¿Cuál es el porcentaje del recargo nocturno?",
        answer:
          "El 35 % sobre el valor de la hora ordinaria de trabajo (factor 1,35), salvo pactos colectivos o convenciones más favorables para el trabajador.",
      },
      {
        question: "¿El recargo nocturno es lo mismo que una hora extra?",
        answer:
          "No. El recargo nocturno remunera laborar en franja nocturna aunque sea jornada ordinaria. La hora extra remunera trabajo que excede la jornada máxima (44 h semanales hasta el 14 de julio de 2026; 42 h desde el 15 de julio de 2026). Pueden combinarse en escenarios de extra nocturna.",
      },
      {
        question: "¿Cuánto vale una hora ordinaria con el mínimo 2026?",
        answer:
          "Con SMMLV $1.750.905 y referencia de jornada reducida (p. ej. divisor ≈ 182 h/mes con 42 h semanales), la hora ordinaria ronda unos $9.620. Cada hora nocturna ordinaria se liquida aproximadamente como esa hora × 1,35.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "Trabajar en horario nocturno genera un recargo sobre el valor ordinario de la hora. Desde la Ley 2466 de 2025, la jornada nocturna inicia a las 7:00 p. m. (antes era 9:00 p. m.) y va hasta las 6:00 a. m. El recargo es del 35 %. Si registras turnos nocturnos, conviene llevar control para verificar tu liquidación.",
      },
      {
        type: "h2",
        text: "¿Qué es la jornada nocturna?",
      },
      {
        type: "p",
        text: "Es el trabajo realizado entre las 7:00 p. m. y las 6:00 a. m. del día siguiente, conforme a la reforma laboral (Ley 2466). Las horas dentro de ese rango tienen un recargo del 35 % sobre el valor de la hora ordinaria, además del salario correspondiente.",
      },
      {
        type: "h2",
        text: "Marco legal y porcentaje",
      },
      {
        type: "p",
        text: "El CST, modificado por la Ley 2466, distingueió la franja nocturna. El factor aplicado en liquidaciones es 1,35 (hora ordinaria + 35 %). Si además trabajas domingo o festivo, el recargo dominical/festivo (80 % hasta junio 2026; 90 % desde julio 2026) se acumula según las reglas de liquidación aplicables.",
      },
      {
        type: "h2",
        text: "Ejemplo con SMMLV 2026 ($1.750.905)",
      },
      {
        type: "ul",
        items: [
          "Salario mensual mínimo: $1.750.905 (Decreto 1469 de 2025 / Decreto 159 de 2026).",
          "Valor hora de referencia con jornada 42 h (divisor ≈ 182): ≈ $9.620.",
          "Hora nocturna ordinaria (× 1,35): ≈ $12.987.",
          "Si trabajas 4 horas nocturnas en un día: ≈ $51.948 solo por esas horas (antes de otros recargos).",
        ],
      },
      {
        type: "p",
        text: "Con un salario de $3.000.000, el valor hora es mayor (≈ $16.484 con el mismo divisor 182) y cada hora nocturna ordinaria rondaría ≈ $22.253. En Nominapp marcas entrada y salida; la app identifica el tramo nocturno automáticamente.",
      },
      {
        type: "h2",
        text: "Recargo nocturno vs. hora extra",
      },
      {
        type: "p",
        text: "Son conceptos distintos. La hora extra es trabajo adicional a la jornada legal semanal (44 horas hasta el 14 de julio de 2026; 42 horas desde el 15 de julio de 2026, Ley 2101 / Ley 2466). El recargo nocturno es el sobreprecio por laborar en franja nocturna aunque sea jornada ordinaria. La extra diurna lleva 25 %; la extra nocturna, 75 % sobre la hora ordinaria en los factores habituales del CST.",
      },
      {
        type: "h2",
        text: "¿Desde cuándo aplica el cambio a las 7:00 p. m.?",
      },
      {
        type: "p",
        text: "El anticipo de la jornada nocturna a las 7:00 p. m. opera desde el 25 de diciembre de 2025, conforme a la entrada en vigor prevista en la Ley 2466. Si tu empleador liquidó diciembre 2025 o 2026 como si la nocturna empezara a las 9:00 p. m., podrías tener diferencias reclamables (las acreencias laborales suelen prescribir a los 3 años).",
      },
      {
        type: "callout",
        text: "Registra cada jornada con hora de entrada y salida. Sin ese dato es imposible estimar bien el recargo nocturno acumulado del mes. Contrasta siempre con tu desprendible oficial.",
      },
    ],
  },
  {
    slug: "auxilio-transporte-salario-minimo-2026",
    title: "Auxilio de transporte y salario mínimo 2026 en Colombia",
    description:
      "SMMLV $1.750.905 (Decreto 1469/2025) y auxilio de transporte $249.095 (Decreto 1470/2025): quién tiene derecho, tope de 2 SMMLV y cómo se paga proporcional.",
    keywords: [
      "auxilio de transporte 2026",
      "salario mínimo Colombia 2026",
      "SMMLV 1750905",
      "tope auxilio transporte",
      "Decreto 1469 2025",
      "Decreto 1470 2025",
    ],
    publishedAt: "2026-06-14",
    updatedAt: "2026-07-13",
    readingMinutes: 8,
    heroImage: "/images/guia/auxilio-transporte-salario-minimo-colombia.png",
    sources: pickSources("decreto1469", "decreto1470", "decreto159", "cst", "mintrabajo"),
    relatedSlugs: [
      "calcular-liquidacion-quincenal-colombia",
      "prestaciones-prima-cesantias-colombia",
      "descuentos-salud-pension-nomina",
    ],
    faq: [
      {
        question: "¿Cuánto es el salario mínimo y el auxilio en 2026?",
        answer:
          "SMMLV: $1.750.905 (Decreto 1469 de 2025; Decreto 159 de 2026 lo mantiene transitoriamente). Auxilio de transporte: $249.095 (Decreto 1470 de 2025). Suma de referencia para quien gana el mínimo: $2.000.000 mensuales.",
      },
      {
        question: "¿Hasta qué salario aplica el auxilio de transporte?",
        answer:
          "Hasta dos SMMLV, es decir $3.501.810 mensuales. Si tu salario básico supera ese tope, no tienes derecho al auxilio legal de transporte.",
      },
      {
        question: "¿El auxilio entra en cesantías, prima o vacaciones?",
        answer:
          "No. El auxilio de transporte no hace parte de la base salarial para prestaciones sociales (prima, cesantías, intereses de cesantías, vacaciones). Tampoco se descuenta salud ni pensión sobre él.",
      },
      {
        question: "¿Cómo se paga si no trabajé el mes completo?",
        answer:
          "Se liquida de forma proporcional a los días trabajados sobre base 30. Ejemplo: 20 días → ($249.095 × 20) / 30 ≈ $166.063.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "El auxilio de transporte es un apoyo legal para quienes devengan hasta dos salarios mínimos mensuales legales vigentes (SMMLV). No hace parte del salario base para prestaciones, pero sí impacta tu pago mensual si cumples requisitos. En 2026 los montos están fijados por decretos oficiales.",
      },
      {
        type: "h2",
        text: "Cifras oficiales 2026",
      },
      {
        type: "p",
        text: "El Decreto 1469 de 2025 estableció el SMMLV en $1.750.905 desde el 1 de enero de 2026. El Decreto 159 de 2026 mantiene ese valor de forma transitoria mientras se resuelve el proceso ante el Consejo de Estado. El Decreto 1470 de 2025 fijó el auxilio de transporte en $249.095 para trabajadores que ganen hasta 2 SMMLV ($3.501.810).",
      },
      {
        type: "ul",
        items: [
          "SMMLV: $1.750.905",
          "Auxilio de transporte: $249.095",
          "Tope salarial para el auxilio: $3.501.810 (2 × SMMLV)",
          "Total orientativo mínimo + auxilio: $2.000.000",
        ],
      },
      {
        type: "h2",
        text: "¿Quién tiene derecho?",
      },
      {
        type: "ul",
        items: [
          "Trabajadores con contrato laboral que devenguen hasta 2 SMMLV ($3.501.810).",
          "No aplica cuando el empleador asume el transporte de forma distinta o en roles exceptuados por norma.",
          "Si superas el tope salarial, pierdes el auxilio de transporte legal.",
        ],
      },
      {
        type: "h2",
        text: "Valor y proporcionalidad",
      },
      {
        type: "p",
        text: "En la liquidación se paga de forma proporcional a los días trabajados del mes (base 30). Valor diario del auxilio ≈ $8.303,17 ($249.095 ÷ 30). Quince días: ≈ $124.547. Si faltaste días no remunerados, el auxilio se reduce en la misma proporción.",
      },
      {
        type: "h2",
        text: "Relación con salud, pensión y prestaciones",
      },
      {
        type: "p",
        text: "El auxilio no se descuenta por salud ni pensión y no integra la base de cesantías, prima de servicios ni vacaciones. Sí se suma al neto a pagar del período. El salario cotizable para seguridad social se calcula sobre el salario (y conceptos salariales), no sobre el auxilio.",
      },
      {
        type: "h2",
        text: "Cómo usarlo en tu estimación de nómina",
      },
      {
        type: "p",
        text: "Nominapp incorpora los parámetros legales de 2026 (SMMLV $1.750.905, auxilio $249.095, tope 2 SMMLV). Configura tu salario mensual en el perfil y la app aplicará el auxilio si estás dentro del rango permitido, de forma proporcional a los días registrados.",
      },
      {
        type: "callout",
        text: "Verifica en tu colilla la línea «auxilio de transporte». Si ganas $3.501.810 o menos y no aparece (y no hay excepción válida), pide aclaración a tu empleador o al Ministerio del Trabajo.",
      },
    ],
  },
  {
    slug: "descuentos-salud-pension-nomina",
    title: "Descuentos de salud y pensión en la nómina colombiana",
    description:
      "Aportes del trabajador: 4 % salud y 4 % pensión sobre la base de cotización. Topes, SMMLV $1.750.905 y cómo verificar tu desprendible según la Ley 100.",
    keywords: [
      "descuento salud nómina",
      "descuento pensión 4 por ciento",
      "aportes empleado Colombia",
      "base de cotización",
      "Ley 100 seguridad social",
      "IBC nómina Colombia",
    ],
    publishedAt: "2026-06-14",
    updatedAt: "2026-07-13",
    readingMinutes: 8,
    heroImage: "/images/guia/descuentos-salud-pension-colombia.png",
    sources: pickSources("ley100", "decreto1469", "decreto159", "cst", "mintrabajo"),
    relatedSlugs: [
      "calcular-liquidacion-quincenal-colombia",
      "prestaciones-prima-cesantias-colombia",
      "auxilio-transporte-salario-minimo-2026",
    ],
    faq: [
      {
        question: "¿Cuánto me descuentan de salud y pensión?",
        answer:
          "Como regla general del régimen contributivo, el trabajador aporta 4 % a salud (EPS) y 4 % a pensión (AFP u otro régimen) sobre el ingreso base de cotización (IBC) del período. El empleador aporta porcentajes adicionales que no se restan de tu neto.",
      },
      {
        question: "¿El auxilio de transporte entra en la base?",
        answer:
          "No. El auxilio de transporte ($249.095 en 2026) no hace parte de la base de cotización a salud ni pensión.",
      },
      {
        question: "¿Cuál es el tope mínimo y máximo de cotización?",
        answer:
          "El IBC no puede ser inferior a 1 SMMLV ($1.750.905 en 2026) para cotizantes con salario mínimo, y en reglas generales de pensión el tope máximo es 25 SMMLV. Nominapp aplica estos parámetros al estimar tu liquidación.",
      },
      {
        question: "¿Cómo verifico el descuento en un ejemplo?",
        answer:
          "Si tu IBC quincenal es $875.452 (mitad de un SMMLV mensual en un esquema simplificado), salud ≈ $35.018 y pensión ≈ $35.018. Suma de descuentos ≈ $70.036 en esa quincena.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "En cada liquidación tu empleador descuenta tu parte de seguridad social: 4 % a salud y 4 % a pensión sobre la base de cotización del período. Entender esto, con el SMMLV 2026 en $1.750.905, te ayuda a detectar errores en el desprendible.",
      },
      {
        type: "h2",
        text: "Marco normativo",
      },
      {
        type: "p",
        text: "La Ley 100 de 1993 organiza el Sistema de Seguridad Social Integral. Los porcentajes de cotización a salud y pensiones, y las reglas del IBC, se desarrollan en decretos reglamentarios y normas posteriores. El monto del salario mínimo que alimenta topes mínimos lo fijan anualmente los decretos de salario (en 2026: Decretos 1469/2025 y 159/2026).",
      },
      {
        type: "h2",
        text: "Base de cotización (IBC)",
      },
      {
        type: "p",
        text: "Generalmente incluye el salario devengado del período (básico, comisiones salariales y algunos auxilios según norma). No todos los pagos entran: el auxilio de transporte no cotiza; los bonos ocasionales pueden tratarse distinto según el caso. El IBC se reporta también en la PILA.",
      },
      {
        type: "h2",
        text: "Los dos descuentos del 4 %",
      },
      {
        type: "ul",
        items: [
          "Salud (EPS): 4 % a cargo del trabajador sobre el IBC.",
          "Pensión (AFP u otro régimen): 4 % a cargo del trabajador sobre la misma base.",
          "El empleador paga aportes patronales adicionales (salud, pensión, riesgos, parafiscales según aplique) que no reducen tu neto, pero sí el costo laboral.",
        ],
      },
      {
        type: "h2",
        text: "Ejemplo con SMMLV 2026",
      },
      {
        type: "p",
        text: "Trabajador con salario mensual $1.750.905 y mes completo. IBC mensual ≈ $1.750.905. Salud 4 % = $70.036; pensión 4 % = $70.036; total descuentos ≈ $140.072. Neto aproximado de salario (sin auxilio) ≈ $1.610.833; si además recibe auxilio $249.095, el neto orientativo ronda $1.859.928 antes de otros descuentos (libranzas, embargos, etc.).",
      },
      {
        type: "h2",
        text: "Topes mínimos y máximos",
      },
      {
        type: "p",
        text: "Existen topes de cotización vinculados al SMMLV: mínimo habitual 1 SMMLV ($1.750.905) y máximo de 25 SMMLV para pensión en reglas generales. Nominapp aplica los topes configurados para 2026 al estimar tu liquidación.",
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
      "Cómo estimar prima de servicios, cesantías e intereses del 12 % con el SMMLV 2026 ($1.750.905). Qué entra en la base y por qué el auxilio de transporte no.",
    keywords: [
      "prima de servicios Colombia",
      "cesantías",
      "intereses cesantías 12 por ciento",
      "prestaciones sociales empleado",
      "CST prestaciones 2026",
    ],
    publishedAt: "2026-06-14",
    updatedAt: "2026-07-13",
    readingMinutes: 9,
    heroImage: "/images/guia/prestaciones-prima-cesantias-colombia.png",
    sources: pickSources("cst", "decreto1469", "decreto1470", "mintrabajo"),
    relatedSlugs: [
      "calcular-liquidacion-quincenal-colombia",
      "auxilio-transporte-salario-minimo-2026",
      "descuentos-salud-pension-nomina",
    ],
    faq: [
      {
        question: "¿Cómo se calcula la prima de servicios?",
        answer:
          "Equivale a 15 días de salario por cada semestre laborado (pagos típicos en junio y diciembre), proporcional al tiempo trabajado. Se calcula sobre el salario que integra base de prestaciones; el auxilio de transporte ($249.095) no entra.",
      },
      {
        question: "¿Cuándo se consignan las cesantías?",
        answer:
          "Como regla general, el empleador debe consignar las cesantías del año anterior en el fondo antes del 14 de febrero. Corresponde aproximadamente un mes de salario por año, proporcional a días laborados (base 360 en muchas liquidaciones).",
      },
      {
        question: "¿A cuánto equivalen los intereses sobre cesantías?",
        answer:
          "Al 12 % anual sobre el saldo de cesantías causados, pagados al trabajador (habitualmente en el primer semestre del año siguiente, según las reglas aplicables).",
      },
      {
        question: "¿Qué suma de referencia hay con el mínimo 2026?",
        answer:
          "Con salario $1.750.905 y año completo: cesantías ≈ $1.750.905; intereses ≈ $210.108 (12 %). Prima semestral completa ≈ $875.452 por semestre (15 días). Cifras orientativas sin variaciones de salario mid-año.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "Además del salario periódico, el trabajador acumula prestaciones sociales: prima de servicios, cesantías e intereses sobre cesantías, reguladas principalmente en el Código Sustantivo del Trabajo. Conocerlas con las cifras 2026 ayuda a planear finanzas y validar pagos anuales o semestrales.",
      },
      {
        type: "h2",
        text: "Prima de servicios",
      },
      {
        type: "p",
        text: "Equivale a 15 días de salario por cada semestre trabajado (junio y diciembre en la mayoría de casos). Se calcula sobre salario base y conceptos que hacen base salarial. No incluye el auxilio de transporte ($249.095 en 2026, Decreto 1470). Con SMMLV $1.750.905, 15 días ≈ $875.452 por semestre completo.",
      },
      {
        type: "h2",
        text: "Cesantías e intereses",
      },
      {
        type: "ul",
        items: [
          "Cesantías: un mes de salario por año trabajado, proporcional al tiempo (base habitual 360 días).",
          "Se consignan al fondo de cesantías antes del 14 de febrero del año siguiente.",
          "Intereses: 12 % anual sobre el saldo de cesantías, pagados al trabajador según la oportunidad legal.",
        ],
      },
      {
        type: "h2",
        text: "Ejemplo con salario mínimo 2026",
      },
      {
        type: "p",
        text: "Salario promedio $1.750.905 y 360 días del año: cesantías ≈ $1.750.905. Intereses al 12 % ≈ $210.108. Si solo laboraste 180 días, cesantías ≈ mitad ($875.452) e intereses sobre ese saldo. Recuerda: el auxilio de transporte no suma a esta base.",
      },
      {
        type: "h2",
        text: "Qué sí y qué no entra en la base",
      },
      {
        type: "ul",
        items: [
          "Sí (regla general): salario ordinario y conceptos salariales habituales según CST y jurisprudencia.",
          "No: auxilio de transporte legal.",
          "Casos especiales (comisiones, viáticos permanentes, etc.): dependen de si tienen carácter salarial.",
        ],
      },
      {
        type: "h2",
        text: "Estimación personal",
      },
      {
        type: "p",
        text: "Nominapp estima indicadores de prestaciones según jornadas y salario registrados, usando parámetros alineados al CST y al SMMLV 2026. Son referencias educativas, no certificaciones oficiales de fondo o empleador.",
      },
      {
        type: "callout",
        text: "Las prestaciones reales pueden variar si tuviste licencias, suspensiones o cambios de salario mid-año. Mantén tu perfil laboral actualizado en la app y conserva tus desprendibles.",
      },
    ],
  },
  {
    slug: "dominical-festivo-trabajo-colombia",
    title: "Dominical y festivo laborado: recargos en Colombia",
    description:
      "Recargo dominical/festivo 80 % (hasta jun/2026) y 90 % (desde jul/2026) según Ley 2466. Compensatorio, nocturno 35 % y calendario 2026.",
    keywords: [
      "dominical festivo Colombia",
      "recargo dominical 90 por ciento",
      "festivo laborado",
      "compensatorio domingo",
      "Ley 2466 recargo festivo",
    ],
    publishedAt: "2026-06-14",
    updatedAt: "2026-07-13",
    readingMinutes: 8,
    heroImage: "/images/guia/dominical-festivo-trabajo-colombia.png",
    sources: pickSources("ley2466", "cst", "decreto1469", "mintrabajo"),
    relatedSlugs: [
      "recargos-dominicales-nocturnos-colombia-2026",
      "recargo-nocturno-colombia-2026",
      "calcular-liquidacion-quincenal-colombia",
    ],
    faq: [
      {
        question: "¿Cuál es el recargo por trabajar domingo o festivo en 2026?",
        answer:
          "Según el calendario de la Ley 2466: 80 % del 1 de julio de 2025 al 30 de junio de 2026; 90 % del 1 de julio de 2026 al 30 de junio de 2027; 100 % desde el 1 de julio de 2027. Antes de julio de 2025 era 75 %.",
      },
      {
        question: "¿Qué es el día compensatorio?",
        answer:
          "Cuando el trabajo en domingo o festivo es habitual (p. ej. 3 o más en el mes, según la práctica y la reforma), además del recargo puedes tener derecho a un día de descanso compensatorio. Revisa tu reglamento interno y el CST modificado por la Ley 2466.",
      },
      {
        question: "¿Se suma el recargo nocturno?",
        answer:
          "Sí puede acumularse: si laboras domingo/festivo entre las 7:00 p. m. y las 6:00 a. m., aplican las reglas de liquidación de recargo dominical/festivo más el 35 % nocturno, según factores del CST.",
      },
      {
        question: "¿Cómo estimo el valor con el mínimo 2026?",
        answer:
          "Con SMMLV $1.750.905 y hora de referencia ≈ $9.620 (divisor 182), un domingo diurno al 90 % se liquida cerca de $18.278 por hora (hora + 90 %). Al 80 % (antes del 1 de julio de 2026) sería ≈ $17.316 por hora.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "Trabajar un domingo o un festivo no es lo mismo que un día ordinario. La Ley 2466 de 2025 elevó de forma gradual el recargo dominical y festivo. Si no los registras, tu estimación de nómina quedará por debajo de lo real.",
      },
      {
        type: "h2",
        text: "Cronograma oficial del recargo dominical/festivo",
      },
      {
        type: "ul",
        items: [
          "Antes del 1 de julio de 2025: 75 %",
          "Del 1 de julio de 2025 al 30 de junio de 2026: 80 %",
          "Del 1 de julio de 2026 al 30 de junio de 2027: 90 %",
          "Desde el 1 de julio de 2027: 100 %",
        ],
      },
      {
        type: "p",
        text: "Ese porcentaje se aplica sobre el valor ordinario de la jornada u hora, conforme al CST y la Ley 2466. Sectores con reglas especiales pueden tener particularidades; en la duda, consulta el MinTrabajo o asesoría laboral.",
      },
      {
        type: "h2",
        text: "Ejemplo con SMMLV $1.750.905",
      },
      {
        type: "p",
        text: "Hora ordinaria de referencia ≈ $9.620. Domingo/festivo diurno al 90 % (julio 2026 en adelante en este tramo): ≈ $18.278/h. Si además son 3 horas nocturnas (7:00 p. m.–6:00 a. m.), el tramo nocturno se liquida con el factor combinado aplicables (dominical/festivo + nocturno 35 %).",
      },
      {
        type: "h2",
        text: "Día compensatorio",
      },
      {
        type: "p",
        text: "Cuando laboras domingo o festivo, además del recargo puede corresponder un día de descanso compensatorio, especialmente en trabajo habitual en descanso. En Nominapp puedes marcar el tipo de día en el calendario para que el cálculo refleje dominical, festivo o jornada normal.",
      },
      {
        type: "h2",
        text: "Festivos y calendario 2026",
      },
      {
        type: "p",
        text: "Colombia tiene festivos fijos y móviles (p. ej. 1 de enero, 20 de julio, 7 de agosto, 25 de diciembre, entre otros). La app incluye calendario de referencia 2026 y permite marcar festivos adicionales o cambios locales. Revisa que cada día laborado tenga el tipo correcto antes de cerrar el mes.",
      },
      {
        type: "callout",
        text: "Un error frecuente es registrar un domingo trabajado como día normal. Eso subestima devengados: al 90 % estás dejando de estimar casi el doble de la hora ordinaria por cada hora dominical.",
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
