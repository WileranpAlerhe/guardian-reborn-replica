import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Activity, Users, MousePointerClick, Eye, RefreshCw, ChevronRight, X, Smartphone, Monitor, Tablet, Trash2 } from "lucide-react";
import {
  listLeadsFn,
  listLeadEventsFn,
  resetAnalyticsFn,
  type LeadSummary,
  type AnalyticsEventRow,
} from "@/lib/analytics.functions";
import { useProducts } from "@/lib/store";
import type { Product } from "@/data/seed";

export const Route = createFileRoute("/curupiro/analytics")({
  head: () => ({ meta: [{ title: "Analytics de Leads — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AnalyticsAdmin,
});

function usePassword() {
  const [pw, setPw] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") setPw(localStorage.getItem("oe.pw.v1"));
  }, []);
  return pw;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

function DeviceIcon({ d }: { d: string | null }) {
  const cls = "h-3.5 w-3.5";
  if (d === "mobile") return <Smartphone className={cls} />;
  if (d === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

type ProductLookup = Map<string, Product>;

function buildProductLookup(products: Product[]): ProductLookup {
  const m = new Map<string, Product>();
  for (const p of products) {
    m.set(p.id, p);
    if (p.slug) m.set(p.slug, p);
  }
  return m;
}

// Extract the last URL segment from a product-detail page path.
// Matches ANY prefix (since it's admin-configurable), e.g. /produto/xyz, /oferta/xyz.
function pathToProductKey(path: string | null): string | null {
  if (!path) return null;
  try {
    const clean = path.split("?")[0].split("#")[0];
    const parts = clean.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    // Exclude known non-product first segments
    if (["curupiro", "api", "assets"].includes(parts[0])) return null;
    return decodeURIComponent(parts[1]);
  } catch {
    return null;
  }
}

function resolveEventProduct(ev: AnalyticsEventRow, lookup: ProductLookup): Product | null {
  if (ev.product_id && lookup.has(ev.product_id)) return lookup.get(ev.product_id)!;
  const key = pathToProductKey(ev.page_path);
  if (key && lookup.has(key)) return lookup.get(key)!;
  return null;
}

function AnalyticsAdmin() {
  const password = usePassword();
  const [days, setDays] = useState(30);
  const [selected, setSelected] = useState<LeadSummary | null>(null);
  const products = useProducts();
  const productBy = useMemo(() => buildProductLookup(products), [products]);

  const leadsQ = useQuery({
    queryKey: ["admin-leads", days, !!password],
    enabled: !!password,
    queryFn: () => listLeadsFn({ data: { password: password!, days } }),
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (leadsQ.data && !leadsQ.data.ok) toast.error(leadsQ.data.message);
  }, [leadsQ.data]);

  const data = leadsQ.data?.ok ? leadsQ.data : null;
  const totals = data?.totals;
  const leads = data?.leads ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-black">Analytics de Leads</h1>
          <p className="text-sm text-muted-foreground">
            Cada visitante é rastreado com um ID persistente. Aqui você vê tudo o que ele fez, com horários exatos.
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold"
        >
          <option value={1}>Últimas 24h</option>
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
        <button
          onClick={() => leadsQ.refetch()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold hover:bg-muted"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${leadsQ.isFetching ? "animate-spin" : ""}`} /> Atualizar
        </button>
        <button
          onClick={async () => {
            const pw = password;
            if (!pw) return;
            const first = window.prompt(
              "Isso vai APAGAR TODOS os eventos, leads e sessões do analytics. Digite ZERAR para confirmar.",
            );
            if (first !== "ZERAR") {
              if (first !== null) toast.error("Confirmação incorreta. Digite exatamente ZERAR.");
              return;
            }
            if (!window.confirm("Tem certeza? Essa ação é irreversível.")) return;
            const res = await resetAnalyticsFn({ data: { password: pw, confirm: "ZERAR" } });
            if (!res.ok) {
              toast.error(res.message);
              return;
            }
            toast.success(`Analytics zerado (${res.deleted} eventos removidos).`);
            setSelected(null);
            leadsQ.refetch();
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
        >
          <Trash2 className="h-3.5 w-3.5" /> Zerar tudo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Leads únicos" value={totals?.leads ?? 0} icon={<Users className="h-4 w-4" />} />
        <Stat label="Sessões" value={totals?.sessions ?? 0} icon={<Activity className="h-4 w-4" />} />
        <Stat label="Visualizações" value={totals?.pageViews ?? 0} icon={<Eye className="h-4 w-4" />} />
        <Stat label="Cliques afiliado" value={totals?.affiliateClicks ?? 0} icon={<MousePointerClick className="h-4 w-4" />} accent />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="border-b border-border bg-muted/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {leadsQ.isLoading ? "Carregando..." : `${leads.length} leads no período`}
        </div>
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Lead</th>
                <th className="px-3 py-2">Último acesso</th>
                <th className="px-3 py-2">Eventos</th>
                <th className="px-3 py-2">Cliques</th>
                <th className="px-3 py-2">Origem</th>
                <th className="px-3 py-2">Último produto</th>
                <th className="px-3 py-2">Último evento</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const key = pathToProductKey(l.lastPage);
                const lastProduct = key ? productBy.get(key) : null;
                return (
                <tr
                  key={l.leadId}
                  onClick={() => setSelected(l)}
                  className="cursor-pointer border-t border-border hover:bg-muted/40"
                >
                  <td className="px-3 py-2 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <DeviceIcon d={l.device} />
                      <span title={l.leadId}>{l.leadId.slice(0, 18)}…</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">{fmtDate(l.lastSeen)}</td>
                  <td className="px-3 py-2 font-bold">{l.eventCount}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-bold text-primary">{l.affiliateClicks}</span>
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    {l.utmSource ? (
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        {l.utmSource}
                        {l.utmMedium ? ` / ${l.utmMedium}` : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">direto</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[11px]">
                    {lastProduct ? (
                      <div className="flex items-center gap-2">
                        {lastProduct.image && (
                          <img src={lastProduct.image} alt="" className="h-6 w-6 rounded border border-border bg-white object-contain" />
                        )}
                        <span className="max-w-[180px] truncate font-semibold text-ink" title={lastProduct.name}>
                          {lastProduct.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{l.lastEvent}</td>
                  <td className="px-3 py-2 text-right">
                    <ChevronRight className="inline h-3.5 w-3.5 text-muted-foreground" />
                  </td>
                </tr>
                );
              })}
              {!leads.length && !leadsQ.isLoading && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    Nenhum evento registrado ainda. Assim que um visitante navegar no site, ele aparecerá aqui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && password && (
        <LeadDrawer lead={selected} password={password} productBy={productBy} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-card ${
        accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-2xl font-black tabular-nums ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function LeadDrawer({
  lead,
  password,
  productBy,
  onClose,
}: {
  lead: LeadSummary;
  password: string;
  productBy: ProductLookup;
  onClose: () => void;
}) {
  const q = useQuery({
    queryKey: ["admin-lead-events", lead.leadId],
    queryFn: () => listLeadEventsFn({ data: { password, leadId: lead.leadId } }),
  });
  const events = useMemo<AnalyticsEventRow[]>(
    () => (q.data?.ok ? q.data.events : []),
    [q.data],
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-border p-4">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lead</div>
            <div className="break-all font-mono text-xs">{lead.leadId}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              <Chip>{lead.eventCount} eventos</Chip>
              <Chip>{lead.sessions} sessões</Chip>
              <Chip>{lead.pageViews} views</Chip>
              <Chip accent>{lead.affiliateClicks} cliques afiliado</Chip>
              {lead.device && <Chip>{lead.device}</Chip>}
              {lead.utmSource && <Chip>{lead.utmSource}</Chip>}
              {lead.utmCampaign && <Chip>{lead.utmCampaign}</Chip>}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Primeiro: {fmtDate(lead.firstSeen)} · Último: {fmtDate(lead.lastSeen)}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {q.isLoading && <div className="text-xs text-muted-foreground">Carregando eventos…</div>}
          <ol className="relative space-y-3 border-l border-border pl-4">
            {events.map((ev) => {
              const prod = resolveEventProduct(ev, productBy);
              const productLabel = ev.product_name || prod?.name || null;
              return (
              <li key={ev.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white" />
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <time className="font-mono">{fmtTime(ev.created_at)}</time>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-ink">{ev.event}</span>
                  {ev.device && <span>· {ev.device}</span>}
                </div>
                {productLabel && (
                  <div className="mt-0.5 flex items-center gap-2 text-xs">
                    {prod?.image && (
                      <img src={prod.image} alt="" className="h-7 w-7 rounded border border-border bg-white object-contain" />
                    )}
                    <span className="font-bold text-ink">{productLabel}</span>
                  </div>
                )}
                {ev.page_path && (
                  <div className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">
                    {ev.page_path}
                  </div>
                )}
                {ev.placement && (
                  <div className="text-[11px] text-muted-foreground">placement: {ev.placement}</div>
                )}
                {ev.affiliate_url && (
                  <a
                    href={ev.affiliate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block break-all text-[11px] text-primary underline"
                  >
                    {ev.affiliate_url}
                  </a>
                )}
              </li>
              );
            })}
            {!events.length && !q.isLoading && (
              <li className="text-xs text-muted-foreground">Sem eventos.</li>
            )}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 font-bold ${
        accent ? "bg-primary/10 text-primary" : "bg-muted text-ink"
      }`}
    >
      {children}
    </span>
  );
}
