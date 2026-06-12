import { Eyebrow } from '@/components/common/Eyebrow';

interface PageHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly right?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, right }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display mt-2 text-[32px] font-extrabold uppercase leading-none tracking-[-0.01em] text-white">
          {title}
        </h1>
      </div>
      {right && <div className="flex items-center gap-2.5 pb-0.5">{right}</div>}
    </div>
  );
}
