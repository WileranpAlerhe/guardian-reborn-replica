
CREATE TABLE public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  page_url TEXT,
  page_path TEXT,
  page_title TEXT,
  referrer TEXT,
  device TEXT,
  language TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  product_id TEXT,
  product_name TEXT,
  category TEXT,
  price NUMERIC,
  affiliate_url TEXT,
  placement TEXT,
  params JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_lead_id_idx ON public.analytics_events (lead_id, created_at DESC);
CREATE INDEX analytics_events_event_idx ON public.analytics_events (event);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON SEQUENCE public.analytics_events_id_seq TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
