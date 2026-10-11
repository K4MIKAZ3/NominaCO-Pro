package com.nominacopro.domain.law

/**
 * Fuentes públicas de los parámetros laborales que muestra la app.
 * Los enlaces son dominios del Estado colombiano (.gov.co).
 */
data class OfficialLegalSource(
    val label: String,
    val url: String,
)

object OfficialLegalSources {
    const val DISCLAIMER =
        "Nominapp no representa al Gobierno de Colombia ni al Ministerio del Trabajo, y no presta servicios gubernamentales. Los cálculos son estimaciones de uso personal y no reemplazan el desprendible oficial."

    val sources: List<OfficialLegalSource> = listOf(
        OfficialLegalSource(
            "Decreto 1469 de 2025 — salario mínimo 2026",
            "https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_1469_2025.htm",
        ),
        OfficialLegalSource(
            "Decreto 159 de 2026 — salario mínimo transitorio",
            "https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_0159_2026.htm",
        ),
        OfficialLegalSource(
            "Decreto 1470 de 2025 — auxilio de transporte",
            "https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_1470_2025.htm",
        ),
        OfficialLegalSource(
            "Ley 2466 de 2025 — recargos y jornada nocturna",
            "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=260676",
        ),
        OfficialLegalSource(
            "Ley 2101 de 2021 — jornada semanal",
            "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=166506",
        ),
        OfficialLegalSource(
            "Código Sustantivo del Trabajo",
            "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=33104",
        ),
        OfficialLegalSource(
            "Ley 100 de 1993 — salud y pensión",
            "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5248",
        ),
        OfficialLegalSource(
            "Ministerio del Trabajo",
            "https://www.mintrabajo.gov.co/",
        ),
    )
}
