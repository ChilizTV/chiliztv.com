export interface Step {
  n: string;
  title: string;
  body: React.ReactNode;
}

export function StepsList({ items }: { items: Step[] }) {
  return (
    <ol className="m-0 list-none border-t border-[#1E1E1E] p-0">
      {items.map(({ n, title, body }) => (
        <li
          key={n}
          className="grid grid-cols-[40px_1fr] items-baseline gap-4 border-b border-[#1E1E1E] py-7 sm:grid-cols-[60px_1fr] sm:gap-8"
        >
          <span className="font-mono-ctv text-[14px] font-bold tracking-[0.16em] text-[#E8001D]">
            {n}
          </span>
          <div>
            <h3
              className="font-display m-0 mb-2.5 text-[28px] font-extrabold uppercase leading-none text-white"
              style={{ letterSpacing: "-0.005em" }}
            >
              {title}
            </h3>
            <div className="max-w-145 text-[16px] font-light leading-[1.55] text-white/65">
              {body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
