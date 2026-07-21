import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Cable, Save, KeyRound, Eye, EyeOff, Copy, Check } from "lucide-react";
import {
  getSettingsFn,
  upsertSettingsFn,
  getAdminGatewayFn,
  upsertAdminGatewayFn,
  type SiteSettings,
} from "@/lib/settings.functions";
import { SETTINGS_QUERY_KEY } from "@/components/site/TrackingScripts";
import { PATH_PREFIX_QUERY_KEY } from "@/lib/store";

export const Route = createFileRoute("/curupiro/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Admin" }, { name: "robots", content: "noindex" }] }),
  component: IntegrationsAdmin,
});

const EMPTY: SiteSettings = {
  gtmId: "",
  ga4Id: "",
  headScript: "",
  bodyStartScript: "",
  bodyEndScript: "",
  pathPrefix: "produto",
};

function IntegrationsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: () => getSettingsFn() });
  const [form, setForm] = useState<SiteSettings>(data ?? EMPTY);
  const [saving, setSaving] = useState(false);

  // Gateway state
  const [gatewayKey, setGatewayKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [gatewayLoaded, setGatewayLoaded] = useState(false);
  const [savingGateway, setSavingGateway] = useState(false);
  const [hasEnvFallback, setHasEnvFallback] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const getPassword = () => (typeof window !== "undefined" ? localStorage.getItem("oe.pw.v1") : null);

  // Load gateway key once
  useEffect(() => {
    const password = getPassword();
    if (!password || gatewayLoaded) return;
    getAdminGatewayFn({ data: { password } })
      .then((res) => {
        if (res.ok) {
          setGatewayKey(res.streetpaysApiKey);
          setHasEnvFallback(res.hasEnvFallback);
        }
        setGatewayLoaded(true);
      })
      .catch(() => setGatewayLoaded(true));
  }, [gatewayLoaded]);

  const save = async () => {
    const password = getPassword();
    if (!password) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSaving(true);
    try {
      const res = await upsertSettingsFn({ data: { password, settings: form } });
      if (!res.ok) {
        toast.error(res.message);
      } else {
        toast.success("Integrações salvas!");
        qc.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
        qc.invalidateQueries({ queryKey: PATH_PREFIX_QUERY_KEY });
      }
    } finally {
      setSaving(false);
    }
  };

  const saveGateway = async () => {
    const password = getPassword();
    if (!password) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    setSavingGateway(true);
    try {
      const res = await upsertAdminGatewayFn({
        data: { password, streetpaysApiKey: gatewayKey.trim() },
      });
      if (!res.ok) toast.error(res.message);
      else toast.success("Chave do gateway salva! O checkout já está funcionando.");
    } finally {
      setSavingGateway(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Cable className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-black">Integrações</h1>
          <p className="text-sm text-muted-foreground">
            Google Tag Manager, Google Analytics 4 e gateway de pagamento.
          </p>
        </div>
      </div>

      {/* Gateway de Pagamento */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">
              Gateway de Pagamento — StreetPays
            </h2>
            <p className="text-xs text-muted-foreground">
              Cole a Secret Key da StreetPays. Assim que salvar, o checkout gera PIX automaticamente.
            </p>
          </div>
        </div>

        <Field
          label="StreetPays — Secret API Key"
          hint="Obtenha no painel da StreetPays em Configurações → API Keys. A chave fica salva com segurança e nunca é exposta no site."
        >
          <div className="flex items-center gap-2">
            <input
              value={gatewayKey}
              onChange={(e) => setGatewayKey(e.target.value)}
              placeholder={
                hasEnvFallback
                  ? "Chave configurada via ambiente (opcional sobrescrever)"
                  : "sk_live_..."
              }
              type={showKey ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              className="input font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-white text-muted-foreground hover:text-ink"
              aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="rounded-xl border border-success/40 bg-success/10 p-3 text-xs text-ink">
          <strong>Fluxo do pagamento:</strong> ao salvar a chave, todos os checkouts geram o QR Code
          PIX pela StreetPays. O webhook <span className="font-mono">/api/public/webhooks/streetpays</span>{" "}
          já está ativo e atualiza automaticamente o status do pedido (PAID / FAILED / REFUNDED).
        </div>

        <button
          onClick={saveGateway}
          disabled={savingGateway}
          className="inline-flex items-center gap-2 rounded-xl bg-cta px-5 py-2.5 text-sm font-black uppercase text-cta-foreground shadow-cta disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {savingGateway ? "Salvando..." : "Salvar chave do gateway"}
        </button>
      </div>

      {/* Tracking */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <Field label="Google Tag Manager — Container ID" hint="Formato: GTM-XXXXXXX">
          <input
            value={form.gtmId}
            onChange={(e) => setForm({ ...form, gtmId: e.target.value.trim() })}
            placeholder="GTM-XXXXXXX"
            className="input"
          />
        </Field>

        <Field label="Google Analytics 4 — Measurement ID" hint="Formato: G-XXXXXXXXXX">
          <input
            value={form.ga4Id}
            onChange={(e) => setForm({ ...form, ga4Id: e.target.value.trim() })}
            placeholder="G-XXXXXXXXXX"
            className="input"
          />
        </Field>

        <Field
          label="Prefixo do link do produto"
          hint="Ex.: 'produto' → /produto/slug · 'oferta' → /oferta/slug. Sem barras, apenas letras, números, hífen ou underline."
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">/</span>
            <input
              value={form.pathPrefix}
              onChange={(e) =>
                setForm({
                  ...form,
                  pathPrefix: e.target.value
                    .toLowerCase()
                    .replace(/^\/+|\/+$/g, "")
                    .replace(/[^a-z0-9\-_]/g, ""),
                })
              }
              placeholder="produto"
              className="input"
            />
            <span className="text-xs font-mono text-muted-foreground">/slug</span>
          </div>
        </Field>

        <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-primary">
          <strong>Importante:</strong> nenhum evento do site é marcado como conversão. O Google Ads
          recebe as conversões reais via integração externa da plataforma de afiliados. Aqui
          coletamos apenas dados comportamentais e criamos públicos.
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black uppercase text-primary-foreground shadow-cta disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar integrações"}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
          Eventos rastreados automaticamente
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-ink/90">
          {[
            "page_view",
            "session_start",
            "user_engagement",
            "scroll_depth",
            "time_on_page",
            "view_item",
            "view_item_list",
            "select_item",
            "view_promotion",
            "select_promotion",
            "banner_click",
            "category_click",
            "menu_click",
            "search",
            "affiliate_click",
            "outbound_click",
            "coupon_click",
            "favorite_click",
            "share_click",
            "logo_click",
          ].map((e) => (
            <li key={e} className="rounded-md bg-muted px-2 py-1 font-mono">{e}</li>
          ))}
        </ul>
      </div>

      <style>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--color-border); background: white; padding: 0.6rem 0.75rem; font-size: 0.875rem; outline: none; }
        .input:focus { border-color: var(--color-primary); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
