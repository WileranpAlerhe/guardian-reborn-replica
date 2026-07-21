
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'eletronicos',
  old_price NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 5,
  affiliate_url TEXT NOT NULL DEFAULT '',
  badges TEXT[] NOT NULL DEFAULT '{}',
  coupon_text TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE UNIQUE INDEX products_slug_unique ON public.products (slug) WHERE slug IS NOT NULL AND slug <> '';

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.products (id, name, description, image, category, old_price, price, sold, rating, affiliate_url, badges, coupon_text, active, "order") VALUES
('ar-britania-baq2200b','Ar-Condicionado Split Britânia BAQ2200B','Split parede, silencioso, controle remoto, alta eficiência energética.','/assets/product-ac-britania.png','casa',249.9,159.9,2340,4.9,'https://shopee.com.br',ARRAY['destaque','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,0),
('fone-i12','Fone Bluetooth i12 Sem Fio',NULL,'','eletronicos',89.9,49.9,10200,4.8,'https://shopee.com.br',ARRAY['mais-vendido','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,1),
('smartwatch-d20','Smartwatch D20 Y68 Relógio Inteligente',NULL,'','eletronicos',149.9,89.9,8700,4.7,'https://shopee.com.br',ARRAY['mais-vendido','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,2),
('caixa-som-bluetooth','Caixa de Som Bluetooth Portátil',NULL,'','eletronicos',199.9,139.9,6300,4.6,'https://shopee.com.br',ARRAY['oferta'],'Cupom de 10% já aplicado na 1ª compra',true,3),
('mini-liquidificador','Mini Liquidificador Portátil USB',NULL,'','casa',79.9,59.9,7100,4.7,'https://shopee.com.br',ARRAY['mais-vendido','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,4),
('tenis-casual','Tênis Casual Unissex Branco',NULL,'','moda',189.9,129.9,6400,4.8,'https://shopee.com.br',ARRAY['novo'],'Cupom de 10% já aplicado na 1ª compra',true,5),
('perfume-importado','Perfume Importado Feminino 100ml',NULL,'','beleza',219.9,149.9,3200,4.9,'https://shopee.com.br',ARRAY['novo','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,6);

CREATE TABLE public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  gtm_id text,
  ga4_id text,
  head_script text,
  body_start_script text,
  body_end_script text,
  path_prefix text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

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
CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref text UNIQUE NOT NULL,
  gateway_id text,
  status text NOT NULL DEFAULT 'PENDING',
  amount_cents integer NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_slug text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_cpf text NOT NULL,
  customer_phone text NOT NULL,
  qr_code text,
  copy_paste text,
  raw_response jsonb,
  raw_webhook jsonb,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_orders_external_ref ON public.orders (external_ref);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE TRIGGER trg_orders_set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
