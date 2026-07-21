import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Tag,
  Timer,
  Truck,
} from "lucide-react";
import logoAsset from "@/assets/logo-shopee-ofertas.png";
import shippingPacAsset from "@/assets/shipping-pac.png";
import shippingSedexAsset from "@/assets/shipping-sedex.png";
import shippingJadlogAsset from "@/assets/shipping-jadlog.png";
import shippingLoggiAsset from "@/assets/shipping-loggi.png";

const CARRIER_LOGOS: Record<string, string> = {
  pac: shippingPacAsset,
  sedex: shippingSedexAsset,
  jadlog: shippingJadlogAsset,
  loggi: shippingLoggiAsset,
};
import { Footer } from "@/components/site/Footer";
import { useConfig, useProductsQuery } from "@/lib/store";
import { brl } from "@/lib/format";
import { track } from "@/lib/tracking";
import { createPixOrderFn, getOrderStatusFn } from "@/lib/checkout.functions";
import { LoadingView, NotFoundView } from "./produto.$id";

export const Route = createFileRoute("/checkout/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Checkout seguro | ${params.slug}` },
      { name: "description", content: "Finalize sua compra com PIX em segundos. Pagamento 100% seguro." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
  notFoundComponent: NotFoundView,
});

type Step = "form" | "pix" | "paid";

function CheckoutPage() {
  const { slug } = Route.useParams();
  const { products, isLoading } = useProductsQuery();
  const product = useMemo(
    () => products.find((p) => (p.slug && p.slug === slug) || p.id === slug),
    [products, slug],
  );
  if (!product) {
    if (isLoading) return <LoadingView />;
    throw notFound();
  }
  return <Checkout product={product} />;
}

