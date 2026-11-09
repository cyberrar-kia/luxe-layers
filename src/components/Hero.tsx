export function Hero({ businessName, tagline }: { businessName: string; tagline: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-midnight via-midnight to-midnight-2">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(198_242_78/0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
        <div className="rise max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{businessName}</h1>
          <p className="mt-4 text-lg text-stone-200">{tagline}</p>
          <a href="#products" className="btn mt-8 inline-flex">
            Shop the collection →
          </a>
        </div>
      </div>
    </div>
  );
}
