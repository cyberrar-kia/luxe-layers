const MESSAGE = "Shop with confidence — fast, secure checkout.";

export function MarqueeBar() {
  const items = Array.from({ length: 8 }, (_, i) => <span key={i}>✦&nbsp;&nbsp;{MESSAGE}&nbsp;&nbsp;</span>);
  return (
    <div className="overflow-hidden bg-midnight py-2 text-xs font-bold tracking-wide text-lime">
      <div className="store-marquee-track flex w-max whitespace-nowrap">
        <div className="flex">{items}</div>
        <div className="flex" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  );
}
