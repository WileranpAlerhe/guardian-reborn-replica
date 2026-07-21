import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { useProductsQuery } from "@/lib/store";
import { Detail, LoadingView, NotFoundView } from "./produto.$id";

// Catch-all so the admin can change the "/produto/" segment to anything
// (e.g. /oferta/slug, /promo/slug). Product lookup uses slug || id, so
// legacy /produto/<id> URLs continue to work via the more-specific route.
export const Route = createFileRoute("/$prefix/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Oferta - ${params.slug} | Ofertas Express` },
      {
        name: "description",
        content:
          "Confira a oferta especial com cupom já aplicado, frete rápido e compra 100% segura.",
      },
      { property: "og:title", content: "Oferta imperdível | Ofertas Express" },
      {
        property: "og:description",
        content: "Cupom de 10% aplicado, envio rápido e compra segura.",
      },
    ],
  }),
  component: ProductBySlug,
  notFoundComponent: NotFoundView,
});

function ProductBySlug() {
  const { slug } = Route.useParams();
  const { products: all, isLoading } = useProductsQuery();
  const product = useMemo(
    () => all.find((p) => (p.slug && p.slug === slug) || p.id === slug),
    [all, slug],
  );
  if (!product) {
    if (isLoading) return <LoadingView />;
    throw notFound();
  }
  return <Detail product={product} all={all} />;
}