function Checkout({ product }: { product: NonNullable<ReturnType<typeof useProductsQuery>["products"][number]> }) {
  const navigate = useNavigate();
  const config = useConfig();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", cpf: "", phone: "" });
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    uf: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepDone, setCepDone] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [pix, setPix] = useState<{ qr: string; code: string; ref: string; amount: number } | null>(null);
  const [couponInput, setCouponInput] = useState("PRATI10");
  const [couponApplied, setCouponApplied] = useState(true);
  const [couponMsg, setCouponMsg] = useState<string | null>("Cupom aplicado: 10% OFF");
  const [quantity, setQuantity] = useState(1);

  const selectedShipping = shippingOptions.find((s) => s.id === shippingId) ?? null;
  const shippingCents = selectedShipping ? Math.round(selectedShipping.price * 100) : 0;
  const unitCents = Math.round(product.price * 100);
  const subtotalCents = unitCents * quantity;
  const pixDiscountCents = couponApplied ? Math.round(subtotalCents * 0.1) : 0;
  const totalCents = subtotalCents + shippingCents;



  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (code === "PRATI10") {
      setCouponApplied(true);
      setCouponMsg("Cupom aplicado: 10% OFF");
      track("coupon_applied", { code });
    } else {
      setCouponApplied(false);
      setCouponMsg("Cupom inválido");
    }
  };
  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponInput("");
    setCouponMsg(null);
  };

  useEffect(() => {
    track("checkout_view", { product_id: product.id, product_name: product.name, price: product.price });
  }, [product.id]);

  const lookupCep = async (digits: string) => {
    if (digits.length !== 8) return;
    setCepLoading(true);
    setCepError(null);
    setCepDone(false);
    setShippingOptions([]);
    setShippingId(null);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const j = await r.json();
      if (j?.erro) {
        setCepError("CEP não encontrado. Confira os números e tente novamente.");
        setCepLoading(false);
        return;
      }
      setAddress((a) => ({
        ...a,
        street: j.logradouro || a.street,
        neighborhood: j.bairro || a.neighborhood,
        city: j.localidade || a.city,
        uf: j.uf || a.uf,
      }));
      const opts = generateShippingOptions(digits);
      setShippingOptions(opts);
      setShippingId(opts[0]?.id ?? null);
      setCepDone(true);
    } catch {
      setCepError("Não foi possível consultar o CEP agora. Verifique sua conexão.");
    }
    setCepLoading(false);
  };

  const validateCpf = (masked: string) => {
    const d = masked.replace(/\D/g, "");
    if (d.length !== 11) {
      setCpfError("CPF incompleto — digite os 11 números.");
      return false;
    }
    if (!isValidCPF(d)) {
      setCpfError("CPF inválido. Confira os números digitados.");
      return false;
    }
    setCpfError(null);
    return true;
  };


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("E-mail inválido");
    if (!validateCpf(form.cpf)) return setError("CPF inválido");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("Telefone inválido");
    if (form.name.trim().length < 3) return setError("Digite seu nome completo");
    if (address.cep.replace(/\D/g, "").length !== 8) return setError("Digite um CEP válido");
    if (!address.street.trim() || !address.number.trim() || !address.city.trim() || !address.uf.trim())
      return setError("Preencha o endereço de entrega");
    if (!selectedShipping) return setError("Escolha uma opção de frete");

    setLoading(true);
    try {
      const res = await createPixOrderFn({
        data: {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          amountCents: totalCents,
          customer: {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            cpf: form.cpf.replace(/\D/g, ""),
            phone: form.phone.replace(/\D/g, ""),
          },
          address: {
            cep: address.cep.replace(/\D/g, ""),
            street: address.street.trim(),
            number: address.number.trim(),
            complement: address.complement.trim() || undefined,
            neighborhood: address.neighborhood.trim(),
            city: address.city.trim(),
            uf: address.uf.trim().toUpperCase(),
          },
        },
      });
      if (!res.ok) {
        setError(res.message);
        setLoading(false);
        return;
      }
      setPix({ qr: res.qrCodeImage, code: res.copyPaste, ref: res.externalRef, amount: res.amountCents });
      setStep("pix");
      track("pix_generated", {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        order_ref: res.externalRef,
      });
    } catch (err) {
      setError("Falha ao gerar PIX. Tente novamente.");
    }
    setLoading(false);
  };

  // Poll payment status
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    if (step !== "pix" || !pix?.ref) return;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const res = await getOrderStatusFn({ data: { externalRef: pix.ref } });
        if (res.ok && res.status === "PAID") {
          setStep("paid");
          navigate({
            to: "/pagamento-aprovado",
            search: { ref: pix.ref },
          });
          return;
        }
      } catch {
        /* ignore */
      }
      pollRef.current = window.setTimeout(tick, 3500) as unknown as number;
    };
    tick();
    return () => {
      stopped = true;
      if (pollRef.current) window.clearTimeout(pollRef.current);
    };
  }, [step, pix?.ref, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 via-background to-background">
      {/* Slim header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoAsset} alt={config.brandName} className="h-11 w-auto object-contain" />
          </Link>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success">
            <Lock className="h-3.5 w-3.5" /> Checkout Seguro SSL
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        <section>
          {step === "form" && (
            <>
              <button
                onClick={() => window.history.back()}
                className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </button>
              <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                    1
                  </span>
                  <h2 className="text-base font-black text-ink">Seus dados</h2>
                </div>
                <form onSubmit={onSubmit} className="space-y-3">
                  <Field label="Nome completo">
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nome completo"
                      className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="E-mail">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@gmail.com"
                      className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      autoComplete="email"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CPF">
                      <input
                        required
                        inputMode="numeric"
                        value={form.cpf}
                        onChange={(e) => {
                          const v = maskCPF(e.target.value);
                          setForm({ ...form, cpf: v });
                          if (cpfError) setCpfError(null);
                          if (v.replace(/\D/g, "").length === 11) validateCpf(v);
                        }}
                        onBlur={() => form.cpf && validateCpf(form.cpf)}
                        placeholder="000.000.000-00"
                        className={`w-full rounded-xl border bg-white px-2.5 py-2.5 text-[13px] tracking-tight tabular-nums text-ink outline-none focus:ring-2 ${
                          cpfError
                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                            : "border-border focus:border-primary focus:ring-primary/20"
                        }`}
                        maxLength={14}
                      />
                      {cpfError && (
                        <p className="mt-1 text-[11px] font-semibold text-destructive">{cpfError}</p>
                      )}
                    </Field>

                    <Field label="Celular">
                      <input
                        required
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
                        placeholder="(11) 90000-0000"
                        className="w-full rounded-xl border border-border bg-white px-2.5 py-2.5 text-[13px] tracking-tight tabular-nums text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"

                        maxLength={16}
                      />
                    </Field>
                  </div>

                  {/* Endereço de entrega */}
                  <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-black text-ink">Endereço de entrega</span>
                    </div>
                    <Field label="CEP">
                      <div className="flex items-center gap-2">
                        <input
                          required
                          inputMode="numeric"
                          value={address.cep}
                          onChange={(e) => {
                            const v = maskCEP(e.target.value);
                            setAddress({ ...address, cep: v });
                            const digits = v.replace(/\D/g, "");
                            if (digits.length !== 8) {
                              setCepDone(false);
                              setCepError(null);
                              setShippingOptions([]);
                              setShippingId(null);
                            } else {
                              lookupCep(digits);
                            }
                          }}
                          onBlur={() => {
                            const digits = address.cep.replace(/\D/g, "");
                            if (digits.length === 8 && !cepDone && !cepLoading) lookupCep(digits);
                          }}
                          placeholder="00000-000"
                          className={`w-full rounded-xl border bg-white px-2.5 py-2.5 text-[13px] tracking-tight tabular-nums text-ink outline-none focus:ring-2 ${
                            cepError
                              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                              : "border-border focus:border-primary focus:ring-primary/20"
                          }`}
                          maxLength={9}
                        />
                        {cepLoading && (
                          <span className="whitespace-nowrap text-[11px] font-semibold text-muted-foreground">
                            Buscando...
                          </span>
                        )}
                        <a
                          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                          target="_blank"
                          rel="noreferrer"
                          className="self-center text-[11px] font-semibold text-primary hover:underline"
                        >
                          Não sei meu CEP
                        </a>
                      </div>
                      {cepError && (
                        <p className="mt-1 text-[11px] font-semibold text-destructive">{cepError}</p>
                      )}
                    </Field>

                    {cepDone && (
                      <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1">
                        <Field label="Rua / Logradouro">
                          <input
                            required
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            title={address.street}
                            className="w-full truncate rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </Field>
                        <div className="grid grid-cols-[110px_1fr] gap-3">
                          <Field label="Número">
                            <input
                              required
                              value={address.number}
                              onChange={(e) => setAddress({ ...address, number: e.target.value })}
                              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </Field>
                          <Field label="Complemento (opcional)">
                            <input
                              value={address.complement}
                              onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                              placeholder="Apto, bloco, referência..."
                              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </Field>
                        </div>
                        <Field label="Bairro">
                          <input
                            required
                            value={address.neighborhood}
                            onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </Field>
                        <div className="grid grid-cols-[1fr_90px] gap-3">
                          <Field label="Cidade">
                            <input
                              required
                              value={address.city}
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </Field>
                          <Field label="UF">
                            <input
                              required
                              value={address.uf}
                              onChange={(e) => setAddress({ ...address, uf: e.target.value.toUpperCase().slice(0, 2) })}
                              maxLength={2}
                              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm uppercase text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </Field>
                        </div>


                        {/* Opções de frete */}
                        <div className="pt-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="text-sm font-black text-ink">Opções de entrega</span>
                          </div>
                          <div className="space-y-3">
                            {shippingOptions.map((opt) => {
                              const active = shippingId === opt.id;
                              return (
                                <label
                                  key={opt.id}
                                  className={`grid cursor-pointer grid-cols-[auto_auto_1fr_auto] items-center gap-x-2.5 gap-y-1 rounded-xl border p-3.5 transition sm:gap-x-3 ${
                                    active
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                      : "border-border bg-white hover:border-primary/40"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="shipping"
                                    className="col-start-1 row-start-1 accent-primary"
                                    checked={active}
                                    onChange={() => setShippingId(opt.id)}
                                  />
                                  <div className="col-start-2 row-start-1 flex h-8 w-14 items-center justify-center overflow-hidden rounded-md bg-white sm:h-9 sm:w-16">
                                    <img
                                      src={CARRIER_LOGOS[opt.id]}
                                      alt={opt.carrier}
                                      className="max-h-full max-w-full object-contain"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  </div>
                                  <div className="col-start-3 row-start-1 text-sm font-bold text-ink">
                                    {opt.carrier}
                                  </div>
                                  <div className="col-start-4 row-start-1 whitespace-nowrap text-right text-sm font-black">
                                    {opt.price === 0 ? (
                                      <span className="text-success">Grátis</span>
                                    ) : (
                                      <span className="text-ink">{brl(opt.price)}</span>
                                    )}
                                  </div>
                                  <div className="col-start-3 col-end-5 row-start-2 text-xs text-muted-foreground">
                                    Entrega em {opt.etaDays} {Number(opt.etaDays) === 1 ? "dia útil" : "dias úteis"}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-black uppercase tracking-wide text-primary-foreground shadow-cta transition hover:bg-primary/90 disabled:opacity-70"
                  >
                    {loading ? "Gerando PIX..." : "Gerar PIX agora"}

                  </button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Ambiente 100% seguro. Seus dados são criptografados.
                  </p>
                </form>
              </div>
            </>
          )}

          {step === "pix" && pix && (
            <PixModal
              pix={pix}
              product={product}
              brandName={config.brandName}
              logoUrl={logoAsset}
              onExpire={() => {
                setPix(null);
                setStep("form");
                setError("O PIX expirou. Gere um novo para continuar.");
              }}
            />
          )}

        </section>

        {/* Order summary */}
        <aside className="mt-5 lg:mt-0">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-4 shadow-card">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Resumo do pedido
            </div>
            <div className="mt-3 flex gap-3">
              <img src={product.image} alt="" className="h-16 w-16 rounded-xl border border-border object-contain p-1" />
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-sm font-bold text-ink">{product.name}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10.5px] font-semibold text-muted-foreground">Qtd</span>
                  <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-7 w-7 text-sm font-black text-ink hover:bg-muted disabled:opacity-40"
                      disabled={quantity <= 1}
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="min-w-[28px] px-1 text-center text-xs font-black tabular-nums text-ink">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="h-7 w-7 text-sm font-black text-ink hover:bg-muted disabled:opacity-40"
                      disabled={quantity >= 10}
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-ink">{brl((unitCents * quantity) / 100)}</div>
                {quantity > 1 && (
                  <div className="text-[10px] text-muted-foreground">{brl(product.price)} un.</div>
                )}
              </div>
            </div>
            <div className="my-3 border-t border-dashed border-border" />
            <Row label={`Subtotal (${quantity} ${quantity > 1 ? "itens" : "item"})`} value={brl(subtotalCents / 100)} />

            <Row
              label={selectedShipping ? `Frete (${selectedShipping.carrier})` : "Frete"}
              value={
                !selectedShipping ? (
                  <span className="text-muted-foreground">A calcular</span>
                ) : selectedShipping.price === 0 ? (
                  <span className="text-success">Grátis</span>
                ) : (
                  brl(selectedShipping.price)
                )
              }
            />
            {couponApplied && (
              <>
                <Row
                  label="Desconto PIX já aplicado"
                  value={
                    <span className="font-semibold text-success">
                      -{brl(pixDiscountCents / 100)}
                    </span>
                  }
                />
              </>
            )}

            {/* Cupom */}
            <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-primary">
                <Tag className="h-3.5 w-3.5" /> Cupom de desconto
              </div>
              {!couponApplied ? (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponMsg(null);
                      }}
                      placeholder="PRATI10"
                      className="min-w-0 flex-1 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold uppercase text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="rounded-xl bg-primary px-3 py-2 text-[11px] font-black uppercase text-primary-foreground hover:bg-primary/90"
                    >
                      Aplicar
                    </button>
                  </div>
                  <div className="mt-1.5 text-[10.5px] font-semibold text-muted-foreground">
                    O cupom <b className="text-primary">PRATI10</b> (10% OFF na 1ª compra) já está aplicado no preço do produto.
                  </div>
                  {couponMsg && (
                    <div className="mt-1 text-[10.5px] font-bold text-destructive">{couponMsg}</div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> PRATI10 — já aplicado no preço

                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[10.5px] font-bold text-muted-foreground underline hover:text-destructive"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            <div className="my-3 border-t border-border" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-ink">Total</span>
              <div className="text-right">
                <div className="text-xl font-black text-primary">{brl(totalCents / 100)}</div>
                <div className="text-[10px] font-semibold text-success">à vista no PIX</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11px]">
              <TrustLine icon={<ShieldCheck className="h-3.5 w-3.5" />} text="Compra protegida — receba ou seu dinheiro de volta" />
              <TrustLine icon={<Lock className="h-3.5 w-3.5" />} text="Dados criptografados (SSL 256 bits)" />
              <TrustLine icon={<Timer className="h-3.5 w-3.5" />} text="Aprovação em segundos após o PIX" />
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

const PIX_EXPIRES_SECONDS = 15 * 60;

function PixModal({
  pix,
  product,
  brandName,
  logoUrl,
  onExpire,
}: {
  pix: { qr: string; code: string; ref: string; amount: number };
  product: { id: string; name: string; price: number; image?: string };
  brandName: string;
  logoUrl: string;
  onExpire: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PIX_EXPIRES_SECONDS);
  const [qrSrc, setQrSrc] = useState<string>(pix.qr || "");
  const codeRef = useRef<HTMLInputElement>(null);

  // Generate QR from copy-paste code if the gateway didn't return an image
  useEffect(() => {
    if (pix.qr) {
      setQrSrc(pix.qr);
      return;
    }
    if (!pix.code) return;
    let cancelled = false;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(pix.code, { margin: 1, width: 320 });
        if (!cancelled) setQrSrc(url);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pix.qr, pix.code]);


  // Countdown
  useEffect(() => {
    const iv = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(iv);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) onExpire();
  }, [secondsLeft, onExpire]);

  // Lock body scroll while the modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const urgent = secondsLeft <= 120;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pix.code);
    } catch {
      /* fallback below */
    }
    try {
      codeRef.current?.focus();
      codeRef.current?.select();
      document.execCommand?.("copy");
    } catch {
      /* ignore */
    }
    setCopied(true);
    track("pix_copy", { product_id: product.id, order_ref: pix.ref });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-y-auto">
      {/* Modal header — logo + brand */}
      <div className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain" />
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10.5px] font-black text-success">
            <Lock className="h-3 w-3" /> Pagamento seguro
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black tabular-nums ${
              urgent ? "bg-destructive/10 text-destructive animate-pulse" : "bg-warning/15 text-primary"
            }`}
          >
            <Timer className="h-3 w-3" />
            {mm}:{ss}
          </div>
        </div>
        <div className="mx-auto flex max-w-lg items-baseline justify-between gap-3 px-4 pb-3">
          <div>
            <div className="text-base font-black text-ink">Pague com PIX</div>
            <div className="text-[11px] text-muted-foreground">Confirmação automática após o pagamento</div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-5 pb-10">
        {/* Product card */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="h-16 w-16 flex-shrink-0 rounded-xl border border-border object-contain p-1"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-sm font-bold text-ink">{product.name}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">Quantidade: 1 · Pedido {pix.ref.slice(-8)}</div>
          </div>
        </div>

        {/* Amount */}
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 text-center shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Valor a pagar
          </div>
          <div className="mt-1 text-3xl font-black text-primary">{brl(pix.amount / 100)}</div>
        </div>

        {/* QR Code */}
        <div className="mt-4 flex flex-col items-center">
          <div className="rounded-2xl border-2 border-primary/20 bg-white p-3 shadow-sm">
            {qrSrc ? (
              <img src={qrSrc} alt="QR Code PIX" className="h-56 w-56 object-contain" />
            ) : (
              <div className="grid h-56 w-56 place-items-center text-muted-foreground">
                <QrCode className="h-12 w-12 animate-pulse" />
              </div>
            )}
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground">
            Escaneie o QR Code com o app do seu banco
          </div>
        </div>


        {/* Copia e cola */}
        <div className="mt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            PIX Copia e Cola
          </label>
          <input
            ref={codeRef}
            readOnly
            value={pix.code}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            className="mt-1 w-full cursor-text overflow-x-auto rounded-xl border border-border bg-muted/40 px-3 py-3 font-mono text-[11px] text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-[10.5px] text-muted-foreground">Toque no campo para selecionar e copiar manualmente.</p>
          <button
            onClick={copy}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black uppercase tracking-wide shadow-cta transition ${
              copied
                ? "bg-success text-success-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Código copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar código PIX
              </>
            )}
          </button>
        </div>



        {/* Steps */}
        <ol className="mt-5 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm text-ink shadow-card">
          <li className="flex gap-2">
            <span className="font-black text-primary">1.</span> Abra o app do seu banco
          </li>
          <li className="flex gap-2">
            <span className="font-black text-primary">2.</span> Escolha pagar com <b>PIX</b> (QR Code ou copia e cola)
          </li>
          <li className="flex gap-2">
            <span className="font-black text-primary">3.</span> Confirme o valor de <b>{brl(pix.amount / 100)}</b>
          </li>
          <li className="flex gap-2">
            <span className="font-black text-primary">4.</span> Pronto! A confirmação aparece aqui automaticamente
          </li>
        </ol>

        {/* Waiting indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-warning/10 px-3 py-3 text-xs font-semibold text-primary">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          Aguardando pagamento... você será redirecionado automaticamente
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[10.5px]">
          <TrustPill icon={<Lock className="h-3.5 w-3.5" />} label="Ambiente seguro" />
          <TrustPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Dados protegidos" />
          <TrustPill icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Aprovação em segundos" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function TrustLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 text-ink/80">
      <span className="mt-0.5 text-success">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 py-1.5 text-center font-semibold text-ink">
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}
function isValidCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i], 10) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === parseInt(d[9], 10) && calc(10) === parseInt(d[10], 10);
}

function maskCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

type ShippingOption = {
  id: string;
  carrier: string;
  price: number;
  etaDays: string;
};

// Deterministic pseudo-random per CEP so a user sees stable prices while typing/refreshing
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateShippingOptions(cepDigits: string): ShippingOption[] {
  const seed = Array.from(cepDigits).reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const rnd = seededRandom(seed);
  const round2 = (v: number) => Math.round(v * 100) / 100;

  // 3 pagos, espaçados em faixas distintas para nunca ficarem próximos:
  // faixa 1: 18.00 – 20.00
  // faixa 2: 20.80 – 22.20 (gap mínimo ~0.8 da faixa 1)
  // faixa 3: 22.80 – 24.00 (gap mínimo ~0.6 da faixa 2)
  const p1 = round2(18 + rnd() * 2);
  const p2 = round2(Math.max(p1 + 0.8, 20.8) + rnd() * (22.2 - 20.8));
  const p3 = round2(Math.max(p2 + 0.6, 22.8) + rnd() * (24 - 22.8));

  // Prazos: pagos variam de 1 a 3 dias (min/max coerentes por opção).
  const etaPaid = (): string => {
    const min = 1 + Math.floor(rnd() * 3); // 1..3
    const max = Math.min(3, min + (rnd() < 0.5 ? 0 : 1));
    return min === max ? `${min}` : `${min} a ${max}`;
  };
  const e1 = etaPaid();
  const e2 = etaPaid();
  const e3 = etaPaid();

  // PAC grátis: 3 dias a mais que o maior prazo dos pagos.
  const maxPaidDay = Math.max(
    ...[e1, e2, e3].map((s) => parseInt(s.split("a").pop()!.trim(), 10)),
  );
  const pacMin = maxPaidDay + 3;
  const pacMax = pacMin + 2;
  const pacEta = `${pacMin} a ${pacMax}`;

  return [
    { id: "pac", carrier: "PAC", price: 0, etaDays: pacEta },
    { id: "sedex", carrier: "SEDEX", price: p1, etaDays: e1 },
    { id: "jadlog", carrier: "Jadlog", price: p2, etaDays: e2 },
    { id: "loggi", carrier: "Loggi", price: p3, etaDays: e3 },
  ];
}

