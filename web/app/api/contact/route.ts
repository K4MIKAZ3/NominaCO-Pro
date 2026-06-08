import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/lib/site";

const EMAIL_REGEX = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "El formulario de contacto aún no está configurado en el servidor." },
      { status: 503 },
    );
  }

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Indica tu nombre." }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Indica un correo válido." }, { status: 400 });
  }
  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: "Tu mensaje debe tener entre 10 y 4000 caracteres." },
      { status: 400 },
    );
  }

  const to = process.env.CONTACT_TO_EMAIL ?? site.contactEmail;
  const from =
    process.env.RESEND_FROM_EMAIL ?? `Nominapp <contacto@nominapp.xyz>`;
  const emailSubject =
    subject.length > 0 ? `[Nominapp] ${subject}` : `[Nominapp] Contacto de ${name}`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: emailSubject,
    text: [
      "Nuevo mensaje desde nominapp.xyz",
      "",
      `Nombre: ${name}`,
      `Correo: ${email}`,
      subject ? `Asunto: ${subject}` : null,
      "",
      "Mensaje:",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    return NextResponse.json(
      { error: "No se pudo enviar el correo. Inténtalo más tarde." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
