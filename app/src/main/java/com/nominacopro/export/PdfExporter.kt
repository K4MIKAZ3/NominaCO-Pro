package com.nominacopro.export

import android.content.Context
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.ui.Formatters
import java.io.File
import java.io.FileOutputStream
import java.time.LocalDate
import java.time.format.DateTimeFormatter

object PdfExporter {

    private const val PAGE_W = 595
    private const val PAGE_H = 842
    private const val MARGIN = 40f
    private const val LINE = 18f

    fun exportPayroll(
        context: Context,
        profile: EmployeeProfile,
        payroll: MonthlyPayroll,
        use24Hour: Boolean,
    ): File {
        val fileName = "nomina_${payroll.year}_${payroll.month}.pdf"
        val file = File(context.cacheDir, fileName)
        val doc = PdfDocument()
        var y = MARGIN
        var pageNum = 1
        var page = startPage(doc, pageNum)
        var canvas = page.canvas
        val titlePaint = Paint().apply {
            textSize = 16f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        val bodyPaint = Paint().apply {
            textSize = 11f
            isAntiAlias = true
        }
        val smallPaint = Paint().apply {
            textSize = 9f
            isAntiAlias = true
        }

        fun newPageIfNeeded(extra: Float = LINE * 2) {
            if (y + extra > PAGE_H - MARGIN) {
                doc.finishPage(page)
                pageNum++
                page = startPage(doc, pageNum)
                canvas = page.canvas
                y = MARGIN
            }
        }

        fun draw(text: String, paint: Paint = bodyPaint) {
            newPageIfNeeded()
            canvas.drawText(text, MARGIN, y, paint)
            y += LINE
        }

        draw("NominaApp — Liquidación personal", titlePaint)
        draw("Uso personal · No constituye nómina oficial", smallPaint)
        y += 8f
        draw("Empleado: ${profile.name}")
        draw("Documento: ${profile.documentId.ifBlank { "—" }}")
        draw("Cargo: ${profile.jobTitle.ifBlank { "—" }}")
        draw("Período: ${Formatters.monthName(payroll.month)} ${payroll.year}")
        draw("Generado: ${LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))}")
        y += 8f
        draw("Días trabajados: ${payroll.workedDays}", titlePaint)
        if (payroll.remuneratedRestDays > 0) {
            draw("Dominical/festivo remunerado: ${payroll.remuneratedRestDays} día(s)", smallPaint)
        }
        draw(
            "Valor día: ${Formatters.money(payroll.dailyRate)} · Valor hora: ${Formatters.money(payroll.hourlyRate.toLong())}",
            smallPaint,
        )
        y += 4f

        draw("DEVENGADO", titlePaint)
        payroll.earnings.forEach { line ->
            draw("  ${line.label}: ${Formatters.money(line.amount)}")
        }
        draw("  Total devengado: ${Formatters.money(payroll.grossTotal)}", titlePaint)
        y += 4f

        draw("DESCUENTOS LEGALES", titlePaint)
        payroll.legalDeductions.forEach { line ->
            draw("  ${line.label}: -${Formatters.money(line.amount)}")
        }
        if (payroll.manualDeductions.isNotEmpty()) {
            y += 4f
            draw("EGRESOS / PRÉSTAMOS MANUALES", titlePaint)
            payroll.manualDeductions.forEach { line ->
                draw("  ${line.label}: -${Formatters.money(line.amount)}")
            }
        }
        y += 4f
        draw("NETO A RECIBIR: ${Formatters.money(payroll.netTotal)}", titlePaint)

        y += 8f
        draw("Desglose de horas", titlePaint)
        val b = payroll.breakdown
        draw("  Ordinarias diurnas: ${b.normalDiurna} h")
        draw("  Ordinarias nocturnas: ${b.nocturnaOrdinaria} h")
        draw("  Extra diurna: ${b.extraDiurna} h")
        draw("  Extra nocturna: ${b.extraNocturna} h")
        draw("  Dominical/festivo diurno: ${b.dominicalDiurna} h")
        draw("  Dominical/festivo nocturno: ${b.dominicalNocturna} h")
        draw("  Total horas: ${b.totalHours} h")

        y += 8f
        draw("Base legal: Ley 2466/2025 · SMMLV ${Formatters.money(ColombiaLaborLaw2026.SMMLV)}", smallPaint)
        draw("© 2026 Angel Berrocal · NominaApp · Uso personal", smallPaint)

        doc.finishPage(page)
        FileOutputStream(file).use { doc.writeTo(it) }
        doc.close()
        return file
    }

    fun exportWorkDays(
        context: Context,
        profile: EmployeeProfile,
        payroll: MonthlyPayroll,
        workDays: List<WorkDayEntry>,
        use24Hour: Boolean,
    ): File {
        val fileName = "dias_laborados_${payroll.year}_${payroll.month}.pdf"
        val file = File(context.cacheDir, fileName)
        val doc = PdfDocument()
        var pageNum = 1
        var page = startPage(doc, pageNum)
        var canvas = page.canvas
        var y = MARGIN
        val titlePaint = Paint().apply {
            textSize = 16f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            isAntiAlias = true
        }
        val bodyPaint = Paint().apply { textSize = 11f; isAntiAlias = true }
        val smallPaint = Paint().apply { textSize = 9f; isAntiAlias = true }

        fun draw(text: String, paint: Paint = bodyPaint) {
            if (y + LINE > PAGE_H - MARGIN) {
                doc.finishPage(page)
                pageNum++
                page = startPage(doc, pageNum)
                canvas = page.canvas
                y = MARGIN
            }
            canvas.drawText(text, MARGIN, y, paint)
            y += LINE
        }

        draw("NominaApp — Días laborados", titlePaint)
        draw("Uso personal · ${profile.name}", smallPaint)
        draw("Período: ${Formatters.monthName(payroll.month)} ${payroll.year}")
        y += 8f

        if (workDays.isEmpty()) {
            draw("No hay días registrados en este mes.")
        } else {
            workDays.sortedBy { it.date }.forEach { entry ->
                val dateStr = entry.date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy (EEE)", Formatters.locale))
                val start = Formatters.formatTime(entry.start, use24Hour)
                val end = Formatters.formatTime(entry.end, use24Hour)
                draw("$dateStr  ·  $start – $end  ·  ${entry.dayType.name}", titlePaint)
                if (entry.notes.isNotBlank()) draw("  Notas: ${entry.notes}", smallPaint)
                y += 4f
            }
        }

        y += 8f
        draw("Documento generado por NominaApp · Desarrollado por Angel Berrocal", smallPaint)

        doc.finishPage(page)
        FileOutputStream(file).use { doc.writeTo(it) }
        doc.close()
        return file
    }

    fun shareUri(context: Context, file: File) =
        FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)

    private fun startPage(doc: PdfDocument, number: Int): PdfDocument.Page {
        val info = PdfDocument.PageInfo.Builder(PAGE_W, PAGE_H, number).create()
        return doc.startPage(info)
    }
}
