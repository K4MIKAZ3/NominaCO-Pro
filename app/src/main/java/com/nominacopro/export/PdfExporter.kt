package com.nominacopro.export

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.text.TextPaint
import android.text.TextUtils
import androidx.core.content.FileProvider
import com.nominacopro.R
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.DayType
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
    private const val MARGIN = 36f
    private const val FOOTER_Y = PAGE_H - 28f

    private const val BRAND = 0xFF22C55E.toInt()
    private const val BRAND_DARK = 0xFF052E16.toInt()
    private const val MUTED = 0xFF64748B.toInt()
    private const val DANGER = 0xFFB91C1C.toInt()
    private const val SURFACE = 0xFFF8FAFC.toInt()
    private const val NETO_BG = 0xFFECFDF5.toInt()
    private const val BORDER = 0xFFE2E8F0.toInt()
    private const val DEDUCTION_HEADER = 0xFF475569.toInt()
    private const val HOURS_HEADER = 0xFFF1F5F9.toInt()
    private const val TEXT = 0xFF0F172A.toInt()

    fun exportPayroll(
        context: Context,
        profile: EmployeeProfile,
        payroll: MonthlyPayroll,
        use24Hour: Boolean,
    ): File {
        val fileName = "nomina_${payroll.year}_${payroll.month}.pdf"
        val file = File(context.cacheDir, fileName)
        val doc = PdfDocument()
        val page = startPage(doc, 1)
        val canvas = page.canvas
        val logo = loadLogo(context)
        val periodLabel = "${Formatters.monthName(payroll.month)} ${payroll.year}"
        val generated = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))

        var y = drawHeader(canvas, logo, "Liquidación personal", periodLabel)
        y = drawEmployeeCard(canvas, profile, periodLabel, generated, y)
        y = drawSummaryStrip(canvas, payroll, y)

        val halfW = (PAGE_W - MARGIN * 2 - 8f) / 2f
        val earningsRows = payroll.earnings.map { it.label to Formatters.money(it.amount) } +
            listOf("Total devengado" to Formatters.money(payroll.grossTotal))
        val leftBottom = drawTable(
            canvas = canvas,
            x = MARGIN,
            width = halfW,
            headerLeft = "DEVENGADO",
            headerRight = "Valor",
            rows = earningsRows,
            headerColor = BRAND,
            highlightLastRow = true,
            startY = y,
        )

        val deductionRows = buildList {
            payroll.legalDeductions.forEach { add(it.label to "-${Formatters.money(it.amount)}") }
            payroll.manualDeductions.forEach { add(it.label to "-${Formatters.money(it.amount)}") }
            if (isEmpty()) add("Sin descuentos" to "$ 0")
        }
        val rightBottom = drawTable(
            canvas = canvas,
            x = MARGIN + halfW + 8f,
            width = halfW,
            headerLeft = "DESCUENTOS",
            headerRight = "Valor",
            rows = deductionRows,
            headerColor = DEDUCTION_HEADER,
            valueColor = DANGER,
            startY = y,
        )

        y = maxOf(leftBottom, rightBottom) + 6f
        y = drawNetoBox(canvas, payroll.netTotal, y)

        val b = payroll.breakdown
        drawTable(
            canvas = canvas,
            x = MARGIN,
            width = PAGE_W - MARGIN * 2,
            headerLeft = "Desglose de horas",
            headerRight = "Horas",
            rows = listOf(
                "Ordinarias diurnas" to "${Formatters.hours(b.normalDiurna)} h",
                "Ordinarias nocturnas" to "${Formatters.hours(b.nocturnaOrdinaria)} h",
                "Extra diurna" to "${Formatters.hours(b.extraDiurna)} h",
                "Extra nocturna" to "${Formatters.hours(b.extraNocturna)} h",
                "Dominical/festivo diurno" to "${Formatters.hours(b.dominicalDiurna)} h",
                "Dominical/festivo nocturno" to "${Formatters.hours(b.dominicalNocturna)} h",
                "Total horas" to "${Formatters.hours(b.totalHours)} h",
            ),
            headerColor = HOURS_HEADER,
            headerTextColor = TEXT,
            compact = true,
            highlightLastRow = true,
            startY = y,
        )

        drawFooter(canvas)
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
        val page = startPage(doc, 1)
        val canvas = page.canvas
        val logo = loadLogo(context)
        val periodLabel = "${Formatters.monthName(payroll.month)} ${payroll.year}"
        val generated = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))

        var y = drawHeader(canvas, logo, "Días laborados", periodLabel)
        y = drawEmployeeCard(canvas, profile, periodLabel, generated, y)

        val labelPaint = paint(8f, MUTED)
        canvas.drawText("Total días registrados: ${workDays.size}", MARGIN, y, labelPaint)
        y += 10f

        val sorted = workDays.sortedBy { it.date }
        val rows = if (sorted.isEmpty()) {
            listOf(listOf("—", "—", "—", "—", "Sin jornadas en este mes"))
        } else {
            sorted.map { entry ->
                val dateStr = entry.date.format(
                    DateTimeFormatter.ofPattern("EEE dd/MM", Formatters.locale),
                )
                listOf(
                    dateStr,
                    Formatters.formatTime(entry.start, use24Hour),
                    Formatters.formatTime(entry.end, use24Hour),
                    dayTypeLabel(entry.dayType),
                    entry.notes.ifBlank { "—" },
                )
            }
        }

        val compact = rows.size > 22
        drawWideTable(
            canvas = canvas,
            headers = listOf("Fecha", "Entrada", "Salida", "Tipo", "Notas"),
            rows = rows,
            startY = y,
            endY = FOOTER_Y - 18f,
            compact = compact,
        )

        drawFooter(canvas)
        doc.finishPage(page)
        FileOutputStream(file).use { doc.writeTo(it) }
        doc.close()
        return file
    }

    fun shareUri(context: Context, file: File) =
        FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)

    private fun loadLogo(context: Context): Bitmap? =
        BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher)

    private fun dayTypeLabel(type: DayType): String = when (type) {
        DayType.NORMAL -> "Normal"
        DayType.FESTIVO_DOMINICAL -> "Festivo / dom."
        DayType.FESTIVO_NOCTURNO -> "Festivo noct."
    }

    private fun drawHeader(
        canvas: Canvas,
        logo: Bitmap?,
        title: String,
        periodLabel: String,
    ): Float {
        var y = MARGIN
        if (logo != null) {
            val dst = RectF(MARGIN, y, MARGIN + 32f, y + 32f)
            canvas.drawBitmap(logo, null, dst, null)
        } else {
            val fill = paint(fill = BRAND)
            canvas.drawRoundRect(RectF(MARGIN, y, MARGIN + 32f, y + 32f), 6f, 6f, fill)
            val letter = paint(16f, Color.WHITE, bold = true)
            canvas.drawText("N", MARGIN + 11f, y + 22f, letter)
        }

        canvas.drawText("Nominapp", MARGIN + 40f, y + 14f, paint(14f, BRAND_DARK, bold = true))
        canvas.drawText(title, MARGIN + 40f, y + 28f, paint(10f, TEXT))
        canvas.drawText(periodLabel, PAGE_W - MARGIN, y + 30f, paint(8f, MUTED, align = Paint.Align.RIGHT))

        val badgeW = 88f
        val badge = paint(fill = SURFACE)
        canvas.drawRoundRect(
            RectF(PAGE_W - MARGIN - badgeW, y + 2f, PAGE_W - MARGIN, y + 18f),
            4f,
            4f,
            badge,
        )
        val badgeText = paint(7.5f, MUTED)
        badgeText.textAlign = Paint.Align.CENTER
        canvas.drawText("Uso personal", PAGE_W - MARGIN - badgeW / 2f, y + 12f, badgeText)

        y += 42f
        val line = paint(stroke = BORDER, strokeWidth = 0.5f)
        canvas.drawLine(MARGIN, y, PAGE_W - MARGIN, y, line)
        return y + 10f
    }

    private fun drawEmployeeCard(
        canvas: Canvas,
        profile: EmployeeProfile,
        periodLabel: String,
        generated: String,
        y: Float,
    ): Float {
        val cardH = 52f
        canvas.drawRoundRect(
            RectF(MARGIN, y, PAGE_W - MARGIN, y + cardH),
            6f,
            6f,
            paint(fill = SURFACE),
        )

        val col1 = MARGIN + 12f
        val col2 = PAGE_W / 2f + 4f
        val row1 = y + 16f
        val row2 = y + 32f
        val label = paint(8f, MUTED)
        val valueBold = paint(9.5f, TEXT, bold = true)
        val value = paint(9.5f, TEXT)

        canvas.drawText("Empleado", col1, row1 - 5f, label)
        canvas.drawText("Documento", col2, row1 - 5f, label)
        canvas.drawText("Cargo", col1, row2 - 5f, label)
        canvas.drawText("Período / generado", col2, row2 - 5f, label)

        canvas.drawText(profile.name.ifBlank { "—" }, col1, row1 + 4f, valueBold)
        canvas.drawText(profile.documentId.ifBlank { "—" }, col2, row1 + 4f, valueBold)
        canvas.drawText(profile.jobTitle.ifBlank { "—" }, col1, row2 + 4f, value)
        canvas.drawText("$periodLabel · $generated", col2, row2 + 4f, value)

        return y + cardH + 10f
    }

    private fun drawSummaryStrip(canvas: Canvas, payroll: MonthlyPayroll, y: Float): Float {
        val parts = buildList {
            add("Días trabajados: ${payroll.workedDays}")
            add("Valor día: ${Formatters.money(payroll.dailyRate)}")
            add("Valor hora: ${Formatters.money(payroll.hourlyRate.toLong())}")
            if (payroll.remuneratedRestDays > 0) {
                add("Descansos rem.: ${payroll.remuneratedRestDays}")
            }
        }
        canvas.drawText(parts.joinToString("   ·   "), MARGIN, y, paint(8f, MUTED))
        return y + 12f
    }

    private fun drawNetoBox(canvas: Canvas, neto: Long, y: Float): Float {
        val boxH = 34f
        val rect = RectF(MARGIN, y, PAGE_W - MARGIN, y + boxH)
        val fill = paint(fill = NETO_BG)
        val stroke = paint(stroke = BRAND, strokeWidth = 1f)
        canvas.drawRoundRect(rect, 6f, 6f, fill)
        canvas.drawRoundRect(rect, 6f, 6f, stroke)

        canvas.drawText("NETO A RECIBIR", MARGIN + 14f, y + 14f, paint(9f, BRAND_DARK, bold = true))
        val amount = paint(16f, BRAND, bold = true, align = Paint.Align.RIGHT)
        canvas.drawText(Formatters.money(neto), PAGE_W - MARGIN - 14f, y + 22f, amount)
        return y + boxH + 8f
    }

    private fun drawTable(
        canvas: Canvas,
        x: Float,
        width: Float,
        headerLeft: String,
        headerRight: String,
        rows: List<Pair<String, String>>,
        headerColor: Int,
        headerTextColor: Int = Color.WHITE,
        valueColor: Int = TEXT,
        compact: Boolean = false,
        highlightLastRow: Boolean = false,
        startY: Float,
    ): Float {
        val headerH = 16f
        val rowH = if (compact) 13f else 14f
        val fontSize = if (compact) 7.5f else 8f
        val padX = 6f
        val valueX = x + width - padX
        val labelMaxW = width * 0.62f - padX

        var y = startY
        canvas.drawRect(x, y, x + width, y + headerH, paint(fill = headerColor))
        canvas.drawText(headerLeft, x + padX, y + 11f, paint(8f, headerTextColor, bold = true))
        val headerRightPaint = paint(8f, headerTextColor, bold = true, align = Paint.Align.RIGHT)
        canvas.drawText(headerRight, valueX, y + 11f, headerRightPaint)
        y += headerH

        val labelPaint = paint(fontSize, TEXT)
        val valuePaint = paint(fontSize, valueColor, bold = true, align = Paint.Align.RIGHT)
        val border = paint(stroke = BORDER, strokeWidth = 0.25f)

        rows.forEachIndexed { index, (label, value) ->
            val isLast = index == rows.lastIndex
            val bg = if (highlightLastRow && isLast) NETO_BG else Color.WHITE
            canvas.drawRect(x, y, x + width, y + rowH, paint(fill = bg))
            canvas.drawLine(x, y + rowH, x + width, y + rowH, border)

            val clipped = ellipsize(label, labelPaint, labelMaxW)
            canvas.drawText(clipped, x + padX, y + rowH - 4f, labelPaint)
            canvas.drawText(value, valueX, y + rowH - 4f, valuePaint)
            y += rowH
        }

        canvas.drawRect(x, startY, x + width, y, paint(stroke = BORDER, strokeWidth = 0.5f))
        return y
    }

    private fun drawWideTable(
        canvas: Canvas,
        headers: List<String>,
        rows: List<List<String>>,
        startY: Float,
        endY: Float,
        compact: Boolean,
    ) {
        val widths = floatArrayOf(72f, 48f, 48f, 62f, PAGE_W - MARGIN * 2 - 230f)
        val headerH = 16f
        val rowH = ((endY - startY - headerH) / rows.size.coerceAtLeast(1))
            .coerceIn(if (compact) 10f else 11f, 14f)
        val fontSize = if (compact) 7f else 7.5f
        val tableW = widths.sum()
        var y = startY

        canvas.drawRect(MARGIN, y, MARGIN + tableW, y + headerH, paint(fill = BRAND))
        var colX = MARGIN + 4f
        headers.forEachIndexed { index, header ->
            val align = if (index in 1..2) Paint.Align.CENTER else Paint.Align.LEFT
            val px = when (align) {
                Paint.Align.CENTER -> colX + widths[index] / 2f
                Paint.Align.RIGHT -> colX + widths[index] - 4f
                else -> colX
            }
            canvas.drawText(header, px, y + 11f, paint(8f, Color.WHITE, bold = true, align = align))
            colX += widths[index]
        }
        y += headerH

        val border = paint(stroke = BORDER, strokeWidth = 0.25f)
        val textPaint = paint(fontSize, TEXT)
        rows.forEachIndexed { rowIndex, row ->
            val bg = if (rowIndex % 2 == 0) Color.WHITE else SURFACE
            canvas.drawRect(MARGIN, y, MARGIN + tableW, y + rowH, paint(fill = bg))
            colX = MARGIN + 4f
            row.forEachIndexed { index, cell ->
                val maxW = widths[index] - 8f
                val clipped = ellipsize(cell, textPaint, maxW)
                val align = when (index) {
                    1, 2 -> Paint.Align.CENTER
                    4 -> Paint.Align.LEFT
                    else -> Paint.Align.LEFT
                }
                val px = when (align) {
                    Paint.Align.CENTER -> colX + widths[index] / 2f
                    Paint.Align.RIGHT -> colX + widths[index] - 4f
                    else -> colX
                }
                canvas.drawText(clipped, px, y + rowH - 4f, paint(fontSize, TEXT, align = align))
                colX += widths[index]
            }
            canvas.drawLine(MARGIN, y + rowH, MARGIN + tableW, y + rowH, border)
            y += rowH
        }
        canvas.drawRect(MARGIN, startY, MARGIN + tableW, y, paint(stroke = BORDER, strokeWidth = 0.5f))
    }

    private fun drawFooter(canvas: Canvas) {
        val line = paint(stroke = BRAND, strokeWidth = 0.6f)
        canvas.drawLine(MARGIN, FOOTER_Y - 10f, PAGE_W - MARGIN, FOOTER_Y - 10f, line)
        canvas.drawText(
            "Ley 2466/2025 · SMMLV ${Formatters.money(ColombiaLaborLaw2026.SMMLV)} · Uso personal · No constituye nómina oficial",
            MARGIN,
            FOOTER_Y,
            paint(7f, MUTED),
        )
        canvas.drawText(
            "nominapp.xyz · contacto@nominapp.xyz",
            PAGE_W - MARGIN,
            FOOTER_Y,
            paint(7f, MUTED, align = Paint.Align.RIGHT),
        )
    }

    private fun paint(
        size: Float = 10f,
        color: Int = TEXT,
        bold: Boolean = false,
        align: Paint.Align = Paint.Align.LEFT,
        fill: Int? = null,
        stroke: Int? = null,
        strokeWidth: Float = 1f,
    ): Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = size
        if (fill != null) {
            style = Paint.Style.FILL
            this.color = fill
        } else if (stroke != null) {
            style = Paint.Style.STROKE
            this.color = stroke
            this.strokeWidth = strokeWidth
        } else {
            style = Paint.Style.FILL
            this.color = color
            typeface = if (bold) Typeface.create(Typeface.DEFAULT, Typeface.BOLD) else Typeface.DEFAULT
            textAlign = align
        }
    }

    private fun ellipsize(text: String, paint: Paint, maxWidth: Float): String {
        val textPaint = TextPaint(paint)
        return TextUtils.ellipsize(text, textPaint, maxWidth, TextUtils.TruncateAt.END).toString()
    }

    private fun startPage(doc: PdfDocument, number: Int): PdfDocument.Page {
        val info = PdfDocument.PageInfo.Builder(PAGE_W, PAGE_H, number).create()
        return doc.startPage(info)
    }
}
