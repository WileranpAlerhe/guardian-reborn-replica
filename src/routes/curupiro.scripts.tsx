import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Code2, Save } from "lucide-react";
import { getSettingsFn, upsertSettingsFn, type SiteSettings } from "@/lib/settings.functions";
import { SETTINGS_QUERY_KEY } from "@/components/site/TrackingScripts";

export const Route = createFileRoute("/curupiro/scripts")({
  head: () => ({ meta: [{ title: "Scripts Personalizados — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ScriptsAdmin,
});

const EMPTY: SiteSettings = {
  gtmId: "",
  ga4Id: "",
  headScript: "",
  bodyStartScript: "",
  bodyEndScript: "",
  pathPrefix: "produto",
};

function ScriptsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: () => getSettingsFn() });
  const [form, setForm] = useState<SiteSettings>(data ?? EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = async () => {
    const password = typeof window !== "undefined" ? localStorage.getItem("oe.pw.v1") : null;
    if (!password) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSaving(true);
    try {
      const res = await upsertSettingsFn({ data: { password, settings: form } });
      if (!res.ok) toast.error(res.message);
      else {
        toast.success("Scripts salvos!");
        qc.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Code2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-black">Scripts Personalizados</h1>
          <p className="text-sm text-muted-foreground">
            Aceita HTML, JavaScript e snippets de terceiros. Injetado em todas as páginas.
          </p>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card">
        <ScriptField
          label="Código no <head>"
          hint="Ex.: pixels, tags de verificação, meta tags, CSS."
          value={form.headScript}
          onChange={(v) => setForm({ ...form, headScript: v })}
        />
        <ScriptField
          label="Após a abertura do <body>"
          hint="Ex.: <noscript> de pixels, iframes de tracking."
          value={form.bodyStartScript}
          onChange={(v) => setForm({ ...form, bodyStartScript: v })}
        />
        <ScriptField
          label="Antes do fechamento do </body>"
          hint="Ex.: chat, remarketing, snippets pesados carregados por último."
          value={form.bodyEndScript}
          onChange={(v) => setForm({ ...form, bodyEndScript: v })}
        />

        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-primary">
          <strong>Atenção:</strong> este conteúdo é executado em todas as páginas. Cole apenas
          scripts de fontes confiáveis.
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black uppercase text-primary-foreground shadow-cta disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar scripts"}
        </button>
      </div>
    </div>
  );
}

function ScriptField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        spellCheck={false}
        className="w-full rounded-xl border border-border bg-[#0b1220] p-3 font-mono text-xs text-emerald-200 outline-none focus:border-primary"
        placeholder="<!-- cole aqui seu HTML/JS -->"
      />
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
