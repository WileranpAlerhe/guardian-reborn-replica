import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { getSettingsFn, type SiteSettings } from "@/lib/settings.functions";
import { track } from "@/lib/tracking";

const EMPTY: SiteSettings = {
  gtmId: "",
  ga4Id: "",
  headScript: "",
  bodyStartScript: "",
  bodyEndScript: "",
  pathPrefix: "produto",
};

export const SETTINGS_QUERY_KEY = ["site-settings"] as const;

function injectRawScripts(container: HTMLElement, html: string, marker: string) {
  // Remove previous injection
  container.querySelectorAll(`[data-tracking="${marker}"]`).forEach((el) => el.remove());
  if (!html.trim()) return;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  Array.from(tpl.content.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // Re-create <script> tags so browsers execute them
      if (el.tagName === "SCRIPT") {
        const s = document.createElement("script");
        Array.from(el.attributes).forEach((a) => s.setAttribute(a.name, a.value));
        s.text = el.textContent ?? "";
        s.setAttribute("data-tracking", marker);
        container.appendChild(s);
      } else {
        el.setAttribute("data-tracking", marker);
        container.appendChild(el);
      }
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const wrap = document.createElement("span");
      wrap.setAttribute("data-tracking", marker);
      wrap.textContent = node.textContent;
      container.appendChild(wrap);
    }
  });
}

function loadOnce(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function TrackingScripts() {
  const { data: settings = EMPTY } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => getSettingsFn(),
    staleTime: 5 * 60_000,
  });
  const router = useRouter();
  const sessionStartedRef = useRef(false);
  const engagementSentRef = useRef(false);
  const timeStartRef = useRef<number>(Date.now());
  const scrollMarksRef = useRef<Set<number>>(new Set());

  // Inject GTM / GA4 / custom scripts
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];

    // GA4 (gtag.js) PRIMEIRO — precisa ser inicializado antes do GTM para
    // registrar o destino GA4. Se o GTM carrega antes com um Ads tag (AW-),
    // ele "sequestra" o gtag e o GA4 nunca recebe os eventos custom.
    if (settings.ga4Id) {
      (window as unknown as { __GA4_ID__?: string }).__GA4_ID__ = settings.ga4Id;
      if (!document.getElementById("ga4-config")) {
        const s = document.createElement("script");
        s.id = "ga4-config";
        s.setAttribute("data-tracking", "ga4");
        // stub gtag ANTES do loader — assim gtag('config') já entra na fila
        s.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js', new Date());gtag('config', '${settings.ga4Id}', {send_page_view:true});`;
        document.head.appendChild(s);
      }
      loadOnce("ga4-loader", `https://www.googletagmanager.com/gtag/js?id=${settings.ga4Id}`);
    }

    // GTM depois — pode conter Ads/Pixel/etc. sem interferir no GA4 direto.
    if (settings.gtmId && !document.getElementById("gtm-loader")) {
      const s = document.createElement("script");
      s.id = "gtm-loader";
      s.setAttribute("data-tracking", "gtm");
      s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.gtmId}');`;
      document.head.appendChild(s);

      const noscript = document.createElement("noscript");
      noscript.setAttribute("data-tracking", "gtm");
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // Custom head script
    injectRawScripts(document.head, settings.headScript, "custom-head");
    // Body start
    injectRawScripts(document.body, settings.bodyStartScript, "custom-body-start");
    // Body end
    injectRawScripts(document.body, settings.bodyEndScript, "custom-body-end");
  }, [settings.gtmId, settings.ga4Id, settings.headScript, settings.bodyStartScript, settings.bodyEndScript]);

  // session_start — once per session
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = "oe.session.v1";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, String(Date.now()));
        track("session_start");
      }
      sessionStartedRef.current = true;
    } catch {
      /* noop */
    }
  }, []);

  // SPA page_view + reset scroll/time per route
  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => {
      scrollMarksRef.current = new Set();
      timeStartRef.current = Date.now();
      engagementSentRef.current = false;
      // Defer so document.title is updated by HeadContent
      setTimeout(() => track("page_view"), 30);
    });
    // initial
    setTimeout(() => track("page_view"), 30);
    return () => unsub();
  }, [router]);

  // scroll_depth + user_engagement
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) return;
      const pct = Math.round((doc.scrollTop / total) * 100);
      [25, 50, 75, 100].forEach((mark) => {
        if (pct >= mark && !scrollMarksRef.current.has(mark)) {
          scrollMarksRef.current.add(mark);
          track("scroll", { percent_scrolled: mark });
        }
      });
      if (!engagementSentRef.current && Date.now() - timeStartRef.current > 10_000) {
        engagementSentRef.current = true;
        track("user_engagement", { engagement_time_msec: Date.now() - timeStartRef.current });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // time_on_page on tab hide / unload
  useEffect(() => {
    if (typeof window === "undefined") return;
    const send = () => {
      const seconds = Math.round((Date.now() - timeStartRef.current) / 1000);
      if (seconds < 1) return;
      track("time_on_page", { time_seconds: seconds });
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") send();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", send);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", send);
    };
  }, []);

  return null;
}
