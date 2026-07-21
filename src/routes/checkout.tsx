import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  MapPin,
  QrCode,
  ShieldCheck,
  Tag,
  Truck,
  User,
  Copy,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import {
  createCartPixOrderFn,
  getOrderStatusFn,
  validateCouponFn,
} from "@/lib/checkout.functions";
import { track } from "@/lib/tracking";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout Seguro | PratiHome" },
      { name: "description", content: "Finalize sua compra com segurança. Pix com 5% OFF, frete calculado por CEP." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

type Step = "identify" | "shipping" | "payment" | "pix";
type ShippingOption = { id: string; carrier: string; price: number; etaDays: string };

function CheckoutPage() {
  const { items, subtotal, savings, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identify");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", cpf: "", phone: "" });
  const [address, setAddress] = useState({
    cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", uf: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepDone, setCepDone] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingId, setShippingId] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountCents: number; message: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [pix, setPix] = useState<{ qr: string; code: string; ref: string; amount: number } | null>(null);

  const selectedShipping = shippingOptions.find((s) => s.id === shippingId) ?? null;
  const shippingCents = selectedShipping ? Math.round(selectedShipping.price * 100) : 0;
  const subtotalCents = Math.round(subtotal * 100);
  const discountCents = coupon?.discountCents ?? 0;
  const pixExtraDiscount = Math.round(subtotalCents * 0.05); // 5% Pix
  const totalCents = Math.max(0, subtotalCents + shippingCents - discountCents - pixExtraDiscount);

  const steps: { key: Step; label: string; icon: typeof User }[] = [
    { key: "identify", label: "Identificação", icon: User },
    { key: "shipping", label: "Entrega", icon: Truck },
    { key: "payment", label: "Pagamento", icon: CreditCard },
  ];
  const stepIdx = Math.max(0, steps.findIndex((s) => s.key === step));

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setForm((f) => ({
          ...f,
          email: f.email || data.user!.email || "",
          name: f.name || (data.user!.user_metadata?.full_name as string) || "",
        }));
      }
    });
  }, []);

  // Ao mudar de etapa, sempre rolar para o topo do checkout
  useEffect(() => {
    setError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [step]);



  // Poll PIX
  useEffect(() => {
    if (step !== "pix" || !pix?.ref) return;
    let stopped = false;
    let handle: number | null = null;
    const tick = async () => {
      if (stopped) return;
      try {
        const res = await getOrderStatusFn({ data: { externalRef: pix.ref } });
        if (res.ok && res.status === "PAID") {
          clear();
          navigate({ to: "/pagamento-aprovado", search: { ref: pix.ref } });
          return;
        }
      } catch { /* ignore */ }
      handle = window.setTimeout(tick, 3500) as unknown as number;
    };
    tick();
    return () => { stopped = true; if (handle) window.clearTimeout(handle); };
  }, [step, pix?.ref, navigate, clear]);

  const lookupCep = async (digits: string) => {
    if (digits.length !== 8) return;
    setCepLoading(true); setCepError(null); setCepDone(false);
    setShippingOptions([]); setShippingId(null);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const j = await r.json();
      if (j?.erro) { setCepError("CEP não encontrado."); setCepLoading(false); return; }
      setAddress((a) => ({
        ...a,
        street: j.logradouro || a.street,
        neighborhood: j.bairro || a.neighborhood,
        city: j.localidade || a.city,
        uf: j.uf || a.uf,
      }));
      const opts = generateShippingOptions(digits, subtotal);
      setShippingOptions(opts);
      setShippingId(opts[0]?.id ?? null);
      setCepDone(true);
    } catch {
      setCepError("Não foi possível consultar o CEP.");
    }
    setCepLoading(false);
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const res = await validateCouponFn({ data: { code, subtotalCents, shippingCents } });
    if (res.ok) {
      setCoupon({ code: res.code, discountCents: res.discountCents, message: res.message });
      setCouponMsg(res.message);
      track("coupon_applied", { code });
    } else {
      setCoupon(null);
      setCouponMsg(res.message);
    }
    setCouponLoading(false);
  };
  const removeCoupon = () => { setCoupon(null); setCouponInput(""); setCouponMsg(null); };

  const validateIdentify = () => {
    if (form.name.trim().length < 3) return "Digite seu nome completo";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "E-mail inválido";
    if (form.cpf.replace(/\D/g, "").length !== 11) return "CPF inválido";
    if (form.phone.replace(/\D/g, "").length < 10) return "Telefone inválido";
    return null;
  };
  const validateShipping = () => {
    if (address.cep.replace(/\D/g, "").length !== 8) return "CEP inválido";
    if (!address.street.trim() || !address.number.trim() || !address.city.trim() || !address.uf.trim())
      return "Preencha o endereço";
    if (!selectedShipping) return "Escolha uma opção de frete";
    return null;
  };

  const goShipping = () => {
    const err = validateIdentify();
    if (err) return setError(err);
    setError(null); setStep("shipping");
  };
  const goPayment = () => {
    const err = validateShipping();
    if (err) return setError(err);
    setError(null); setStep("payment");
  };

  const submitPix = async () => {
    setError(null);
    const err = validateIdentify() || validateShipping();
    if (err) return setError(err);
    setLoading(true);
    try {
      const res = await createCartPixOrderFn({
        data: {
          items: items.map((i) => ({
            productId: i.id,
            productName: i.name,
            productImage: i.image,
            quantity: i.quantity,
            unitPriceCents: Math.round(i.price * 100),
            variant: i.variant,
          })),
          subtotalCents,
          shippingCents,
          shippingMethod: selectedShipping ? `${selectedShipping.carrier} · ${selectedShipping.etaDays} dias` : undefined,
          discountCents: discountCents + pixExtraDiscount,
          couponCode: coupon?.code,
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
          userId: userId ?? undefined,
        },
      });
      if (!res.ok) { setError(res.message); setLoading(false); return; }
      setPix({ qr: res.qrCodeImage, code: res.copyPaste, ref: res.externalRef, amount: res.amountCents });
      setStep("pix");
      track("pix_generated", { order_ref: res.externalRef, value: res.amountCents / 100 });
    } catch {
      setError("Falha ao gerar PIX. Tente novamente.");
    }
    setLoading(false);
  };

  // Empty cart guard (only pre-pix)
  if (items.length === 0 && step !== "pix") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-muted">
            <QrCode className="h-9 w-9 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-ink">Seu carrinho está vazio</h1>
          <p className="mt-2 text-sm text-muted-foreground">Adicione produtos para finalizar sua compra.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-cta px-6 py-3 text-sm font-black uppercase text-cta-foreground shadow-cta hover:bg-cta/90">
            Voltar às ofertas
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar às compras
        </Link>

        {/* Stepper */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const done = i < stepIdx || step === "pix";
              const active = i === stepIdx && step !== "pix";
              return (
                <div key={s.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black ${
                      done ? "bg-success text-white" : active ? "bg-primary text-primary-foreground shadow-brand" : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`mt-1 text-[10.5px] font-bold ${active ? "text-primary" : done ? "text-success" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${done ? "bg-success" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive">
                {error}
              </div>
            )}

            {step === "identify" && (
              <Card title="1. Identificação" icon={User}>
                {!userId && (
                  <div className="mb-3 flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Já tem conta?</span>
                    <Link to="/auth" search={{ redirect: "/checkout" }} className="font-black text-primary hover:underline">Fazer login</Link>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nome completo">
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Como no documento" className={inputCls} autoComplete="name" />
                  </Field>
                  <Field label="CPF">
                    <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" maxLength={14} className={inputCls} />
                  </Field>
                  <Field label="E-mail">
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" className={inputCls} autoComplete="email" />
                  </Field>
                  <Field label="Celular">
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" maxLength={16} className={inputCls} />
                  </Field>
                </div>
                <Actions onNext={goShipping} nextLabel="Ir para entrega" />
              </Card>
            )}

            {step === "shipping" && (
              <>
                <Card title="2. Endereço de entrega" icon={MapPin}>
                  <div className="grid gap-3">
                    <Field label="CEP">
                      <div className="flex items-center gap-2">
                        <input
                          value={address.cep}
                          onChange={(e) => {
                            const v = maskCEP(e.target.value);
                            setAddress({ ...address, cep: v });
                            const d = v.replace(/\D/g, "");
                            if (d.length === 8) lookupCep(d);
                            else { setCepDone(false); setShippingOptions([]); setShippingId(null); }
                          }}
                          placeholder="00000-000" maxLength={9} className={inputCls + " max-w-[180px]"}
                        />
                        {cepLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      </div>
                      {cepError && <p className="mt-1 text-[11px] font-semibold text-destructive">{cepError}</p>}
                    </Field>
                    {cepDone && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Rua / Avenida">
                          <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Número">
                          <input value={address.number} onChange={(e) => setAddress({ ...address, number: e.target.value })} placeholder="123" className={inputCls} />
                        </Field>
                        <Field label="Complemento">
                          <input value={address.complement} onChange={(e) => setAddress({ ...address, complement: e.target.value })} placeholder="Apto (opcional)" className={inputCls} />
                        </Field>
                        <Field label="Bairro">
                          <input value={address.neighborhood} onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Cidade">
                          <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="UF">
                          <input value={address.uf} onChange={(e) => setAddress({ ...address, uf: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} className={inputCls} />
                        </Field>
                      </div>
                    )}
                  </div>
                </Card>

                {shippingOptions.length > 0 && (
                  <Card title="Forma de envio" icon={Truck}>
                    <div className="space-y-2">
                      {shippingOptions.map((opt) => (
                        <RadioRow
                          key={opt.id}
                          checked={shippingId === opt.id}
                          onClick={() => setShippingId(opt.id)}
                          title={opt.carrier}
                          desc={`Entrega em ${opt.etaDays} dias úteis`}
                          price={opt.price === 0 ? "Grátis" : brl(opt.price)}
                        />
                      ))}
                    </div>
                  </Card>
                )}

                <Actions onBack={() => setStep("identify")} onNext={goPayment} nextLabel="Ir para pagamento" />
              </>
            )}

            {step === "payment" && (
              <>
                <Card title="3. Pagamento via PIX" icon={QrCode}>
                  <div className="rounded-2xl bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <QrCode className="h-8 w-8 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-black text-ink">PIX — 5% de desconto instantâneo</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ao confirmar, você recebe o QR Code para pagamento. A aprovação é imediata e o pedido é enviado no mesmo dia útil.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="rounded-2xl border border-success/30 bg-success/5 px-4 py-3 text-xs text-success">
                  <ShieldCheck className="mr-1 inline h-4 w-4" />
                  Ambiente 100% seguro. Seus dados são criptografados.
                </div>

                <Actions
                  onBack={() => setStep("shipping")}
                  onNext={submitPix}
                  nextLabel={loading ? "Gerando PIX..." : `Pagar ${brl(totalCents / 100)}`}
                  nextIcon={Lock}
                  disabled={loading}
                />
              </>
            )}

            {step === "pix" && pix && (
              <Card title="Pague com PIX" icon={QrCode}>
                <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                  {pix.qr ? (
                    <img src={pix.qr} alt="QR Code PIX" className="mx-auto h-52 w-52 rounded-xl border border-border bg-white p-2" />
                  ) : (
                    <div className="mx-auto grid h-52 w-52 place-items-center rounded-xl border border-border bg-muted text-xs text-muted-foreground">
                      QR indisponível
                    </div>
                  )}
                  <div className="space-y-3">
                    <p className="text-sm font-black text-ink">Total: {brl(pix.amount / 100)}</p>
                    <p className="text-xs text-muted-foreground">
                      Abra o app do seu banco, escolha PIX Copia e Cola e cole o código abaixo.
                    </p>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2">
                      <code className="flex-1 truncate text-[11px] text-ink">{pix.code}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(pix.code)}
                        className="rounded-md bg-ink px-3 py-1.5 text-[11px] font-black text-white"
                      >
                        <Copy className="mr-1 inline h-3 w-3" /> Copiar
                      </button>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2 text-xs font-semibold text-primary">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                      Aguardando pagamento... redirecionamento automático
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <h3 className="text-sm font-black text-ink">Resumo do pedido</h3>
              <ul className="mt-3 space-y-3 border-b border-border pb-3">
                {items.map((i) => (
                  <li key={`${i.id}::${i.variant ?? ""}`} className="flex gap-3 text-xs">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-muted">
                      <img src={i.image} alt="" className="h-full w-full object-contain p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold text-ink">{i.name}</p>
                      <p className="mt-0.5 text-muted-foreground">Qtd: {i.quantity}</p>
                    </div>
                    <div className="text-right font-black text-ink">{brl(i.price * i.quantity)}</div>
                  </li>
                ))}
              </ul>

              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Subtotal" value={brl(subtotal)} />
                {savings > 0 && <Row label="Você economizou" value={`- ${brl(savings)}`} tone="success" />}
                <Row label="Frete" value={selectedShipping ? (shippingCents === 0 ? "Grátis" : brl(shippingCents / 100)) : "Informe o CEP"} />
                {coupon && <Row label={`Cupom ${coupon.code}`} value={`- ${brl(coupon.discountCents / 100)}`} tone="success" />}
                <Row label="Desconto PIX (5%)" value={`- ${brl(pixExtraDiscount / 100)}`} tone="success" />
              </dl>

              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-xs font-bold text-muted-foreground">Total</span>
                <span className="text-2xl font-black text-ink">{brl(totalCents / 100)}</span>
              </div>

              {/* Coupon */}
              <div className="mt-4">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 font-black text-success">
                      <Tag className="h-3.5 w-3.5" /> {coupon.code}
                    </span>
                    <button onClick={removeCoupon} className="font-bold text-muted-foreground hover:text-destructive">Remover</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Cupom de desconto"
                        className="flex-1 bg-transparent text-xs uppercase outline-none"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="rounded-md bg-ink px-3 py-1.5 text-[11px] font-black text-white disabled:opacity-60"
                      >
                        {couponLoading ? "..." : "Aplicar"}
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">Ex.: PRATI10</p>
                  </>
                )}
                {couponMsg && !coupon && (
                  <p className="mt-1 text-[11px] font-semibold text-destructive">{couponMsg}</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ---- helpers ---- */
const inputCls =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Card({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-base font-black text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}
function RadioRow({ checked, onClick, title, desc, price }: { checked: boolean; onClick: () => void; title: string; desc: string; price: string }) {
  return (
    <button
      type="button" onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
    >
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-primary" : "border-muted-foreground/40"}`}>
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-ink">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className={`text-sm font-black ${price === "Grátis" ? "text-success" : "text-ink"}`}>{price}</span>
    </button>
  );
}
function Actions({ onBack, onNext, nextLabel, nextIcon: NextIcon, disabled }: { onBack?: () => void; onNext: () => void; nextLabel: string; nextIcon?: typeof User; disabled?: boolean }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      {onBack ? (
        <button onClick={onBack} className="rounded-full border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-ink">Voltar</button>
      ) : <span />}
      <button
        onClick={onNext}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-black uppercase tracking-wide text-cta-foreground shadow-cta transition hover:bg-cta/90 disabled:opacity-60"
      >
        {NextIcon && <NextIcon className="h-4 w-4" />}
        {nextLabel} →
      </button>
    </div>
  );
}
function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-bold ${tone === "success" ? "text-success" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function maskCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}
function maskCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function generateShippingOptions(cepDigits: string, subtotal: number): ShippingOption[] {
  const seed = Array.from(cepDigits).reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const rnd = seededRandom(seed);
  const round2 = (v: number) => Math.round(v * 100) / 100;
  const p1 = round2(18 + rnd() * 2);
  const p2 = round2(Math.max(p1 + 0.8, 20.8) + rnd() * (22.2 - 20.8));
  const p3 = round2(Math.max(p2 + 0.6, 22.8) + rnd() * (24 - 22.8));
  const etaPaid = () => {
    const min = 1 + Math.floor(rnd() * 3);
    const max = Math.min(3, min + (rnd() < 0.5 ? 0 : 1));
    return min === max ? `${min}` : `${min} a ${max}`;
  };
  const e1 = etaPaid(); const e2 = etaPaid(); const e3 = etaPaid();
  const maxPaidDay = Math.max(...[e1, e2, e3].map((s) => parseInt(s.split("a").pop()!.trim(), 10)));
  const pacMin = maxPaidDay + 3;
  const pacEta = `${pacMin} a ${pacMin + 2}`;
  const freePac = subtotal >= 100;
  return [
    { id: "pac", carrier: freePac ? "PAC — Frete Grátis" : "PAC Econômico", price: freePac ? 0 : round2(14 + rnd() * 4), etaDays: pacEta },
    { id: "sedex", carrier: "SEDEX", price: p1, etaDays: e1 },
    { id: "jadlog", carrier: "Jadlog", price: p2, etaDays: e2 },
    { id: "loggi", carrier: "Loggi Express", price: p3, etaDays: e3 },
  ];
}
