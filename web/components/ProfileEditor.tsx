"use client";

import { useEffect, useState } from "react";
import {
  CONTRACT_TYPE_OPTIONS,
  emptyProfile,
  fetchProfileRecord,
  PAY_PERIOD_OPTIONS,
  saveProfileRecord,
  type ProfileRecord,
} from "@/lib/dashboard-api";

interface ProfileEditorProps {
  userId: string;
  onSaved: () => void;
}

export function ProfileEditor({ userId, onSaved }: ProfileEditorProps) {
  const [profile, setProfile] = useState<ProfileRecord>(emptyProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProfileRecord(userId)
      .then((data) => {
        if (cancelled) return;
        setProfile(data ?? emptyProfile());
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar el perfil.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveProfileRecord(userId, profile);
      setMessage("Perfil guardado. Se sincronizará con la app.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="dashboard-status">Cargando perfil…</p>;
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <h2>Perfil laboral</h2>
      <p className="editor-lead">
        Estos datos alimentan el cálculo de nómina en la app y en la web.
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="profile-name">Nombre</label>
          <input
            id="profile-name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="profile-document">Documento</label>
          <input
            id="profile-document"
            value={profile.documentId}
            onChange={(e) => setProfile({ ...profile, documentId: e.target.value })}
          />
        </div>
        <div className="form-group form-grid-full">
          <label htmlFor="profile-job">Cargo</label>
          <input
            id="profile-job"
            value={profile.jobTitle}
            onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="profile-salary">Salario mensual (COP)</label>
          <input
            id="profile-salary"
            type="number"
            min={0}
            step={1000}
            value={profile.monthlySalary || ""}
            onChange={(e) =>
              setProfile({ ...profile, monthlySalary: Number.parseInt(e.target.value, 10) || 0 })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="profile-hours">Horas diarias</label>
          <input
            id="profile-hours"
            type="number"
            min={1}
            max={12}
            value={profile.dailyHours}
            onChange={(e) =>
              setProfile({
                ...profile,
                dailyHours: Number.parseInt(e.target.value, 10) || 8,
              })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="profile-contract">Tipo de contrato</label>
          <select
            id="profile-contract"
            value={profile.contractType}
            onChange={(e) =>
              setProfile({
                ...profile,
                contractType: e.target.value as ProfileRecord["contractType"],
              })
            }
          >
            {CONTRACT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="profile-period">Período de cobro</label>
          <select
            id="profile-period"
            value={profile.payPeriodType}
            onChange={(e) =>
              setProfile({
                ...profile,
                payPeriodType: e.target.value as ProfileRecord["payPeriodType"],
              })
            }
          >
            {PAY_PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="profile-vacation">Vacaciones pendientes (días)</label>
          <input
            id="profile-vacation"
            type="number"
            min={0}
            value={profile.pendingVacationDays}
            onChange={(e) =>
              setProfile({
                ...profile,
                pendingVacationDays: Number.parseInt(e.target.value, 10) || 0,
              })
            }
          />
        </div>
      </div>

      {error && <div className="form-message error">{error}</div>}
      {message && <div className="form-message success">{message}</div>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}
