interface PageHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
}

export function PageHeader({ eyebrow, title }: PageHeaderProps) {
  return (
    <div>
      <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
        <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
        {eyebrow}
      </div>
      <h1 className="font-display mt-2 text-[32px] font-extrabold uppercase leading-none tracking-[-0.01em] text-white">
        {title}
      </h1>
    </div>
  );
}
