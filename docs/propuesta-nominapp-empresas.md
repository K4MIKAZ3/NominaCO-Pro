# Nominapp Empresas

App aislada para empleadores. La app personal sigue en verde, gratis y de uso del trabajador. Empresas es otro programa, con icono y marca en azul claro, otro identificador de instalación y datos separados.

Demo funcional: `/empresas`.

## La idea

El empleador programa quién trabaja qué día. Ese registro se guarda. Al publicarlo, el trabajador recibe el aviso en el momento. Una persona autorizada marca la hora real de entrada y de salida. A los 30 días, la nómina, las extras y los recargos salen de esas marcas.

La programación dice quién debía ir. La marcación dice a qué hora estuvo. El pago usa la marcación.

## Roles

| Rol | Persona en el demo | Qué puede hacer |
|---|---|---|
| Programador | Diana Castro | Elige trabajadores y día, define el turno, guarda el borrador y lo publica. |
| Marcación | Héctor Ruiz | Ve solo los turnos ya publicados y registra entrada y salida. No cambia la programación ni la nómina. |
| Administrador | Elena Vargas | Programa, marca y ve la liquidación del mes. |
| Trabajador | Cada empleado | Recibe el aviso, consulta su horario y su colilla. No edita turnos ni marcas. |

Un turno en borrador todavía no avisa y todavía no se puede marcar. Publicar hace las dos cosas: deja el día firme y manda la notificación.

Si se retira a alguien que ya estaba publicado, al volver a publicar esa persona recibe un aviso de turno retirado.

## Flujo del mes

1. **Programar.** Se abre el día, se marcan las personas y se confirma entrada y salida previstas. Hay atajos de madrugada (04:00–12:00), mostrador (08:00–17:00) y tarde (13:00–21:00). Guardar deja el borrador.
2. **Publicar.** Cada persona de esa lista recibe al instante: día, hora de entrada y hora de salida. El aviso queda en su bandeja.
3. **Marcar.** El autorizado registra la hora real. Un retardo se muestra y no se descuenta por sí solo. Sin entrada y salida, ese día no entra al pago.
4. **Liquidar.** El corte del mes comercial de 30 días suma todos los turnos publicados que ya tienen marcación completa.

En el demo, Panadería La Aurora (Bogotá) ya trae el 1 al 9 de octubre de 2026 programado y marcado, para que la nómina no salga vacía. El sábado 10 queda libre para publicar un turno nuevo y ver el aviso.

## Qué calcula el demo

Parámetros de 2026, los mismos de la app personal:

- SMMLV $1.750.905. Auxilio de transporte $249.095, solo si el salario no pasa de 2 SMMLV, proporcional a los días marcados.
- Valor hora = salario mensual ÷ 30 ÷ jornada diaria del contrato.
- Las primeras horas de la jornada se pagan como ordinarias. Lo que sigue es extra.
- Nocturno 19:00–06:00, recargo del 35 %.
- Extra diurna 25 %. Extra nocturna 75 %.
- Domingo y festivo en octubre 2026: 90 % (Ley 2466; sube al 100 % el 1 de julio de 2027). El 12 de octubre está cargado como festivo.
- Si el turno cubre las 12:00–13:00, esa hora de almuerzo no se paga.
- Salud 4 % y pensión 4 % del trabajador, sobre el devengado sin el auxilio de transporte.
- Tope de alerta: más de 2 horas extra en un día o más de 12 en una semana.

Ejemplos ya cargados: Laura sale una hora más tarde el 6 de octubre, Sara el 8, Andrés hace extra nocturna el 7 y llega tarde el 2. Marina no tiene marca el 5: ese día figura como ausencia y no se paga. Laura y Camilo trabajan el domingo 4, con recargo.

## Programa completo, encima de este ciclo

El demo cubre programar, avisar, marcar y pagar el mes. Para que la nómina de un empleador en Colombia quede cerrada en 2026, el producto tiene que sumar:

- Asalariado mensual contra jornal. Al mensual se le liquida el mes de 30 días y se le restan novedades. Recargos y extras van encima.
- Semana ordinaria según el contrato (cinco o seis días), no siempre de lunes a viernes.
- Corte dentro del mismo período cuando cambia la regla: dominical al 90 % desde el 1 de julio de 2026, y jornada máxima de 42 horas desde el 15 de julio de 2026. El salario no baja por la reducción de jornada.
- Aportes del empleador: salud 8,5 %, pensión 12 %, ARL según clase de riesgo, caja 4 %, SENA 2 % e ICBF 3 %, con la exoneración del artículo 114-1 para quien gana menos de 10 SMMLV.
- Fondo de solidaridad desde 4 SMMLV. Ingreso base de cotización entre 1 y 25 SMMLV. Tope del 40 % para pagos no salariales.
- Salario integral desde 13 SMMLV.
- PILA, con novedades de ingreso, retiro, incapacidad, licencia, vacaciones y suspensión.
- Incapacidad común, accidente de trabajo, maternidad, paternidad, luto, lactancia y vacaciones (15 días hábiles por año, sin auxilio de transporte).
- Prima (30 de junio y 20 de diciembre), cesantías al fondo (14 de febrero), intereses al trabajador (31 de enero) y dotación para quien gana hasta 2 SMMLV.
- Liquidación de contrato con indemnización según la causa y el tipo de contrato.
- Retención en la fuente con la UVT 2026 de $52.374.
- Contratos: indefinido, término fijo con aviso de 30 días, obra o labor, y aprendizaje.
- Embargos con el mínimo inembargable y el tope por alimentos.
- Comprobante con cada concepto separado, y bloqueo de la nómina aprobada. Una corrección deja otra versión.

La tabla legal queda versionada por fecha, para que un decreto nuevo no reescriba la nómina ya pagada.

## Qué no es

Nominapp Empresas no reemplaza al contador ni al abogado. Calcula con la norma publicada y deja el rastro de quién programó, quién marcó y cuándo se publicó. La app personal no lee estos datos, y esta no lee los de la app personal.
