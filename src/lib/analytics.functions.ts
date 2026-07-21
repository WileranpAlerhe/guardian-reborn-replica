import { createServerFn } from "@tanstack/react-start";
import { callEdgeApi } from "./edge-api.server";

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

export const logEventFn = createServerFn({ method: "POST" })
  .inputValidator((data: AnalyticsEventInput) => data)
  .handler(async ({ data }) => {
    try {
      return await callEdgeApi<{ ok: boolean }>("public.logEvent", data);
    } catch {
      return { ok: false };
    }
  });

export const listLeadsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; days?: number }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<
      | { ok: true; leads: LeadSummary[]; totals: Record<string, number> }
      | { ok: false; message: string }
    >("admin.listLeads", data);
  });

export const listLeadEventsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; leadId: string }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<
      { ok: true; events: AnalyticsEventRow[] } | { ok: false; message: string }
    >("admin.listLeadEvents", data);
  });

export const resetAnalyticsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; confirm: string }) => data)
  .handler(async ({ data }) => {
    return await callEdgeApi<
      { ok: true; deleted: number } | { ok: false; message: string }
    >("admin.resetAnalytics", data);
  });
