export type PasswordCheck = {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  digit: boolean;
  special: boolean;
};

export function checkPassword(password: string): PasswordCheck {
  return {
    minLength: password.length >= 6,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const check = checkPassword(password);
  return (
    check.minLength &&
    check.lowercase &&
    check.uppercase &&
    check.digit &&
    check.special
  );
}

export const PASSWORD_REQUIREMENTS_HINT =
  "Mínimo 6 caracteres con mayúscula, minúscula, número y símbolo especial (ej. Nominapp1!).";

export function validatePassword(password: string): string | null {
  if (isPasswordValid(password)) return null;

  const check = checkPassword(password);
  if (!check.minLength) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (!check.lowercase) {
    return "Incluye al menos una letra minúscula.";
  }
  if (!check.uppercase) {
    return "Incluye al menos una letra mayúscula.";
  }
  if (!check.digit) {
    return "Incluye al menos un número.";
  }
  if (!check.special) {
    return "Incluye al menos un carácter especial (ej. ! @ #).";
  }

  return PASSWORD_REQUIREMENTS_HINT;
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password.length > 0 && password === confirm;
}

export function mapAuthRateLimitError(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
  }
  return raw.trim() || "Ocurrió un error.";
}

export function mapAuthPasswordError(raw: string): string {
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes("password should contain") ||
    lower.includes("abcdefghijklmnopqrstuvwxyz")
  ) {
    return PASSWORD_REQUIREMENTS_HINT;
  }
  if (lower.includes("same as the old password")) {
    return "La nueva contraseña debe ser distinta a la anterior.";
  }
  if (lower.includes("weak") || lower.includes("too short")) {
    return PASSWORD_REQUIREMENTS_HINT;
  }

  return msg || "No se pudo actualizar la contraseña.";
}
