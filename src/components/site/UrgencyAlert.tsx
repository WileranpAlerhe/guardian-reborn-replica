import { usePersistentCountdown } from "@/lib/useCountdown";

export function UrgencyAlert() {
  const { h, m, s } = usePersistentCountdown("urgency:home", 3 * 3600 + 15 * 60);
  return (
    <section className="px-3 pt-5 sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-primary/20 bg-warning/15 px-3 py-2.5 shadow-card">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-black leading-tight text-ink">
            Mais de 8.000 pessoas já compraram hoje.
          </div>
          <div className="text-[11px] font-semibold text-ink/70">
            Restam poucas ofertas com este desconto.
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 font-black tabular-nums">
          <span className="rounded-md bg-ink px-1.5 py-1 text-[11px] text-white">{h}</span>
          <span className="text-ink">:</span>
          <span className="rounded-md bg-ink px-1.5 py-1 text-[11px] text-white">{m}</span>
          <span className="text-ink">:</span>
          <span className="rounded-md bg-ink px-1.5 py-1 text-[11px] text-white">{s}</span>

        </div>
      </div>
    </section>
  );
}
