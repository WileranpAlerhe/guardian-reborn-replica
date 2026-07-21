
CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  gtm_id text,
  ga4_id text,
  head_script text,
  body_start_script text,
  body_end_script text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);
INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
