import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Send, Radio, CheckCircle2, XCircle, RefreshCw, Eraser } from "lucide-react";
import { toast } from "sonner";
import { getSettingsFn } from "@/lib/settings.functions";
import { SETTINGS_QUERY_KEY } from "@/components/site/TrackingScripts";
import { track, getLeadId, getSessionId } from "@/lib/tracking";

export const Route = createFileRoute("/curupiro/diagnostico")({
  head: () => ({ meta: [{ title: "Diagnóstico de Rastreamento — Admin" }, { name: "robots", content: "noindex" }] }),
  component: DiagnosticoPage,
});

type LogEntry = {
  id: number;
  time: string;
  source: "dataLayer" | "gtag" | "ga4-network";
  event: string;
  payload: unknown;
};

function DiagnosticoPage() {
  const settingsQ = useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: () => getSettingsFn() });
  const settings = settingsQ.data;
  const gtmId = settings?.gtmId?.trim() || "";
  const ga4Id = settings?.ga4Id?.trim() || "";

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const idRef = useRef(0);
  const [dlLen, setDlLen] = useState(0);
  const [hasGtag, setHasGtag] = useState(false);
  const [hasGtm, setHasGtm] = useState(false);
  const [ga4Beacons, setGa4Beacons] = useState<string[]>([]);
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [leadId, setLeadIdSt] = useState("");
  const [sessionId, setSessionIdSt] = useState("");

  const addLog = (source: LogEntry["source"], event: string, payload: unknown) => {
    idRef.current += 1;
    setLogs((prev) =>
      [
        {
          id: idRef.current,
          time: new Date().toLocaleTimeString("pt-BR", { hour12: false }),
          source,
          event,
          payload,
        },
        ...prev,
      ].slice(0, 200),
    );
  };

  // Intercept dataLayer.push + gtag calls + GA4 collect requests
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      dataLayer?: Array<Record<string, unknown>>;
      gtag?: (...args: unknown[]) => void;
      google_tag_manager?: Record<string, unknown>;
    };
    w.dataLayer = w.dataLayer || [];
    setDlLen(w.dataLayer.length);
    setLeadIdSt(getLeadId());
    setSessionIdSt(getSessionId());

    // UTM
    try {
      const url = new URL(window.location.href);
      const u: Record<string, string> = {};
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]) {
        const v = url.searchParams.get(k);
        if (v) u[k] = v;
      }
      const saved = sessionStorage.getItem("oe.utm.v1");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Record<string, string>;
          for (const [k, v] of Object.entries(parsed)) if (v && !u[k]) u[k] = v;
        } catch { /* noop */ }
      }
      setUtm(u);
    } catch { /* noop */ }

    setHasGtag(typeof w.gtag === "function");
    setHasGtm(!!w.google_tag_manager);

    const origPush = w.dataLayer.push.bind(w.dataLayer);
    w.dataLayer.push = ((...args: Array<Record<string, unknown>>) => {
      for (const a of args) {
        const ev = typeof a?.event === "string" ? (a.event as string) : "(sem event)";
        addLog("dataLayer", ev, a);
      }
      setDlLen((n) => n + args.length);
      return origPush(...args);
    }) as typeof origPush;

    const origGtag = w.gtag;
    w.gtag = ((...args: unknown[]) => {
      const cmd = String(args[0] ?? "");
      const target = String(args[1] ?? "");
      addLog("gtag", `${cmd} ${target}`.trim(), args.slice(2));
      if (origGtag) return origGtag(...args);
    }) as typeof w.gtag;

    // Patch fetch + sendBeacon to detect GA4 collect requests
    const origFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request | URL).toString();
        if (url.includes("google-analytics.com/g/collect") || url.includes("googletagmanager.com/gtm.js")) {
          setGa4Beacons((prev) => [url, ...prev].slice(0, 30));
        }
      } catch { /* noop */ }
      return origFetch(...args);
    };
    const origBeacon = navigator.sendBeacon?.bind(navigator);
    if (origBeacon) {
      navigator.sendBeacon = ((url: string | URL, data?: BodyInit | null) => {
        const s = url.toString();
        if (s.includes("google-analytics.com/g/collect")) {
          setGa4Beacons((prev) => [s, ...prev].slice(0, 30));
        }
        return origBeacon(url, data);
      }) as typeof navigator.sendBeacon;
    }

    return () => {
      // best-effort restore
      window.fetch = origFetch;
      if (origBeacon) navigator.sendBeacon = origBeacon;
    };
  }, []);

  const fireTest = (event: string, extra: Record<string, unknown> = {}) => {
    track(event, { test_mode: true, source: "diagnostico", ...extra });
    toast.success(`Evento "${event}" enviado (teste, não é conversão).`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Radio className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-black">Diagnóstico de Rastreamento</h1>
          <p className="text-sm text-muted-foreground">
            Veja em tempo real o que está sendo enviado para o GTM e GA4. Nenhum evento aqui é conversão — o checkout é o único que gera conversão via afiliado.
          </p>
        </div>
        <button
          onClick={() => setLogs([])}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold hover:bg-muted"
        >
          <Eraser className="h-3.5 w-3.5" /> Limpar log
        </button>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Recarregar
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard label="GTM Container ID" value={gtmId || "não configurado"} ok={!!gtmId} />
        <StatusCard label="GA4 Measurement ID" value={ga4Id || "não configurado"} ok={!!ga4Id} />
        <StatusCard label="window.dataLayer" value={`${dlLen} eventos`} ok={dlLen > 0} />
        <StatusCard
          label="Bibliotecas carregadas"
          value={`${hasGtm ? "GTM ✓" : "GTM ✗"} · ${hasGtag ? "gtag ✓" : "gtag ✗"}`}
          ok={hasGtm || hasGtag}
        />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Identificadores</h2>
        <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
          <Info label="Lead ID" value={leadId} />
          <Info label="Session ID" value={sessionId} />
          <Info label="Página atual" value={typeof window !== "undefined" ? window.location.href : ""} />
        </div>
        <h3 className="mt-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
          UTMs detectadas
        </h3>
        {Object.keys(utm).length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Nenhuma UTM detectada. Teste com{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">?utm_source=teste&utm_medium=diagnostico&utm_campaign=validador</code>
          </p>
        ) : (
          <div className="mt-2 grid gap-1.5 text-xs md:grid-cols-3">
            {Object.entries(utm).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5">
                <span className="font-mono font-bold text-primary">{k}</span>
                <span className="truncate">{v}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
          Enviar eventos de teste
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Nenhum destes é uma conversão. Conversão real acontece apenas quando o lead finaliza a compra na plataforma de afiliados.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "page_view",
            "user_engagement",
            "scroll_depth",
            "view_item",
            "view_item_list",
            "select_item",
            "affiliate_click",
            "search",
            "coupon_click",
            "favorite_click",
            "share_click",
          ].map((ev) => (
            <button
              key={ev}
              onClick={() => fireTest(ev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold hover:bg-primary/10 hover:text-primary"
            >
              <Send className="h-3 w-3" /> {ev}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
            Log ao vivo do dataLayer / gtag
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">{logs.length} entradas</span>
        </div>
        <div className="mt-3 max-h-96 overflow-auto rounded-xl border border-border">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Nenhum evento ainda. Clique em um botão acima ou navegue no site em outra aba.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/70">
                <tr className="text-left">
                  <th className="px-3 py-2">Hora</th>
                  <th className="px-3 py-2">Origem</th>
                  <th className="px-3 py-2">Evento</th>
                  <th className="px-3 py-2">Payload</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{l.time}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                        {l.source}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono font-bold">{l.event}</td>
                    <td className="px-3 py-2">
                      <pre className="max-w-lg overflow-auto whitespace-pre-wrap break-all text-[10px] text-ink/80">
                        {safeStringify(l.payload)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
          Envios detectados para o Google Analytics
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          URLs interceptadas do Measurement Protocol (google-analytics.com/g/collect) — indica que o GA4 realmente está enviando.
        </p>
        {ga4Beacons.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Nenhum envio detectado ainda nesta aba. Dispare um evento acima ou navegue pelo site.
          </div>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {ga4Beacons.map((u, i) => (
              <li key={i} className="truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-[10px]">
                {u}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-xs text-primary">
        <strong>Onde os dados vão:</strong> os eventos entram em <code className="rounded bg-white/50 px-1">window.dataLayer</code>{" "}
        e o GTM ({gtmId || "GTM-..."}) os encaminha para o GA4 ({ga4Id || "G-..."}) via Measurement Protocol.
        A tabela <code className="rounded bg-white/50 px-1">analytics_events</code> guarda uma cópia interna para o painel de Leads.
      </div>
    </div>
  );
}

function StatusCard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1 truncate font-mono text-sm font-bold">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-2.5 py-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate font-mono">{value}</div>
    </div>
  );
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
