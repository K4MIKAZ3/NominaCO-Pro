"use client";

import { useState } from "react";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  hint?: string | null;
  required?: boolean;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = "new-password",
  hint = null,
  required = true,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className={`password-field${hint ? " password-field-invalid" : ""}`}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="password-field-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          {visible ? "Ocultar" : "Ver"}
        </button>
      </div>
      {hint && <p className="field-hint field-hint-error">{hint}</p>}
    </div>
  );
}
