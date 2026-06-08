const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return "Incluye al menos un carácter especial (por ejemplo: ! @ # $ % &).";
  }
  return null;
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password.length > 0 && password === confirm;
}

export function mapAuthPasswordError(raw: string): string {
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes("password should contain") ||
    lower.includes("abcdefghijklmnopqrstuvwxyz")
  ) {
    return (
      "La contraseña no cumple la política del servidor. Usa mínimo 6 caracteres " +
      "con al menos un carácter especial (ej. Nominapp1!). " +
      "Si el mensaje persiste, revisa Authentication → Providers → Email en Supabase."
    );
  }
  if (lower.includes("same as the old password")) {
    return "La nueva contraseña debe ser distinta a la anterior.";
  }
  if (lower.includes("weak") || lower.includes("too short")) {
    return "La contraseña es demasiado débil. Usa mínimo 6 caracteres con un símbolo especial.";
  }

  return msg || "No se pudo actualizar la contraseña.";
}
