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
  const [webhookOrigin, setWebhookOrigin] = useState("");
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [utm, setUtm] = useState({
    baseUrl: "",
    source: "google",
    medium: "cpc",
    campaign: "",
    content: "",
    term: "",
  });
  const [copiedUtm, setCopiedUtm] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWebhookOrigin(window.location.origin);
      setUtm((u) => (u.baseUrl ? u : { ...u, baseUrl: window.location.origin + "/" }));
    }
  }, []);

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

  const webhookUrl = `${webhookOrigin || "https://SEU-DOMINIO"}/api/public/webhooks/streetpays`;

  const utmUrl = (() => {
    try {
      const base = utm.baseUrl || (typeof window !== "undefined" ? window.location.origin + "/" : "https://SEU-DOMINIO/");
      const u = new URL(base);
      if (utm.source) u.searchParams.set("utm_source", utm.source);
      if (utm.medium) u.searchParams.set("utm_medium", utm.medium);
      if (utm.campaign) u.searchParams.set("utm_campaign", utm.campaign);
      if (utm.content) u.searchParams.set("utm_content", utm.content);
      if (utm.term) u.searchParams.set("utm_term", utm.term);
      // Google Ads auto-tag: gclid é preservado automaticamente pelo tracking.ts
      return u.toString();
    } catch {
      return "";
    }
  })();

  const copyUtm = async () => {
    if (!utmUrl) return;
    try {
      await navigator.clipboard.writeText(utmUrl);
      setCopiedUtm(true);
      setTimeout(() => setCopiedUtm(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };


  const copyWebhook = async () => {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
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

        <Field label="Webhook URL — StreetPays" hint="Copie este endereço e cole no painel da StreetPays como URL de notificação/webhook.">
          <div className="flex items-center gap-2">
            <input
              value={webhookUrl}
              readOnly
              className="input cursor-text bg-muted font-mono text-xs"
            />
            <button
              type="button"
              onClick={copyWebhook}
              disabled={!webhookUrl}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-white text-muted-foreground hover:text-ink disabled:opacity-60"
              aria-label="Copiar webhook URL"
            >
              {copiedWebhook ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </Field>
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

      {/* UTM Builder */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cable className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">
              Gerador de UTM para campanhas
            </h2>
            <p className="text-xs text-muted-foreground">
              Use estes parâmetros no destino da campanha (Google Ads, Meta, TikTok, e-mail).
              O site já persiste <span className="font-mono">gclid, gbraid, wbraid, fbclid</span> e
              todos os <span className="font-mono">utm_*</span> — encaminhados automaticamente ao checkout.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="URL de destino" hint="Página que receberá o tráfego (ex.: home, produto, coleção).">
            <input value={utm.baseUrl} onChange={(e) => setUtm({ ...utm, baseUrl: e.target.value })} placeholder="https://seudominio.com/" className="input font-mono text-xs" />
          </Field>
          <Field label="utm_source" hint="Origem: google, facebook, instagram, tiktok, email">
            <input value={utm.source} onChange={(e) => setUtm({ ...utm, source: e.target.value.trim().toLowerCase() })} placeholder="google" className="input font-mono text-xs" />
          </Field>
          <Field label="utm_medium" hint="Canal: cpc, paid_social, email, display, organic">
            <input value={utm.medium} onChange={(e) => setUtm({ ...utm, medium: e.target.value.trim().toLowerCase() })} placeholder="cpc" className="input font-mono text-xs" />
          </Field>
          <Field label="utm_campaign" hint="Nome da campanha (sem espaços). Ex.: black_friday_2026">
            <input value={utm.campaign} onChange={(e) => setUtm({ ...utm, campaign: e.target.value.trim().replace(/\s+/g, "_").toLowerCase() })} placeholder="black_friday_2026" className="input font-mono text-xs" />
          </Field>
          <Field label="utm_content" hint="Anúncio/variação. Ex.: video_15s, banner_a, criativo_1">
            <input value={utm.content} onChange={(e) => setUtm({ ...utm, content: e.target.value.trim().replace(/\s+/g, "_").toLowerCase() })} placeholder="criativo_1" className="input font-mono text-xs" />
          </Field>
          <Field label="utm_term" hint="Palavra-chave (Google Ads costuma usar {keyword}).">
            <input value={utm.term} onChange={(e) => setUtm({ ...utm, term: e.target.value.trim() })} placeholder="{keyword}" className="input font-mono text-xs" />
          </Field>
        </div>

        <Field label="Link final com UTMs" hint="Cole no destino da campanha. Para Google Ads, ative auto-tagging: o gclid entra sozinho e o site o persiste até o checkout.">
          <div className="flex items-center gap-2">
            <input value={utmUrl} readOnly className="input cursor-text bg-muted font-mono text-xs" />
            <button
              type="button"
              onClick={copyUtm}
              disabled={!utmUrl}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-white text-muted-foreground hover:text-ink disabled:opacity-60"
              aria-label="Copiar URL com UTMs"
            >
              {copiedUtm ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-ink space-y-1.5">
          <div><strong>Modelo padrão Google Ads (Search/PMax):</strong></div>
          <div className="font-mono break-all">?utm_source=google&utm_medium=cpc&utm_campaign={"{campaignid}"}&utm_content={"{creative}"}&utm_term={"{keyword}"}</div>
          <div className="pt-1"><strong>Meta Ads (Facebook/Instagram):</strong></div>
          <div className="font-mono break-all">?utm_source=facebook&utm_medium=paid_social&utm_campaign={"{{campaign.name}}"}&utm_content={"{{ad.name}}"}</div>
          <div className="pt-1"><strong>TikTok Ads:</strong></div>
          <div className="font-mono break-all">?utm_source=tiktok&utm_medium=paid_social&utm_campaign=__CAMPAIGN_NAME__&utm_content=__AD_NAME__</div>
        </div>
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
