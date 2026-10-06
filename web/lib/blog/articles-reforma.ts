import type { BlogArticle } from "./articles";
import { pickSources } from "./sources";

export const reformaArticles: BlogArticle[] = [
  {
    slug: "lunes-festivo-reponer-horas-colombia-42-horas",
    title: "¿Se deben reponer las horas de un lunes festivo en Colombia?",
    description:
      "Con la jornada máxima de 42 horas semanales, los festivos remunerados no se recuperan en el resto de la semana. Qué dice el CST, qué pasa con el salario y cuándo sí hay recargos.",
    keywords: [
      "lunes festivo reponer horas Colombia",
      "festivo remunerado jornada 42 horas",
      "Artículo 177 CST festivos",
      "recuperar lunes festivo trabajo",
      "jornada laboral 42 horas festivo",
      "descanso remunerado festivos Colombia",
    ],
    publishedAt: "2026-07-16",
    updatedAt: "2026-07-16",
    readingMinutes: 7,
    heroImage: "/images/guia/lunes-festivo-jornada-42-horas-colombia.svg",
    sources: pickSources("cst", "ley2101", "ley2466", "mintrabajo"),
    relatedSlugs: [
      "jornada-42-horas-colombia-2026",
      "dominical-festivo-trabajo-colombia",
      "recargos-dominicales-nocturnos-colombia-2026",
    ],
    faq: [
      {
        question: "¿Mi empleador puede obligarme a recuperar el lunes festivo?",
        answer:
          "No como regla general. El festivo es un descanso remunerado: no se descuenta del salario ni se convierte en una deuda de horas para martes a sábado.",
      },
      {
        question: "¿Me pueden pagar menos esa semana porque trabajé menos horas efectivas?",
        answer:
          "No. El Artículo 177 del CST reconoce el descanso remunerado en días de fiesta civil o religiosa. La semana se paga completa, aunque por el festivo haya menos horas efectivamente laboradas.",
      },
      {
        question: "¿Qué pasa si trabajo el festivo?",
        answer:
          "Si laboras el lunes festivo, ya no es descanso sino trabajo en día festivo. Debe liquidarse con el recargo dominical/festivo vigente y, si aplica, con recargo nocturno u horas extra.",
      },
      {
        question: "¿La jornada de 42 horas cambia esta regla?",
        answer:
          "No. La jornada de 42 horas fija el máximo semanal ordinario desde el 15 de julio de 2026, pero no elimina el descanso remunerado en festivos ni autoriza a recuperar esas horas sin pago adicional.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "Cuando un lunes es festivo en Colombia, muchas personas se preguntan si deben trabajar más horas entre martes y sábado para completar la jornada semanal. Con la entrada en vigor de la jornada máxima de 42 horas, la duda se volvió más frecuente. La respuesta jurídica y práctica es clara: el festivo remunerado no se repone.",
      },
      {
        type: "callout",
        text: "Respuesta corta: si el lunes era tu día ordinario de trabajo y fue festivo, esa semana tendrás menos horas efectivas de labor, pero tu salario ordinario se mantiene completo. No debes recuperar ese tiempo.",
      },
      {
        type: "image",
        src: "/images/guia/lunes-festivo-descanso-remunerado-colombia.svg",
        alt: "Calendario laboral colombiano con lunes festivo marcado como descanso remunerado",
        caption:
          "El lunes festivo reduce automáticamente las horas efectivas de esa semana: no crea una deuda de tiempo.",
      },
      {
        type: "h2",
        text: "Base legal: el festivo es descanso remunerado",
      },
      {
        type: "p",
        text: "El Artículo 177 del Código Sustantivo del Trabajo establece el derecho al descanso remunerado en días de fiesta civil o religiosa. En términos sencillos: si el calendario trae un festivo y ese día hacía parte de tu jornada ordinaria, el empleador debe pagarlo como descanso. No puede tratarlo como ausencia injustificada ni como permiso recuperable.",
      },
      {
        type: "h2",
        text: "Qué pasa con el salario de esa semana",
      },
      {
        type: "p",
        text: "El salario no se toca. El trabajador recibe su pago ordinario completo por la semana o quincena, como si el festivo hubiera sido un día trabajado dentro de la jornada normal. Por eso un festivo no debe generar descuento en nómina ni reducción del básico por ausencia de horas efectivas ese día.",
      },
      {
        type: "h2",
        text: "Por qué no se recupera de martes a sábado",
      },
      {
        type: "p",
        text: "Exigir horas adicionales para «recuperar» el lunes festivo desconoce la naturaleza del descanso remunerado. Si el empleador aumenta la jornada de otros días o pide trabajar un sábado que no estaba pactado, esas horas deben analizarse como jornada adicional, horas extra o modificación de horario, no como simple compensación gratuita del festivo.",
      },
      {
        type: "ul",
        items: [
          "No es legal descontar el lunes festivo del salario ordinario.",
          "No es correcto convertir el festivo en una deuda de horas del trabajador.",
          "No se pueden imponer horas extra sin reconocer los recargos de ley cuando se superan los límites aplicables.",
          "La distribución de la jornada debe respetar lo pactado, el descanso semanal y el máximo legal vigente.",
        ],
      },
      {
        type: "h2",
        text: "Ejemplo con jornada máxima de 42 horas",
      },
      {
        type: "p",
        text: "Supón una persona con jornada ordinaria de lunes a viernes, 42 horas semanales. Si el lunes es festivo, esa semana no queda obligada a meter las horas del lunes entre martes y viernes. Trabajará los días ordinarios restantes según su horario y recibirá el salario completo. El festivo simplemente reduce las horas efectivas trabajadas de esa semana.",
      },
      {
        type: "image",
        src: "/images/guia/semana-42-horas-festivo-colombia.svg",
        alt: "Comparación de semana laboral con jornada de 42 horas y lunes festivo no recuperable",
        caption:
          "La jornada máxima semanal opera como techo. El festivo remunerado puede hacer que la semana real quede por debajo de ese máximo.",
      },
      {
        type: "h2",
        text: "Cuándo sí hay pago adicional",
      },
      {
        type: "p",
        text: "La situación cambia si trabajas el festivo. En ese caso no estás descansando: estás laborando en día de descanso obligatorio. Debe pagarse el recargo dominical/festivo vigente según la Ley 2466 y el CST. Si además trabajas de noche, después de las 7:00 p. m. y hasta las 6:00 a. m., puede sumarse el recargo nocturno del 35 %.",
      },
      {
        type: "h2",
        text: "Qué hacer si te piden recuperar el festivo",
      },
      {
        type: "ul",
        items: [
          "Pide la instrucción por escrito y solicita que indiquen la base legal.",
          "Revisa tu contrato, reglamento interno y desprendible de nómina.",
          "Verifica si las horas adicionales fueron pagadas como extra o recargo cuando correspondía.",
          "Si hay descuento o imposición de horas sin pago, consulta al Ministerio del Trabajo o a un asesor laboral.",
        ],
      },
      {
        type: "callout",
        text: "En Nominapp puedes marcar festivos, registrar si realmente los trabajaste y comparar tu estimación con el desprendible. La app ayuda a llevar control, pero la fuente oficial sigue siendo el CST, la Ley 2101, la Ley 2466 y el Ministerio del Trabajo.",
      },
    ],
  },
  {
    slug: "jornada-42-horas-colombia-2026",
    title: "Jornada de 42 horas en Colombia 2026: todo lo que debes saber como empleado",
    description:
      "A partir del 15 de julio de 2026 la jornada máxima baja a 42 horas semanales. Qué dice la Ley 2466 y la Ley 2101, si tu salario puede bajar y cómo exigir el cumplimiento.",
    keywords: [
      "jornada laboral 42 horas Colombia",
      "reforma laboral 2026 empleados",
      "horas de trabajo Colombia julio 2026",
      "Ley 2466 jornada laboral",
      "cuántas horas se trabaja en Colombia 2026",
      "Ley 2101 jornada laboral",
    ],
    publishedAt: "2026-06-28",
    updatedAt: "2026-07-13",
    readingMinutes: 10,
    heroImage: "/images/guia/jornada-42-horas-colombia.png",
    sources: pickSources("ley2466", "ley2101", "decreto1469", "cst", "mintrabajo"),
    relatedSlugs: [
      "recargo-nocturno-colombia-2026",
      "recargos-dominicales-nocturnos-colombia-2026",
      "contratos-derechos-empleados-colombia-2026",
    ],
    faq: [
      {
        question: "¿Si trabajo en turno rotativo me aplica la jornada de 42 horas?",
        answer:
          "Sí. El promedio semanal no puede superar las 42 horas máximas a partir del 15 de julio de 2026, conforme a la Ley 2101 de 2021 y la Ley 2466 de 2025.",
      },
      {
        question: "¿Puedo acordar trabajar más de 42 horas si quiero ganar más?",
        answer:
          "Solo si tu empleador solicita horas extra formalmente, te paga los recargos (extra diurna 25 %, extra nocturna 75 % sobre la hora ordinaria) y no se superan los límites legales (habitualmente hasta 2 horas diarias y 12 semanales).",
      },
      {
        question: "¿El salario mínimo cambió también?",
        answer:
          "Sí. Desde enero de 2026, el SMMLV es $1.750.905 (Decreto 1469 de 2025 / Decreto 159 de 2026) más $249.095 de auxilio de transporte (Decreto 1470 de 2025), total orientativo $2.000.000 mensuales si aplicas al auxilio.",
      },
      {
        question: "¿Mi salario puede bajar porque trabajo menos horas?",
        answer:
          "No. La reducción de la jornada máxima no autoriza reducir el salario. Si tu empleador lo intenta, puedes acudir al Ministerio del Trabajo.",
      },
      {
        question: "¿A qué hora empieza la jornada nocturna?",
        answer:
          "Desde la Ley 2466, entre las 7:00 p. m. y las 6:00 a. m., con recargo nocturno del 35 % sobre la hora ordinaria.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "A partir del 15 de julio de 2026, Colombia reduce oficialmente su jornada máxima laboral a 42 horas semanales. Esto no es un rumor ni una propuesta: ya es ley (Ley 2101 de 2021 y Ley 2466 de 2025). Si trabajas bajo contrato en Colombia, este cambio te afecta directamente y tu salario no puede reducirse por ello.",
      },
      {
        type: "h2",
        text: "¿Qué dice exactamente la ley?",
      },
      {
        type: "p",
        text: "La Ley 2466 de 2025, sancionada el 25 de junio de 2025, consolidó y complementó la reducción gradual de la jornada iniciada con la Ley 2101 de 2021. El cronograma de la jornada máxima semanal es:",
      },
      {
        type: "ul",
        items: [
          "Hasta julio 2023: 48/47 horas según tramo previo de la reforma",
          "Julio 2023: 46 horas",
          "Julio 2024–14 julio 2026: 44 horas (tramo vigente hasta el 14 de julio de 2026)",
          "15 de julio de 2026 en adelante: 42 horas",
        ],
      },
      {
        type: "p",
        text: "El límite diario ordinario sigue siendo, en términos generales, de 8 horas. Lo que cambia el 15 de julio de 2026 es el techo semanal a 42 horas.",
      },
      {
        type: "h2",
        text: "Cifras 2026: salario y valor hora",
      },
      {
        type: "p",
        text: "Con el SMMLV en $1.750.905 (Decreto 1469 de 2025), al pasar a 42 horas semanales el valor de la hora ordinaria de referencia sube frente al esquema de 44 horas, porque el mismo salario se prorratea en menos horas. Con divisor aproximado de 182 horas/mes (42 h × 52 / 12), la hora ordinaria del mínimo ronda $9.620. Eso impacta el pago de extras y recargos.",
      },
      {
        type: "h2",
        text: "¿Mi salario baja porque trabajo menos horas?",
      },
      {
        type: "p",
        text: "No. Rotundamente no. La ley es clara: la reducción de horas no implica reducción de salario. Si hoy ganas $2.000.000 mensuales trabajando 44 horas a la semana, el 15 de julio seguirás ganando $2.000.000 trabajando 42 horas. El empleador no puede descontarte ningún valor por este cambio.",
      },
      {
        type: "p",
        text: "Si tu empleador intenta reducirte el salario argumentando la reducción de jornada, está violando la ley y puedes denunciarlo ante el Ministerio del Trabajo (mintrabajo.gov.co).",
      },
      {
        type: "h2",
        text: "¿Qué pasa con las horas extra?",
      },
      {
        type: "p",
        text: "Cualquier hora trabajada por encima de las 42 horas semanales (desde el 15 de julio de 2026) debe pagarse como hora extra. Los recargos habituales del CST son:",
      },
      {
        type: "ul",
        items: [
          "Hora extra diurna: recargo del 25 % sobre el valor de la hora ordinaria",
          "Hora extra nocturna: recargo del 75 % sobre el valor de la hora ordinaria",
          "Las horas extra no pueden superar, en la regla general, 2 horas diarias ni 12 horas semanales",
        ],
      },
      {
        type: "callout",
        text: "Ya no se necesita permiso del Ministerio del Trabajo para que una empresa solicite horas extra. Pero eso no significa que estés obligado a trabajarlas sin límite ni compensación.",
      },
      {
        type: "h2",
        text: "¿Cómo se distribuyen las 42 horas?",
      },
      {
        type: "p",
        text: "La reforma permite flexibilidad en la distribución. Tu empleador puede organizar la jornada de 5 o 6 días a la semana, variando entre 4 y 9 horas por día, siempre que:",
      },
      {
        type: "ul",
        items: [
          "No se supera el máximo de 8 horas diarias ordinarias (salvo acuerdos permitidos)",
          "Se garantice al menos un día de descanso semanal",
          "Ese día de descanso no tiene que ser necesariamente el domingo, pero debe quedar por escrito",
          "Tu salario total no se vea afectado",
        ],
      },
      {
        type: "h2",
        text: "¿La jornada nocturna también cambió?",
      },
      {
        type: "p",
        text: "Sí. Desde el 25 de diciembre de 2025, la jornada nocturna en Colombia empieza a las 7:00 p. m. (antes era a las 9:00 p. m.) y va hasta las 6:00 a. m. Si trabajas en esa franja, tienes derecho a un recargo nocturno del 35 % sobre tu hora ordinaria (Ley 2466).",
      },
      {
        type: "p",
        text: "Si tienes turnos que arrancan en la tarde o noche, revisa tu desprendible: tu empleador debía haber ajustado ese recargo desde diciembre de 2025. Ejemplo con SMMLV: hora ≈ $9.620 → hora nocturna ordinaria ≈ $12.987.",
      },
      {
        type: "h2",
        text: "¿Aplica para todos los trabajadores?",
      },
      {
        type: "p",
        text: "La Ley 2466 aplica a los trabajadores con contrato de trabajo en Colombia: término indefinido, término fijo, obra o labor, teletrabajo o trabajo remoto, con las excepciones del régimen propio.",
      },
      {
        type: "p",
        text: "No aplica de la misma forma para empleados públicos de carrera administrativa (tienen su propio régimen), ni para trabajadores independientes o por prestación de servicios.",
      },
      {
        type: "h2",
        text: "¿Qué puedo hacer si mi empleador no cumple?",
      },
      {
        type: "ul",
        items: [
          "Habla con Recursos Humanos y exige por escrito el ajuste",
          "Radica una queja ante el Ministerio del Trabajo (mintrabajo.gov.co)",
          "Consulta con un abogado laboral — muchos ofrecen primera consulta gratuita",
        ],
      },
      {
        type: "p",
        text: "Las sanciones por infracciones laborales pueden ser muy altas (hasta varios miles de SMMLV según la gravedad y el procedimiento sancionatorio). Con SMMLV $1.750.905, incluso multas de menor cuantía resultan millonarias.",
      },
      {
        type: "h2",
        text: "Conclusión",
      },
      {
        type: "p",
        text: "La jornada de 42 horas es un derecho que entra en vigor el 15 de julio de 2026. Conócelo, exígelo y no permitas que tu empleador lo ignore. La reducción de horas nunca puede traducirse en reducción de salario.",
      },
      {
        type: "callout",
        text: "Nominapp registra jornadas día a día y calcula recargos y horas extra según la Ley 2466 y el cronograma de la Ley 2101. Descarga la app para llevar el control de tu jornada de 42 horas.",
      },
    ],
  },
  {
    slug: "recargos-dominicales-nocturnos-colombia-2026",
    title: "Recargos dominicales y nocturnos en Colombia 2026: ¿te están pagando lo que te deben?",
    description:
      "Recargo dominical al 90 % desde julio 2026, jornada nocturna 7:00 p. m.–6:00 a. m. con 35 % y cómo verificar tu nómina según la Ley 2466.",
    keywords: [
      "recargo dominical Colombia 2026",
      "recargo nocturno Colombia reforma laboral",
      "cuánto pagan por trabajar domingo Colombia",
      "Ley 2466 recargos festivos",
      "trabajo nocturno Colombia 7pm recargo",
      "recargo dominical 90 por ciento",
    ],
    publishedAt: "2026-06-28",
    updatedAt: "2026-07-13",
    readingMinutes: 11,
    heroImage: "/images/guia/recargos-dominicales-nocturnos-colombia.png",
    sources: pickSources("ley2466", "cst", "decreto1469", "decreto1470", "mintrabajo"),
    relatedSlugs: [
      "recargo-nocturno-colombia-2026",
      "dominical-festivo-trabajo-colombia",
      "jornada-42-horas-colombia-2026",
    ],
    faq: [
      {
        question: "¿El recargo aplica sobre el salario básico o todo lo que gano?",
        answer:
          "Sobre el salario ordinario (básico mensual) convertido a valor hora/jornada, no sobre comisiones ni bonificaciones ocasionales, salvo que la norma o la jurisprudencia les den carácter salarial.",
      },
      {
        question: "¿Si el festivo cae en mi día de descanso habitual, me pagan doble?",
        answer:
          "Puedes tener derecho a la remuneración del día de descanso más el recargo por festivo laborado, según cómo se configure la jornada y lo que diga tu contrato/reglamento. Revisa el desprendible con el porcentaje vigente (90 % desde julio 2026).",
      },
      {
        question: "¿Los trabajadores domésticos tienen estos derechos?",
        answer:
          "Sí. Con la Ley 2466 gozan de las mismas garantías de recargos nocturnos y dominicales/festivos que el resto de trabajadores subordinados.",
      },
      {
        question: "¿Cuál es el cronograma exacto del recargo dominical?",
        answer:
          "Antes del 1 de julio de 2025: 75 %. Del 1 de julio de 2025 al 30 de junio de 2026: 80 %. Del 1 de julio de 2026 al 30 de junio de 2027: 90 %. Desde el 1 de julio de 2027: 100 %.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "Si trabajas los domingos, festivos o en turnos nocturnos en Colombia, hay dinero que quizás no te están pagando. La Ley 2466 de 2025 aumentó los recargos de forma escalonada y cambió el horario de inicio de la jornada nocturna a las 7:00 p. m. Aquí te explicamos cuánto te deben pagar en 2026 y cómo verificar tu nómina.",
      },
      {
        type: "h2",
        text: "El recargo dominical y festivo subió: ¿ya lo ves en tu pago?",
      },
      {
        type: "p",
        text: "Antes de la reforma, trabajar un domingo o festivo se pagaba con un recargo del 75 % sobre el salario ordinario. Con la Ley 2466, ese porcentaje sube gradualmente:",
      },
      {
        type: "ul",
        items: [
          "Antes del 1 de julio de 2025: 75 %",
          "1 de julio de 2025 – 30 de junio de 2026: 80 %",
          "1 de julio de 2026 – 30 de junio de 2027: 90 % (tramo actual desde julio 2026)",
          "Desde el 1 de julio de 2027: 100 %",
        ],
      },
      {
        type: "p",
        text: "Si tu salario ordinario por hora es de $10.000 y trabajas un domingo en julio de 2026, esa hora debe liquidarse como $19.000 (hora normal + 90 % de recargo). A partir de julio de 2027, será el doble: $20.000 por hora.",
      },
      {
        type: "h2",
        text: "Ejemplo oficial con SMMLV 2026 ($1.750.905)",
      },
      {
        type: "p",
        text: "Con jornada de 42 horas semanales (desde el 15 de julio de 2026) y divisor de referencia ≈ 182 horas/mes, la hora ordinaria del mínimo es ≈ $9.620. Domingo diurno al 90 %: ≈ $18.278 por hora. Al 80 % (junio 2026 o antes en ese tramo): ≈ $17.316 por hora. Esas cifras deben reflejarse en tu colilla si laboraste descanso.",
      },
      {
        type: "h2",
        text: "¿Qué pasa si trabajas domingo y en horario nocturno?",
      },
      {
        type: "p",
        text: "Los recargos se acumulan según los factores del CST. Domingo nocturno = recargo dominical/festivo vigente (90 % desde julio 2026) + componente nocturno del 35 % (7:00 p. m.–6:00 a. m.). En comercio, vigilancia, salud o restaurantes este cálculo impacta cada semana.",
      },
      {
        type: "h2",
        text: "La jornada nocturna empieza a las 7:00 p. m.",
      },
      {
        type: "p",
        text: "Desde el 25 de diciembre de 2025, la jornada nocturna inicia a las 7:00 p. m. (antes 9:00 p. m.) y termina a las 6:00 a. m. El recargo nocturno ordinario es del 35 % (factor 1,35).",
      },
      {
        type: "callout",
        text: "Antes, si entrabas a las 7:00 p. m., las primeras dos horas no generaban recargo nocturno. Hoy sí. Si tu empleador no ajustó tu liquidación desde diciembre de 2025, podrías tener diferencias reclamables.",
      },
      {
        type: "h2",
        text: "Trabajo habitual vs. ocasional en domingo",
      },
      {
        type: "ul",
        items: [
          "Ocasional: 1 o 2 domingos o festivos al mes. Aplica el recargo; el compensatorio depende del caso.",
          "Habitual: 3 o más domingos o festivos en un mismo mes. Además del recargo, suele corresponder día de descanso compensatorio.",
        ],
      },
      {
        type: "h2",
        text: "Sectores más afectados",
      },
      {
        type: "ul",
        items: [
          "Comercio y retail (supermercados, centros comerciales)",
          "Vigilancia y seguridad privada",
          "Salud (enfermeros, auxiliares, médicos de turno)",
          "Hotelería, turismo, transporte y logística",
          "Restaurantes y gastronomía",
        ],
      },
      {
        type: "h2",
        text: "Cómo revisar tu desprendible de nómina",
      },
      {
        type: "ul",
        items: [
          "Solicita tu desprendible detallado (es obligación legal entregarlo)",
          "Identifica horas en domingo, festivo o después de las 7:00 p. m.",
          "Verifica líneas de recargo dominical, festivo o nocturno con el porcentaje correcto (80 % o 90 % según la fecha)",
          "Compara: valor hora ordinaria × horas × (1 + porcentaje de recargo)",
        ],
      },
      {
        type: "h2",
        text: "¿Puedo reclamar recargos no pagados?",
      },
      {
        type: "p",
        text: "Sí. Las acreencias laborales suelen prescribir a los 3 años desde que se hicieron exigibles. Para diferencias en recargo nocturno desde diciembre de 2025 (inicio a las 7:00 p. m.) o dominical mal liquidado al 80 %/90 %, tienes ventana para reclamar.",
      },
      {
        type: "callout",
        text: "Nominapp identifica tramos nocturnos y marca dominical o festivo en el calendario. Registra cada jornada para estimar tus recargos acumulados del mes según la Ley 2466.",
      },
    ],
  },
  {
    slug: "contratos-derechos-empleados-colombia-2026",
    title: "Contratos de trabajo en Colombia 2026: los nuevos derechos que debes conocer",
    description:
      "Tope de 4 años en contratos fijos, debido proceso disciplinario, aprendices SENA, formalización doméstica y licencias remuneradas según la Ley 2466.",
    keywords: [
      "contratos laborales Colombia 2026",
      "contrato a término fijo límite 4 años",
      "Ley 2466 contratos Colombia",
      "contrato indefinido Colombia reforma",
      "derechos laborales Colombia empleados 2026",
      "contrato por obra o labor Colombia",
    ],
    publishedAt: "2026-06-28",
    updatedAt: "2026-07-13",
    readingMinutes: 12,
    heroImage: "/images/guia/contratos-derechos-empleados-colombia.png",
    sources: pickSources("ley2466", "cst", "decreto1469", "mintrabajo", "ley100"),
    relatedSlugs: [
      "jornada-42-horas-colombia-2026",
      "de-la-espriella-trabajo-empleados-colombia-2026",
      "recargos-dominicales-nocturnos-colombia-2026",
    ],
    faq: [
      {
        question: "¿Cuántos años puede durar un contrato a término fijo bajo la Ley 2466?",
        answer:
          "El tope acumulado es de 4 años contados desde el 26 de junio de 2025. Superado ese lapso, el contrato se convierte en indefinido.",
      },
      {
        question: "¿Qué pasa si la empresa me pide renunciar para firmar un contrato nuevo?",
        answer:
          "Puede ser una práctica para resetear antigüedad. No firmes sin asesoría: podrías perder derechos acumulados. La conversión a indefinido opera por ministerio de la ley cuando se cumplen los supuestos.",
      },
      {
        question: "¿Los aprendices SENA ganan salario mínimo?",
        answer:
          "En etapa práctica deben recibir al menos el 100 % del SMMLV ($1.750.905 en 2026) más afiliación y prestaciones según la reforma. En etapa lectiva el apoyo es del 75 % del SMMLV más salud y ARL a cargo del empleador.",
      },
      {
        question: "¿Cuántos días tengo para defenderme en un proceso disciplinario?",
        answer:
          "La Ley 2466 exige, como mínimo, 5 días para presentar descargos y pruebas antes de una sanción, además de notificación de hechos, entrega de pruebas y decisión motivada.",
      },
    ],
    sections: [
      {
        type: "p",
        text: "Con la Ley 2466 de 2025, las reglas del juego cambiaron para millones de trabajadores colombianos. Prácticas como renovar contratos a término fijo año tras año durante décadas tienen un límite claro. Si tienes contrato en Colombia, esto te afecta directamente.",
      },
      {
        type: "h2",
        text: "El truco del contrato fijo eterno ya no funciona",
      },
      {
        type: "p",
        text: "Durante años, muchas empresas renovaban contratos a término fijo indefinidamente para evitar las garantías del contrato indefinido. Eso se acabó.",
      },
      {
        type: "p",
        text: "La Ley 2466 establece que los contratos a término fijo tienen un tope máximo de 4 años acumulados, contados desde el 26 de junio de 2025. Una vez superado ese tiempo, el contrato se convierte automáticamente en indefinido.",
      },
      {
        type: "ul",
        items: [
          "Si llevas más de 4 años con contrato fijo consecutivo (bajo las reglas de la reforma), tienes derecho a contrato indefinido",
          "A partir de la cuarta prórroga de un contrato inferior a 1 año, la siguiente renovación debe ser por mínimo 1 año",
          "Si la empresa no cumple, el contrato se entiende indefinido",
        ],
      },
      {
        type: "callout",
        text: "Alerta: algunas empresas piden «renunciar» y firmar contrato nuevo para resetear el contador. No lo hagas sin asesoría legal: perderías antigüedad y derechos acumulados.",
      },
      {
        type: "h2",
        text: "Jornada, salario mínimo y recargos que debes exigir junto al contrato",
      },
      {
        type: "p",
        text: "Sea cual sea tu tipo de contrato, en 2026 rigen: SMMLV $1.750.905 (Decreto 1469/2025), auxilio $249.095 si ganas hasta 2 SMMLV (Decreto 1470/2025), jornada máxima 42 horas desde el 15 de julio de 2026, nocturna 7:00 p. m.–6:00 a. m. con 35 %, y recargo dominical/festivo del 90 % desde el 1 de julio de 2026.",
      },
      {
        type: "h2",
        text: "El contrato indefinido: tu escudo de estabilidad",
      },
      {
        type: "ul",
        items: [
          "Estabilidad: solo puedes ser despedido con justa causa o con indemnización",
          "Indemnización mayor si te despiden sin justa causa",
          "Antigüedad protegida para cesantías, vacaciones y otros beneficios",
          "Preaviso de salida de 30 días; si no lo das, ya no te sancionan como antes en varios supuestos",
        ],
      },
      {
        type: "h2",
        text: "Contratos por obra o labor: cambios importantes",
      },
      {
        type: "ul",
        items: [
          "Deben celebrarse por escrito y especificar la obra o labor contratada",
          "Deben garantizar prestaciones sociales: primas, cesantías, intereses, dotación y vacaciones",
          "Si al terminar la obra sigues prestando servicios, el contrato pasa a ser indefinido",
        ],
      },
      {
        type: "h2",
        text: "Nuevo proceso disciplinario",
      },
      {
        type: "p",
        text: "La Ley 2466 fortaleció el debido proceso disciplinario laboral. Antes de cualquier sanción, el empleador debe:",
      },
      {
        type: "ul",
        items: [
          "Comunicarte formalmente los hechos que te imputan",
          "Entregarte las pruebas en tu contra",
          "Darte mínimo 5 días para defenderte y presentar tus pruebas",
          "Emitir una decisión motivada y proporcional",
          "Permitirte impugnar (apelar) esa decisión",
        ],
      },
      {
        type: "h2",
        text: "Aprendices SENA: ahora son trabajadores formales",
      },
      {
        type: "ul",
        items: [
          "Etapa lectiva: apoyo del 75 % del SMMLV ($1.313.179 en 2026) + salud y ARL (empleador)",
          "Etapa práctica: 100 % del SMMLV ($1.750.905) + afiliación completa y prestaciones",
          "Multa por aprendiz no contratado correctamente: 1,5 SMMLV por mes (≈ $2.626.358)",
        ],
      },
      {
        type: "h2",
        text: "Trabajadores domésticos: formalización obligatoria",
      },
      {
        type: "ul",
        items: [
          "Contrato por escrito registrado en la PILA",
          "Salario mínimo completo (no pueden pagarte menos por «vivir en la casa»)",
          "Prestaciones sociales completas y afiliación a salud, pensión y ARL (Ley 100 y afiliaciones)",
          "Recargos nocturnos (35 %) y dominicales/festivos (90 % desde julio 2026) como cualquier otro trabajador",
        ],
      },
      {
        type: "h2",
        text: "Plataformas digitales",
      },
      {
        type: "p",
        text: "Si trabajas en apps de domicilios, la Ley 2466 exige definir claramente si eres dependiente o independiente. Si hay subordinación y horarios definidos por la app, eres trabajador dependiente con derechos laborales.",
      },
      {
        type: "h2",
        text: "Nuevas licencias remuneradas",
      },
      {
        type: "ul",
        items: [
          "Citas médicas urgentes o programadas con especialistas",
          "Obligaciones escolares como acudiente de un menor",
          "Citaciones judiciales o administrativas",
          "Un día remunerado adicional por calamidad doméstica (ampliado)",
          "Licencia para mujeres con endometriosis diagnosticada",
        ],
      },
      {
        type: "h2",
        text: "Acoso laboral: un solo acto basta",
      },
      {
        type: "p",
        text: "Antes debía ser repetido y demostrable. Con la Ley 2466, un grito delante de compañeros, una amenaza o humillación pública ya puede configurar acoso laboral. La protección se extiende a pasantes, aprendices, ex empleados y candidatos en selección.",
      },
      {
        type: "h2",
        text: "Resumen: lo que debes exigir",
      },
      {
        type: "ul",
        items: [
          "Más de 4 años con contrato fijo → exige contrato indefinido",
          "Despido sin proceso previo → posible despido irregular",
          "Aprendiz SENA en práctica → SMMLV $1.750.905 + prestaciones",
          "Trabajo doméstico sin contrato → exige formalización y PILA",
          "Negativa de licencia médica → derecho legal, puedes denunciar",
          "Incidente de acoso → denunciable con un solo hecho",
        ],
      },
      {
        type: "callout",
        text: "Conoce tu tipo de contrato y lleva registro de comunicaciones laborales. Nominapp te ayuda a documentar jornadas y estimar liquidaciones mientras exiges tus derechos bajo la Ley 2466.",
      },
    ],
  },
  {
    slug: "de-la-espriella-trabajo-empleados-colombia-2026",
    title: "Abelardo de la Espriella y el trabajo en Colombia: ¿qué puede cambiar para los empleados?",
    description:
      "El 21 de junio de 2026 Colombia eligió a Abelardo de la Espriella como presidente (2026-2030). Qué implica para la Ley 2466 (norma vigente), la jornada de 42 horas y tus derechos laborales.",
    keywords: [
      "De la Espriella reforma laboral",
      "nuevo gobierno Colombia trabajo 2026",
      "qué pasa con la Ley 2466 nuevo presidente",
      "trabajo por horas Colombia De la Espriella",
      "derechos laborales Colombia agosto 2026",
      "presidente electo Colombia empleo",
    ],
    publishedAt: "2026-06-28",
    updatedAt: "2026-07-13",
    readingMinutes: 11,
    heroImage: "/images/guia/casa-narino-presidencia-colombia.png",
    sources: pickSources("ley2466", "ley2101", "cst", "mintrabajo", "decreto1469"),
    relatedSlugs: [
      "jornada-42-horas-colombia-2026",
      "contratos-derechos-empleados-colombia-2026",
      "recargos-dominicales-nocturnos-colombia-2026",
    ],
    faq: [
      {
        question: "¿Cuándo asume el presidente electo?",
        answer:
          "El 7 de agosto de 2026, en posesión ante el Congreso.",
      },
      {
        question: "¿La jornada de 42 horas puede revertirse antes de agosto?",
        answer:
          "No por el solo cambio de gobierno. Entra el 15 de julio de 2026 y la Ley 2466 / Ley 2101 siguen vigentes hasta que el Congreso (o un fallo) las modifique. El gobierno saliente sigue en el cargo hasta el 7 de agosto.",
      },
      {
        question: "¿Puede decretar cambios laborales sin el Congreso?",
        answer:
          "Solo en hipótesis excepcionales (p. ej. estados de excepción con límites constitucionales), no por decreto ordinario que derogue una ley estatutaria/ordinaria del Congreso de forma libre.",
      },
      {
        question: "¿Qué pasa si el Congreso modifica la ley en 2027?",
        answer:
          "Los derechos ya causados y las acreencias generadas bajo la norma vigente no suelen poder quitarse retroactivamente. Lo que cambie a futuro dependerá del texto que apruebe el Congreso y del control de la Corte Constitucional.",
      },
      {
        question: "¿Nominapp es una fuente oficial del Gobierno?",
        answer:
          "No. Nominapp publica análisis explicativo para trabajadores. La norma vinculante hoy es la Ley 2466 de 2025 (y el CST, decretos de salario, etc.). Consulta siempre el texto oficial en Función Pública / Diario Oficial.",
      },
    ],
    sections: [
      {
        type: "callout",
        text: "Aviso importante: este artículo de Nominapp es análisis periodístico y explicación educativa. No es una fuente oficial del Gobierno de Colombia ni sustituye el Diario Oficial, Función Pública o el Ministerio del Trabajo. La norma laboral vinculante hoy es la Ley 2466 de 2025 (reforma laboral), disponible en https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676, junto con el CST y los decretos de salario mínimo.",
      },
      {
        type: "p",
        text: "El 21 de junio de 2026, Colombia eligió a Abelardo de la Espriella como nuevo presidente para el período 2026-2030. Asumirá el cargo el 7 de agosto. Para millones de trabajadores colombianos, la pregunta inmediata es la misma: ¿qué pasa con mis derechos laborales? ¿La reforma laboral se desmonta? ¿Cambia lo que me pagan?",
      },
      {
        type: "h2",
        text: "Primero lo primero: la Ley 2466 sigue vigente",
      },
      {
        type: "p",
        text: "La Ley 2466 de 2025 es ley vigente y seguirá siéndolo hasta que el Congreso apruebe otra cosa (o un juez la module). De la Espriella asume el 7 de agosto. Incluso si presenta un proyecto para modificar la reforma, ese proceso legislativo toma meses y requiere mayorías. Nada cambia de un día para otro por el solo resultado electoral.",
      },
      {
        type: "ul",
        items: [
          "Jornada de 42 horas semanales desde el 15 de julio de 2026 (Ley 2101 / Ley 2466)",
          "Recargo dominical/festivo del 90 % desde el 1 de julio de 2026 (100 % desde julio 2027)",
          "Jornada nocturna desde las 7:00 p. m. hasta las 6:00 a. m., recargo 35 %",
          "Contratos a término fijo con tope de 4 años acumulados",
          "Nuevas licencias remuneradas y reglas de debido proceso disciplinario",
          "SMMLV 2026: $1.750.905; auxilio de transporte: $249.095 (Decretos 1469 y 1470 de 2025)",
        ],
      },
      {
        type: "callout",
        text: "Si tu empleador usa la excusa del «nuevo gobierno» para no cumplir la ley actual, está cometiendo una infracción laboral. La ley no cambia por anticipación política.",
      },
      {
        type: "image",
        src: "/images/guia/eleccion-presidencia-trabajo-colombia.png",
        alt: "Ilustración editorial sobre elección presidencial y derechos laborales en Colombia",
        caption: "Transición presidencial 2026: la Ley 2466 sigue vigente hasta que el Congreso decida lo contrario.",
      },
      {
        type: "h2",
        text: "¿Qué propone De la Espriella en materia laboral?",
      },
      {
        type: "p",
        text: "Durante su campaña, De la Espriella planteó una visión económica basada en libre mercado, reducción del Estado y flexibilización laboral. Sus propuestas más comentadas incluyen el trabajo por horas, la revisión de parafiscales e incentivos a la formalización. Esto es análisis de propuestas políticas, no texto legal vigente.",
      },
      {
        type: "h2",
        text: "1. Trabajo por horas: la propuesta más polémica",
      },
      {
        type: "p",
        text: "La propuesta central es legalizar de forma abierta el trabajo por horas como nueva modalidad de vinculación. Eso implicaría contratar por horas trabajadas, con un régimen distinto al contrato tradicional del CST. Hoy, mientras no exista una ley nueva, rigen las normas actuales de la Ley 2466.",
      },
      {
        type: "p",
        text: "De la Espriella sostiene que formalizaría a millones de trabajadores informales. Sindicatos y expertos críticos advierten que puede precarizar el empleo, reducir prestaciones y debilitar la estabilidad laboral, especialmente para jóvenes.",
      },
      {
        type: "h2",
        text: "2. Flexibilización de parafiscales",
      },
      {
        type: "p",
        text: "Su fórmula de gobierno ha mencionado revisar el pago de parafiscales (SENA, ICBF y cajas de compensación) para reducir la carga sobre empresarios e incentivar empleo formal. El efecto puede ser positivo en creación de empleo, pero también menos recursos para programas sociales. Cualquier cambio requiere ley.",
      },
      {
        type: "h2",
        text: "3. Incentivos a la contratación formal",
      },
      {
        type: "p",
        text: "En el plan de gobierno se habló de incentivos para contratar formalmente a jóvenes, mujeres y personas mayores de 50 años. La Ley 2466 ya prevé mecanismos de apoyo al empleo nuevo para estos grupos; mientras no se derogue, esa es la regla.",
      },
      {
        type: "image",
        src: "/images/guia/reforma-laboral-debate-colombia.png",
        alt: "Ilustración editorial sobre debate de reforma laboral y flexibilización en Colombia",
        caption: "Propuestas como el trabajo por horas y la revisión de parafiscales requerirán debate en el Congreso.",
      },
      {
        type: "h2",
        text: "¿Puede De la Espriella derogar la Ley 2466?",
      },
      {
        type: "p",
        text: "Técnicamente el Congreso puede modificarla o derogarla, pero no es automático:",
      },
      {
        type: "ul",
        items: [
          "El Congreso tiene composición diversa; no hay mayoría automática",
          "Algunos cambios ya están implementados (nocturna 7:00 p. m., recargo 90 %, jornada 42 h)",
          "La presión sindical (CUT, CGT, CTC) defenderá los avances logrados",
          "La Corte Constitucional puede revisar modificaciones que afecten derechos adquiridos",
        ],
      },
      {
        type: "p",
        text: "Lo más probable, según analistas, son modificaciones puntuales —especialmente en contratación y parafiscales— más que una derogación total de un día para otro.",
      },
      {
        type: "h2",
        text: "Derechos concretos que hoy (julio 2026) debes verificar en tu nómina",
      },
      {
        type: "p",
        text: "Independiente del debate político, tu colilla de julio 2026 debería reflejar: jornada semanal máx. 42 h desde el 15 de julio; dominicales/festivos al 90 % desde el 1 de julio; nocturnas desde las 7:00 p. m. con 35 %; SMMLV $1.750.905 y, si aplica, auxilio $249.095. Eso sale de la Ley 2466 y los decretos de salario, no de un discurso de campaña.",
      },
      {
        type: "h2",
        text: "Cambios laborales más discusiones de probabilidad (análisis)",
      },
      {
        type: "ul",
        items: [
          "Legalizar trabajo por horas — probabilidad media; podría flexibilizar pero también precarizar",
          "Revisar tope de contratos fijos a 4 años — probabilidad media-baja",
          "Reducir aportes parafiscales — probabilidad media",
          "Derogar jornada 42 horas — probabilidad baja; alta resistencia sindical",
          "Derogar recargo nocturno desde 7:00 p. m. — probabilidad media",
          "Eliminar licencias remuneradas — probabilidad baja",
        ],
      },
      {
        type: "h2",
        text: "¿Qué debes hacer tú ahora mismo?",
      },
      {
        type: "ul",
        items: [
          "Verifica tu nómina de julio: desde el 15 de julio la jornada máxima es 42 horas",
          "Revisa recargos desde el 1 de julio: el dominical y festivo subió al 90 %",
          "Si llevas más de 4 años con contrato fijo bajo la reforma, exige contrato indefinido",
          "Documenta contratos, desprendibles y comunicaciones laborales",
          "Acércate a tu sindicato si existe en tu empresa",
          "Para norma oficial, lee la Ley 2466 en Función Pública — no te quedes solo con redes o apps",
        ],
      },
      {
        type: "h2",
        text: "El contexto político: una victoria muy ajustada",
      },
      {
        type: "p",
        text: "De la Espriella ganó con el 49,66 % contra 48,70 % de Iván Cepeda. Esa diferencia de menos de 1 punto porcentual le da legitimidad democrática, pero también impone una realidad: Colombia está dividida. Cualquier reforma que busque desmontar derechos adquiridos encontrará resistencia en la calle y en el Congreso.",
      },
      {
        type: "h2",
        text: "Conclusión",
      },
      {
        type: "p",
        text: "La llegada de Abelardo de la Espriella introduce incertidumbre sobre el futuro del marco laboral colombiano. Sus propuestas apuntan a flexibilizar el mercado laboral, lo que puede significar oportunidades pero también riesgos para la estabilidad y los derechos de los trabajadores.",
      },
      {
        type: "p",
        text: "Lo que es seguro: hoy, ahora mismo, la Ley 2466 de 2025 está vigente y te protege. Conoce tus derechos en el texto oficial, exígelos y estate atento a los debates del segundo semestre de 2026. Este artículo de Nominapp es guía explicativa, no acto administrativo ni interpretación oficial del Estado.",
      },
      {
        type: "callout",
        text: "Nominapp te ayuda a registrar jornadas, recargos y liquidaciones según la normativa vigente (Ley 2466, CST, decretos de SMMLV). No somos el Gobierno: descarga la app y lleva el control mientras se define el rumbo laboral del nuevo gobierno.",
      },
    ],
  },
];
