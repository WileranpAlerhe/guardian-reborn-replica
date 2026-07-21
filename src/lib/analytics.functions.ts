import { createServerFn } from "@tanstack/react-start";
import { createHash, timingSafeEqual } from "node:crypto";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };


export type AnalyticsEventInput = {
  leadId: string;
  sessionId: string;
  event: string;
  pageUrl?: string;
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  device?: string;
  language?: string;
  userAgent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  productId?: string;
  productName?: string;
  category?: string;
  price?: number;
  affiliateUrl?: string;
  placement?: string;
  params?: JsonObject;
};

export type AnalyticsEventRow = {
  id: number;
  created_at: string;
  lead_id: string;
  session_id: string;
  event: string;
  page_url: string | null;
  page_path: string | null;
  page_title: string | null;
  referrer: string | null;
  device: string | null;
  language: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  product_id: string | null;
  product_name: string | null;
  category: string | null;
  price: number | null;
  affiliate_url: string | null;
  placement: string | null;
  params: JsonObject;
};

export type LeadSummary = {
  leadId: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
  sessions: number;
  device: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  affiliateClicks: number;
  pageViews: number;
  lastPage: string | null;
  lastEvent: string;
};

function verify(password: string): boolean {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return false;
  const a = createHash("sha256").update(password ?? "", "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

export const logEventFn = createServerFn({ method: "POST" })
  .inputValidator((data: AnalyticsEventInput) => data)
  .handler(async ({ data }) => {
    try {
      if (!data?.leadId || !data?.sessionId || !data?.event) return { ok: false };
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("analytics_events").insert({
        lead_id: String(data.leadId).slice(0, 80),
        session_id: String(data.sessionId).slice(0, 80),
        event: String(data.event).slice(0, 80),
        page_url: data.pageUrl?.slice(0, 500) ?? null,
        page_path: data.pagePath?.slice(0, 300) ?? null,
        page_title: data.pageTitle?.slice(0, 300) ?? null,
        referrer: data.referrer?.slice(0, 500) ?? null,
        device: data.device ?? null,
        language: data.language?.slice(0, 20) ?? null,
        user_agent: data.userAgent?.slice(0, 500) ?? null,
        utm_source: data.utmSource?.slice(0, 120) ?? null,
        utm_medium: data.utmMedium?.slice(0, 120) ?? null,
        utm_campaign: data.utmCampaign?.slice(0, 120) ?? null,
        product_id: data.productId?.slice(0, 120) ?? null,
        product_name: data.productName?.slice(0, 300) ?? null,
        category: data.category?.slice(0, 120) ?? null,
        price: typeof data.price === "number" ? data.price : null,
        affiliate_url: data.affiliateUrl?.slice(0, 800) ?? null,
        placement: data.placement?.slice(0, 120) ?? null,
        params: data.params ?? {},
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });

export const listLeadsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; days?: number }) => data)
  .handler(async ({ data }) => {
    if (!verify(data.password)) return { ok: false as const, message: "Não autorizado" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const days = Math.min(Math.max(data.days ?? 30, 1), 180);
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const { data: rows, error } = await supabaseAdmin
      .from("analytics_events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) return { ok: false as const, message: error.message };
    const events = (rows ?? []) as AnalyticsEventRow[];

    const byLead = new Map<string, AnalyticsEventRow[]>();
    for (const ev of events) {
      const arr = byLead.get(ev.lead_id) ?? [];
      arr.push(ev);
      byLead.set(ev.lead_id, arr);
    }
    const leads: LeadSummary[] = [];
    for (const [leadId, list] of byLead.entries()) {
      list.sort((a, b) => a.created_at.localeCompare(b.created_at));
      const sessions = new Set(list.map((e) => e.session_id));
      const last = list[list.length - 1];
      const first = list[0];
      leads.push({
        leadId,
        firstSeen: first.created_at,
        lastSeen: last.created_at,
        eventCount: list.length,
        sessions: sessions.size,
        device: last.device ?? first.device,
        utmSource: last.utm_source ?? first.utm_source,
        utmMedium: last.utm_medium ?? first.utm_medium,
        utmCampaign: last.utm_campaign ?? first.utm_campaign,
        affiliateClicks: list.filter((e) => e.event === "affiliate_click").length,
        pageViews: list.filter((e) => e.event === "page_view").length,
        lastPage: last.page_path ?? last.page_url,
        lastEvent: last.event,
      });
    }
    leads.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));

    const totals = {
      leads: leads.length,
      events: events.length,
      pageViews: events.filter((e) => e.event === "page_view").length,
      affiliateClicks: events.filter((e) => e.event === "affiliate_click").length,
      sessions: new Set(events.map((e) => e.session_id)).size,
    };

    return { ok: true as const, leads, totals };
  });

export const listLeadEventsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; leadId: string }) => data)
  .handler(async ({ data }) => {
    if (!verify(data.password)) return { ok: false as const, message: "Não autorizado" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("analytics_events")
      .select("*")
      .eq("lead_id", data.leadId)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, events: (rows ?? []) as AnalyticsEventRow[] };
  });

export const resetAnalyticsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; confirm: string }) => data)
  .handler(async ({ data }) => {
    if (!verify(data.password)) return { ok: false as const, message: "Não autorizado" };
    if (data.confirm !== "ZERAR") return { ok: false as const, message: "Confirmação inválida" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error, count } = await supabaseAdmin
      .from("analytics_events")
      .delete({ count: "exact" })
      .gt("id", 0);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, deleted: count ?? 0 };
  });
