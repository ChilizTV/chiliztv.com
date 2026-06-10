const GREEN = "#2dd4a4";

/**
 * Lower-block bar for {@link MatchCardDonut} when the contract is deployed
 * but no pool exists yet (`distribution.source === 'empty'`). Dashed empty
 * pool bar + green "set the opening price" copy — pairs with the magnetic
 * "Be first" stake-zone rendered below it by the parent card.
 */
export function BeFirstBar({ marketLabel }: { marketLabel: string }) {
    return (
        <div className="flex flex-1 flex-col justify-end gap-2 border-t border-[#1A1A1A] pt-3 pb-1">
            <div className="flex h-[5px] w-full overflow-hidden rounded-full border border-dashed border-[#2A2A2A]" />
            <div className="font-mono-ctv flex items-center justify-between gap-2 text-[9.5px] uppercase tracking-[0.12em]">
                <span style={{ color: GREEN }}>Empty pool · set the opening price</span>
                <span className="truncate text-white/45">{marketLabel}</span>
            </div>
        </div>
    );
}
