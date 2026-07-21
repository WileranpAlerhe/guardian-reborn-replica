import { ChevronRight, Flame, Trophy, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  id?: string;
  title: string;
  icon?: "flame" | "trophy" | "sparkles";
  action?: string;
  children: ReactNode;
}

const iconMap = {
  flame: Flame,
  trophy: Trophy,
  sparkles: Sparkles,
};

export function SectionHeader({ id, title, icon = "flame", action = "Ver todos" }: {
  id?: string;
  title: string;
  icon?: keyof typeof iconMap;
  action?: string;
}) {
  const Icon = iconMap[icon];
  return (
    <div id={id} className="mb-4 flex items-end justify-between scroll-mt-24 border-b border-border pb-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-black uppercase tracking-tight text-ink sm:text-lg">{title}</h2>
          <span className="mt-0.5 block h-0.5 w-10 bg-cta" />
        </div>
      </div>
      <a href="#" className="inline-flex items-center gap-0.5 text-[11px] font-black uppercase tracking-wider text-primary hover:underline">
        {action}
        <ChevronRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export function Section({ id, title, icon, action, children }: Props) {
  return (
    <section className="px-4 pt-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeader id={id} title={title} icon={icon} action={action} />
        {children}
      </div>
    </section>
  );
}
