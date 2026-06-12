/** Team name with its API-Football crest (plain img — external CDN, lazy). */
export function TeamLabel({ name, logo }: Readonly<{ name: string; logo: string | null }>) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" loading="lazy" className="h-4 w-4 shrink-0 object-contain" aria-hidden />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
