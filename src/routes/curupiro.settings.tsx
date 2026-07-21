import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store, useConfig } from "@/lib/store";

export const Route = createFileRoute("/curupiro/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const config = useConfig();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  const save = () => {
    store.saveConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black">Configurações</h1>
        <p className="text-sm text-muted-foreground">Ajuste identidade, contatos e senha do admin.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <Field label="Nome da marca">
          <input
            value={form.brandName}
            onChange={(e) => setForm({ ...form, brandName: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Slogan / Tagline">
          <input
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="E-mail de contato">
          <input
            type="email"
            value={form.supportEmail || ""}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="WhatsApp (opcional)">
          <input
            value={form.whatsapp || ""}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="input"
            placeholder="+55 11 99999-9999"
          />
        </Field>

        <Field label="Cor primária (hex)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border"
            />
            <input
              value={form.primaryColor}
              onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              className="input flex-1"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Referência visual. A paleta oficial fica no design system (tokens oklch).
          </p>
        </Field>

        <Field label="Senha do painel admin">
          <input
            type="text"
            value={form.adminPassword}
            onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
            className="input"
          />
        </Field>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black uppercase text-primary-foreground shadow-cta"
          >
            Salvar alterações
          </button>
          {saved && <span className="text-sm font-bold text-success">✓ Salvo!</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-primary">
        <strong>Logo e favicon:</strong> para substituir, envie os novos arquivos e me diga-
        atualizo os assets do projeto. As edições feitas aqui ficam salvas no seu navegador.
      </div>

      <style>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-border); background: white; padding: 0.6rem 0.75rem; font-size: 0.875rem; outline: none; }
        .input:focus { border-color: var(--color-primary); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
