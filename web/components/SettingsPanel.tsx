"use client";

import { useState } from "react";
import { ProfileEditor } from "@/components/ProfileEditor";
import {
  deleteManualHoliday,
  deleteOwnAccount,
  saveAppPreferences,
  type ManualHolidayRecord,
} from "@/lib/dashboard-api";
import { formatMoney, formatTime } from "@/lib/format";
import type { AppPreferences, EmployeeProfile } from "@/lib/payroll/models";

interface SettingsPanelProps {
  userId: string;
  profile: EmployeeProfile | null;
  preferences: AppPreferences;
  manualHolidays: ManualHolidayRecord[];
  accountEmail: string | null;
  onRefresh: () => void;
  onSignOut: () => void;
}

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function SettingsPanel({
  userId,
  profile,
  preferences,
  manualHolidays,
  accountEmail,
  onRefresh,
  onSignOut,
}: SettingsPanelProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [prefs, setPrefs] = useState(preferences);
  const [start, setStart] = useState(
    padTime(preferences.defaultStartHour, preferences.defaultStartMinute),
  );
  const [end, setEnd] = useState(padTime(preferences.defaultEndHour, preferences.defaultEndMinute));
  const [use24h, setUse24h] = useState(preferences.use24HourFormat);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSaveSchedule() {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const next: AppPreferences = {
      ...prefs,
      defaultStartHour: sh,
      defaultStartMinute: sm,
      defaultEndHour: eh,
      defaultEndMinute: em,
      use24HourFormat: use24h,
    };
    setSaving(true);
    setError(null);
    try {
      await saveAppPreferences(userId, next);
      setPrefs(next);
      setEditingSchedule(false);
      setMessage("Preferencias guardadas.");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle24h(checked: boolean) {
    setUse24h(checked);
    const next = { ...prefs, use24HourFormat: checked };
    try {
      await saveAppPreferences(userId, next);
      setPrefs(next);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  }

  async function handleRemoveHoliday(dateIso: string) {
    try {
      await deleteManualHoliday(userId, dateIso);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  }

  async function handleDeleteAccount() {
    if (deleteStep < 2) {
      setDeleteStep(deleteStep + 1);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteOwnAccount();
      onSignOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la cuenta.");
      setDeleting(false);
    }
  }

  if (showProfile) {
    return (
      <section className="editor-section">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowProfile(false)}>
          ← Volver a Ajustes
        </button>
        <ProfileEditor userId={userId} onSaved={() => { onRefresh(); setShowProfile(false); }} />
      </section>
    );
  }

  return (
    <section className="editor-section">
      <h2>Ajustes</h2>
      <p className="editor-lead">Horario, perfil y cuenta.</p>

      {error && <div className="form-message error">{error}</div>}
      {message && <div className="form-message success">{message}</div>}

      <div className="summary-card">
        <p className="summary-month">Perfil laboral</p>
        {profile ? (
          <>
            <p><strong>{profile.name}</strong></p>
            <p className="editor-hint">
              {profile.jobTitle || "Sin cargo"} · {formatMoney(profile.monthlySalary)}
            </p>
            <p className="editor-hint">
              {profile.payPeriodType === "BIWEEKLY" ? "Quincenal" : profile.payPeriodType} · {profile.dailyHours} h/día
            </p>
          </>
        ) : (
          <p className="editor-hint">Configura salario, contrato y jornada para calcular tu nómina.</p>
        )}
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowProfile(true)}>
          {profile ? "Editar perfil" : "Configurar perfil"}
        </button>
      </div>

      <div className="summary-card">
        <p className="summary-month">Horario por defecto</p>
        {!editingSchedule ? (
          <>
            <p>
              {formatTime(
                padTime(prefs.defaultStartHour, prefs.defaultStartMinute),
                prefs.use24HourFormat,
              )}{" "}
              –{" "}
              {formatTime(
                padTime(prefs.defaultEndHour, prefs.defaultEndMinute),
                prefs.use24HourFormat,
              )}
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingSchedule(true)}>
              Editar horario
            </button>
          </>
        ) : (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="pref-start">Entrada</label>
              <input id="pref-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="pref-end">Salida</label>
              <input id="pref-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div className="form-actions form-grid-full">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingSchedule(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={saving}
                onClick={handleSaveSchedule}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="summary-card">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={use24h}
            onChange={(e) => handleToggle24h(e.target.checked)}
          />
          <span>Formato de hora 24 h</span>
        </label>
      </div>

      <div className="summary-card">
        <p className="summary-month">Festivos manuales</p>
        {manualHolidays.length === 0 ? (
          <p className="editor-hint">Marca festivos desde el calendario al editar un día.</p>
        ) : (
          <ul className="workday-list">
            {manualHolidays.map((h) => (
              <li key={h.dateIso} className="workday-item">
                <div>
                  <strong>{h.dateIso}</strong>
                  {h.label && <span className="workday-meta">{h.label}</span>}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm workday-delete"
                  onClick={() => handleRemoveHoliday(h.dateIso)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="summary-card">
        <p className="summary-month">Cuenta</p>
        {accountEmail && <p className="editor-hint">{accountEmail}</p>}
        <div className="btn-row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onSignOut}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="summary-card summary-card--danger">
        <p className="summary-month">Eliminar cuenta</p>
        {deleteStep === 0 && (
          <button type="button" className="btn btn-ghost btn-sm workday-delete" onClick={() => setDeleteStep(1)}>
            Solicitar eliminación
          </button>
        )}
        {deleteStep === 1 && (
          <>
            <p className="editor-hint">Esta acción borra todos tus datos de forma permanente.</p>
            <div className="form-group">
              <label htmlFor="delete-reason">Motivo (opcional)</label>
              <textarea
                id="delete-reason"
                rows={2}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDeleteStep(2)}>
              Continuar
            </button>
          </>
        )}
        {deleteStep >= 2 && (
          <>
            <p className="editor-hint">
              Confirmación {deleteStep - 1} de 2. ¿Estás seguro de eliminar tu cuenta?
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm workday-delete"
              disabled={deleting}
              onClick={handleDeleteAccount}
            >
              {deleting ? "Eliminando…" : deleteStep === 2 ? "Sí, eliminar" : "Confirmar definitivamente"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDeleteStep(0)}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </section>
  );
}
