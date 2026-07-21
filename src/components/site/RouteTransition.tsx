import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logoAsset from "@/assets/casaprati-logo-new.png";

export function RouteTransition() {
  const isLoading = useRouterState({
    select: (s) =>
      s.isLoading || s.isTransitioning || s.status === "pending",
  });
  const [show, setShow] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (isLoading) {
      // small delay so quick navigations don't flash the overlay
      t = setTimeout(() => setShow(true), 40);
    } else {
      setShow(false);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white animate-in fade-in duration-150"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6">
        <img
          src={logoAsset}
          alt=""
          className="h-16 w-auto object-contain animate-pulse"
        />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-[loadingbar_1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>
      <style>{`
        @keyframes loadingbar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
