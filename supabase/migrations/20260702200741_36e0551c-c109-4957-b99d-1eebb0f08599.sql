
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read products"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial products
INSERT INTO public.products (id, name, description, image, category, old_price, price, sold, rating, affiliate_url, badges, coupon_text, active, "order") VALUES
('ar-britania-baq2200b','Ar-Condicionado Split Britânia BAQ2200B','Split parede, silencioso, controle remoto, alta eficiência energética.','/assets/product-ac-britania.png','casa',249.9,159.9,2340,4.9,'https://shopee.com.br',ARRAY['destaque','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,0),
('fone-i12','Fone Bluetooth i12 Sem Fio',NULL,'','eletronicos',89.9,49.9,10200,4.8,'https://shopee.com.br',ARRAY['mais-vendido','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,1),
('smartwatch-d20','Smartwatch D20 Y68 Relógio Inteligente',NULL,'','eletronicos',149.9,89.9,8700,4.7,'https://shopee.com.br',ARRAY['mais-vendido','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,2),
('caixa-som-bluetooth','Caixa de Som Bluetooth Portátil',NULL,'','eletronicos',199.9,139.9,6300,4.6,'https://shopee.com.br',ARRAY['oferta'],'Cupom de 10% já aplicado na 1ª compra',true,3),
('mini-liquidificador','Mini Liquidificador Portátil USB',NULL,'','casa',79.9,59.9,7100,4.7,'https://shopee.com.br',ARRAY['mais-vendido','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,4),
('tenis-casual','Tênis Casual Unissex Branco',NULL,'','moda',189.9,129.9,6400,4.8,'https://shopee.com.br',ARRAY['novo'],'Cupom de 10% já aplicado na 1ª compra',true,5),
('perfume-importado','Perfume Importado Feminino 100ml',NULL,'','beleza',219.9,149.9,3200,4.9,'https://shopee.com.br',ARRAY['novo','oferta'],'Cupom de 10% já aplicado na 1ª compra',true,6);
