
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

CREATE TRIGGER trg_orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
