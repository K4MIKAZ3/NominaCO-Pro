import type { BlogArticle } from "./articles";

export const reformaArticles: BlogArticle[] = [
  {
    slug: "jornada-42-horas-colombia-2026",
    title: "Jornada de 42 horas en Colombia 2026: todo lo que debes saber como empleado",
    description:
      "A partir del 15 de julio de 2026 la jornada máxima baja a 42 horas semanales. Qué dice la Ley 2466, si tu salario puede bajar y cómo exigir el cumplimiento.",
    keywords: [
      "jornada laboral 42 horas Colombia",
      "reforma laboral 2026 empleados",
      "horas de trabajo Colombia julio 2026",
      "Ley 2466 jornada laboral",
      "cuántas horas se trabaja en Colombia 2026",
    ],
    publishedAt: "2026-06-28",
    readingMinutes: 8,
    heroImage: "/images/guia/jornada-42-horas-colombia.png",
    sections: [
      {
        type: "p",
        text: "A partir del 15 de julio de 2026, Colombia reduce oficialmente su jornada máxima laboral a 42 horas semanales. Esto no es un rumor ni una propuesta: ya es ley. Si trabajas bajo contrato en Colombia, este cambio te afecta directamente y tu salario no puede reducirse por ello.",
      },
      {
        type: "h2",
        text: "¿Qué dice exactamente la ley?",
      },
      {
        type: "p",
        text: "La Ley 2466 de 2025, sancionada por el presidente Gustavo Petro el 25 de junio de 2025, establece la reducción gradual de la jornada laboral en Colombia. Es la continuación de la Ley 2101 de 2021, que fijó el siguiente cronograma:",
      },
      {
        type: "ul",
        items: [
          "Hasta julio 2023: 47 horas semanales máximas",
          "Julio 2023: 46 horas",
          "Julio 2024: 44 horas",
          "Julio 2025: 44 horas",
          "15 de julio de 2026: 42 horas",
        ],
      },
      {
        type: "p",
        text: "El límite diario sigue siendo 8 horas. Lo que cambia es el techo semanal.",
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
        text: "Si tu empleador intenta reducirte el salario argumentando la reducción de jornada, está violando la ley y puedes denunciarlo ante el Ministerio del Trabajo.",
      },
      {
        type: "h2",
        text: "¿Qué pasa con las horas extra?",
      },
      {
        type: "p",
        text: "Cualquier hora trabajada por encima de las 42 horas semanales debe pagarse como hora extra. Los recargos son:",
      },
      {
        type: "ul",
        items: [
          "Hora extra diurna: recargo del 25 % sobre el valor de la hora ordinaria",
          "Hora extra nocturna: recargo del 75 % sobre el valor de la hora ordinaria",
          "Las horas extra no pueden superar 2 horas diarias ni 12 horas semanales",
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
          "No se supere el máximo de 8 horas diarias ordinarias",
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
        text: "Sí. Desde el 25 de diciembre de 2025, la jornada nocturna en Colombia empieza a las 7:00 p. m. (antes era a las 9:00 p. m.). Esto significa que si trabajas entre las 7 p. m. y las 6 a. m., tienes derecho a un recargo nocturno del 35 % sobre tu hora ordinaria.",
      },
      {
        type: "p",
        text: "Si tienes turnos que arrancan en la tarde o noche, revisa tu desprendible de nómina: tu empleador debía haber ajustado ese recargo desde diciembre pasado.",
      },
      {
        type: "h2",
        text: "¿Aplica para todos los trabajadores?",
      },
      {
        type: "p",
        text: "La Ley 2466 aplica a todos los trabajadores con contrato de trabajo en Colombia: contrato a término indefinido, a término fijo, por obra o labor, teletrabajo o trabajo remoto.",
      },
      {
        type: "p",
        text: "No aplica para empleados públicos de carrera administrativa (tienen su propio régimen), ni para trabajadores independientes o por prestación de servicios.",
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
        text: "Las multas para empleadores que incumplan la reforma pueden llegar hasta 5.000 salarios mínimos mensuales (cerca de $8.754 millones de pesos en 2026).",
      },
      {
        type: "h2",
        text: "Preguntas frecuentes",
      },
      {
        type: "ul",
        items: [
          "¿Si trabajo en turno rotativo me aplica igual? Sí. El promedio semanal no puede superar las 42 horas.",
          "¿Puedo acordar trabajar más de 42 horas si quiero ganar más? Solo si tu empleador lo solicita formalmente, te paga los recargos de horas extra y no se superan las 12 horas extra semanales.",
          "¿El salario mínimo cambió también? Sí. Desde enero de 2026, el salario mínimo es $1.750.905 más $249.095 de auxilio de transporte, total $2.000.000 mensuales.",
        ],
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
        text: "Nominapp registra jornadas día a día y calcula recargos y horas extra según la Ley 2466. Descarga la app para llevar el control de tu jornada de 42 horas.",
      },
    ],
  },
  {
    slug: "recargos-dominicales-nocturnos-colombia-2026",
    title: "Recargos dominicales y nocturnos en Colombia 2026: ¿te están pagando lo que te deben?",
    description:
      "Recargo dominical al 90 % desde julio 2026, jornada nocturna desde las 7 p. m. y cómo verificar que tu nómina refleje los nuevos porcentajes de la Ley 2466.",
    keywords: [
      "recargo dominical Colombia 2026",
      "recargo nocturno Colombia reforma laboral",
      "cuánto pagan por trabajar domingo Colombia",
      "Ley 2466 recargos festivos",
      "trabajo nocturno Colombia 7pm recargo",
    ],
    publishedAt: "2026-06-28",
    readingMinutes: 9,
    heroImage: "/images/guia/recargos-dominicales-nocturnos-colombia.png",
    sections: [
      {
        type: "p",
        text: "Si trabajas los domingos, festivos o en turnos nocturnos en Colombia, hay dinero que quizás no te están pagando. La Ley 2466 de 2025 aumentó los recargos de forma escalonada y cambió el horario de inicio de la jornada nocturna. Aquí te explicamos exactamente cuánto te deben pagar y cómo verificar que tu nómina esté correcta.",
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
          "Antes de julio 2025: 75 %",
          "Julio 2025 – junio 2026: 80 %",
          "Julio 2026 – junio 2027: 90 % (aplica ahora)",
          "Julio 2027 en adelante: 100 %",
        ],
      },
      {
        type: "p",
        text: "Si tu salario ordinario por hora es de $10.000 y trabajas un domingo, ese día debes recibir $19.000 por hora (hora normal + 90 % de recargo). A partir de julio de 2027, será el doble: $20.000 por hora.",
      },
      {
        type: "h2",
        text: "¿Qué pasa si trabajas domingo y en horario nocturno?",
      },
      {
        type: "p",
        text: "Los recargos se acumulan. Ejemplo con salario mínimo 2026 ($1.750.905): valor hora ordinaria base 42 h semanales, divisor 182 ≈ $9.620. Domingo diurno (recargo 90 %): $9.620 + $8.658 = $18.278 por hora. Domingo nocturno (recargo 90 % + 35 %): aún más alto.",
      },
      {
        type: "p",
        text: "Si trabajas en comercio, vigilancia, salud o restaurantes, este cálculo impacta directamente tu bolsillo cada semana. Pide a tu empresa que te explique cómo liquidan esas horas.",
      },
      {
        type: "h2",
        text: "La jornada nocturna empieza a las 7 p. m.",
      },
      {
        type: "p",
        text: "Desde el 25 de diciembre de 2025, la jornada nocturna ya no empieza a las 9 p. m.: ahora inicia a las 7 p. m. El recargo nocturno es del 35 % sobre la hora ordinaria y aplica entre las 7:00 p. m. y las 6:00 a. m.",
      },
      {
        type: "callout",
        text: "Antes, si entrabas a trabajar a las 7 p. m., las primeras dos horas no generaban recargo nocturno. Hoy sí. Si tu empleador no ajustó tu liquidación desde diciembre de 2025, te está debiendo dinero de forma retroactiva.",
      },
      {
        type: "h2",
        text: "Trabajo habitual vs. ocasional en domingo",
      },
      {
        type: "ul",
        items: [
          "Ocasional: 1 o 2 domingos o festivos al mes. Aplica el recargo, pero no necesariamente compensatorio.",
          "Habitual: 3 o más domingos o festivos en un mismo mes. Además del recargo, tienes derecho a un día de descanso compensatorio.",
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
          "Identifica horas en domingo, festivo o después de las 7 p. m.",
          "Verifica líneas de recargo dominical, festivo o nocturno con el porcentaje correcto",
          "Compara: valor hora ordinaria × horas × porcentaje de recargo",
        ],
      },
      {
        type: "h2",
        text: "¿Puedo reclamar recargos no pagados?",
      },
      {
        type: "p",
        text: "Sí. Las acreencias laborales prescriben a los 3 años desde que se hicieron exigibles. Para diferencias en recargo nocturno desde diciembre de 2025 (inicio a las 7 p. m.), tienes tiempo para reclamar retroactivamente.",
      },
      {
        type: "h2",
        text: "Preguntas frecuentes",
      },
      {
        type: "ul",
        items: [
          "¿El recargo aplica sobre el salario básico o todo lo que gano? Sobre el salario ordinario (básico mensual), no comisiones ni bonificaciones.",
          "¿Si el festivo cae en mi día de descanso habitual, me pagan doble? Sí: día de descanso + recargo festivo.",
          "¿Los trabajadores domésticos tienen estos derechos? Sí, desde la Ley 2466 gozan de las mismas garantías.",
        ],
      },
      {
        type: "callout",
        text: "Nominapp identifica tramos nocturnos y marca dominical o festivo en el calendario. Registra cada jornada para estimar tus recargos acumulados del mes.",
      },
    ],
  },
  {
    slug: "contratos-derechos-empleados-colombia-2026",
    title: "Contratos de trabajo en Colombia 2026: los nuevos derechos que debes conocer",
    description:
      "Tope de 4 años en contratos fijos, debido proceso disciplinario, aprendices SENA, formalización doméstica y nuevas licencias remuneradas según la Ley 2466.",
    keywords: [
      "contratos laborales Colombia 2026",
      "contrato a término fijo límite 4 años",
      "Ley 2466 contratos Colombia",
      "contrato indefinido Colombia reforma",
      "derechos laborales Colombia empleados 2026",
      "contrato por obra o labor Colombia",
    ],
    publishedAt: "2026-06-28",
    readingMinutes: 10,
    heroImage: "/images/guia/contratos-derechos-empleados-colombia.png",
    sections: [
      {
        type: "p",
        text: "Con la Ley 2466 de 2025, las reglas del juego cambiaron para millones de trabajadores colombianos. Hay prácticas que antes eran comunes —como renovar contratos a término fijo año tras año durante décadas— que hoy son ilegales. Si tienes contrato en Colombia, esto te afecta directamente.",
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
          "Si llevas más de 4 años con contrato fijo consecutivo, ya tienes derecho a contrato indefinido",
          "A partir de la cuarta prórroga de un contrato inferior a 1 año, la siguiente renovación debe ser por mínimo 1 año",
          "Si la empresa no cumple, el contrato se entiende indefinido desde el inicio de la relación laboral",
        ],
      },
      {
        type: "callout",
        text: "Alerta: algunas empresas piden «renunciar» y firmar contrato nuevo para resetear el contador. No lo hagas sin asesoría legal: perderías antigüedad y derechos acumulados.",
      },
      {
        type: "h2",
        text: "El contrato indefinido: tu escudo de estabilidad",
      },
      {
        type: "ul",
        items: [
          "Estabilidad: solo puedes ser despedido con justa causa o indemnización",
          "Indemnización mayor si te despiden sin justa causa",
          "Antigüedad protegida para cesantías, vacaciones y otros beneficios",
          "Preaviso de salida de 30 días; si no lo das, ya no te sancionan",
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
          "Deben garantizar todas las prestaciones sociales: primas, cesantías, intereses, dotación y vacaciones",
          "Si al terminar la obra sigues prestando servicios, el contrato pasa automáticamente a ser indefinido",
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
          "Etapa lectiva: apoyo del 75 % del salario mínimo + salud y ARL (empleador)",
          "Etapa práctica: 100 % del salario mínimo + afiliación completa y prestaciones",
          "Multa por aprendiz no contratado correctamente: 1,5 salarios mínimos por mes",
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
          "Prestaciones sociales completas y afiliación a salud, pensión y ARL",
          "Recargos nocturnos y dominicales como cualquier otro trabajador",
        ],
      },
      {
        type: "h2",
        text: "Plataformas digitales",
      },
      {
        type: "p",
        text: "Si trabajas en apps de domicilios (Rappi, iFood, inDrive, etc.), la Ley 2466 exige definir claramente si eres dependiente o independiente. Si hay subordinación y horarios definidos por la app, eres trabajador dependiente con todos los derechos laborales.",
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
        text: "Antes debía ser repetido y demostrable. Con la Ley 2466, un grito delante de compañeros, una amenaza o humillación pública ya configura acoso laboral. La protección se extiende a pasantes, aprendices, ex empleados y candidatos en selección.",
      },
      {
        type: "h2",
        text: "Resumen: lo que debes exigir",
      },
      {
        type: "ul",
        items: [
          "Más de 4 años con contrato fijo → exige contrato indefinido",
          "Despido sin proceso previo → posible despido ilegal",
          "Aprendiz SENA en práctica → salario mínimo completo + prestaciones",
          "Trabajo doméstico sin contrato → exige formalización y PILA",
          "Negativa de licencia médica → derecho legal, puedes denunciar",
          "Incidente de acoso → denunciable con un solo hecho",
        ],
      },
      {
        type: "callout",
        text: "Conoce tu tipo de contrato y lleva registro de comunicaciones laborales. Nominapp te ayuda a documentar jornadas y estimar liquidaciones mientras exiges tus derechos.",
      },
    ],
  },
  {
    slug: "de-la-espriella-trabajo-empleados-colombia-2026",
    title: "Abelardo de la Espriella y el trabajo en Colombia: ¿qué puede cambiar para los empleados?",
    description:
      "El 21 de junio de 2026 Colombia eligió a Abelardo de la Espriella como presidente (2026-2030). Qué implica para la Ley 2466, la jornada de 42 horas y tus derechos laborales.",
    keywords: [
      "De la Espriella reforma laboral",
      "nuevo gobierno Colombia trabajo 2026",
      "qué pasa con la Ley 2466 nuevo presidente",
      "trabajo por horas Colombia De la Espriella",
      "derechos laborales Colombia agosto 2026",
      "presidente electo Colombia empleo",
    ],
    publishedAt: "2026-06-28",
    readingMinutes: 9,
    heroImage: "/images/guia/casa-narino-presidencia-colombia.png",
    sections: [
      {
        type: "p",
        text: "El 21 de junio de 2026, Colombia eligió a Abelardo de la Espriella como nuevo presidente para el período 2026-2030. Asumirá el cargo el 7 de agosto. Para millones de trabajadores colombianos, la pregunta inmediata es la misma: ¿qué pasa con mis derechos laborales? ¿La reforma laboral de Petro se desmonta? ¿Cambia lo que me pagan?",
      },
      {
        type: "h2",
        text: "Primero lo primero: la Ley 2466 sigue vigente",
      },
      {
        type: "p",
        text: "La Ley 2466 de 2025 es ley vigente y seguirá siéndolo hasta que el Congreso vote otra cosa. De la Espriella asume el 7 de agosto. Incluso si presenta un proyecto para modificar la reforma, ese proceso legislativo toma meses y requiere mayorías. Nada cambia de un día para otro.",
      },
      {
        type: "ul",
        items: [
          "Jornada de 42 horas semanales desde el 15 de julio de 2026",
          "Recargo dominical del 90 % desde julio de 2026",
          "Jornada nocturna desde las 7 p. m.",
          "Contratos con tope de 4 años",
          "Nuevas licencias remuneradas",
        ],
      },
      {
        type: "callout",
        text: "Si tu empleador usa la excusa del «nuevo gobierno» para no cumplir la ley actual, está cometiendo una infracción laboral. La ley no cambia por anticipación.",
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
        text: "Durante su campaña, De la Espriella planteó una visión económica basada en libre mercado, reducción del Estado y flexibilización laboral. Sus propuestas más concretas incluyen:",
      },
      {
        type: "h2",
        text: "1. Trabajo por horas: la propuesta más polémica",
      },
      {
        type: "p",
        text: "La propuesta central es legalizar de forma abierta el trabajo por horas como nueva modalidad de vinculación. Esto implicaría contratar por horas trabajadas, sin las obligaciones de un contrato tradicional.",
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
        text: "Su vicepresidente José Manuel Restrepo ha mencionado revisar el pago de parafiscales (SENA, ICBF y cajas de compensación) para reducir la carga sobre empresarios e incentivar empleo formal. El efecto puede ser positivo en creación de empleo, pero también menos recursos para programas sociales.",
      },
      {
        type: "h2",
        text: "3. Incentivos a la contratación formal",
      },
      {
        type: "p",
        text: "En su plan de gobierno propone incentivos económicos para empresas que contraten formalmente a jóvenes, mujeres y personas mayores de 50 años. La Ley 2466 ya prevé un subsidio del 25 % del SMLMV por empleo nuevo para estos grupos.",
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
        text: "Técnicamente sí, pero derogar completamente sería complejo:",
      },
      {
        type: "ul",
        items: [
          "El Congreso tiene composición diversa; no hay mayoría automática",
          "Algunos cambios ya están implementados y generan costos retroactivos",
          "La presión sindical (CUT, CGT, CTC) defenderá los avances logrados",
          "La Corte Constitucional puede revisar modificaciones que afecten derechos adquiridos",
        ],
      },
      {
        type: "p",
        text: "Lo más probable, según analistas, son modificaciones puntuales —especialmente en contratación y parafiscales— más que una derogación total.",
      },
      {
        type: "h2",
        text: "Cambios laborales más probables",
      },
      {
        type: "ul",
        items: [
          "Legalizar trabajo por horas — probabilidad media; podría flexibilizar pero también precarizar",
          "Revisar tope de contratos fijos a 4 años — probabilidad media-baja",
          "Reducir aportes parafiscales — probabilidad media",
          "Derogar jornada 42 horas — probabilidad baja; alta resistencia sindical",
          "Derogar recargo nocturno desde 7 p. m. — probabilidad media",
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
          "Verifica tu nómina de julio: desde el 15 de julio la jornada debe ser 42 horas",
          "Revisa recargos desde julio 1: el dominical y festivo subió al 90 %",
          "Si llevas más de 4 años con contrato fijo, exige contrato indefinido ahora",
          "Documenta contratos, desprendibles y comunicaciones laborales",
          "Acércate a tu sindicato si existe en tu empresa",
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
        text: "Preguntas frecuentes",
      },
      {
        type: "ul",
        items: [
          "¿Cuándo asume? El 7 de agosto de 2026, en posesión ante el Congreso.",
          "¿La jornada de 42 horas puede revertirse antes de agosto? No. Entra el 15 de julio y Petro sigue en el cargo hasta el 7 de agosto.",
          "¿Puede decretar cambios sin el Congreso? Solo en casos muy específicos de emergencia económica, no por decreto ordinario.",
          "¿Qué pasa si el Congreso modifica la ley en 2027? Los derechos ya causados no pueden quitarse retroactivamente.",
        ],
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
        text: "Lo que es seguro: hoy, ahora mismo, la Ley 2466 está vigente y te protege. Conoce tus derechos, exígelos y estate atento a los debates del segundo semestre de 2026.",
      },
      {
        type: "callout",
        text: "Nominapp te ayuda a registrar jornadas, recargos y liquidaciones según la normativa vigente. Descarga la app y lleva el control mientras se define el rumbo laboral del nuevo gobierno.",
      },
    ],
  },
];
