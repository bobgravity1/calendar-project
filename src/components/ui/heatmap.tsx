export function Heatmap() {
  return (
    <div className="grid gap-4">
      <div role="img" aria-label="Activity heatmap: 0 logs over the last 18 weeks" className="grid grid-flow-col grid-cols-18 grid-rows-7 gap-1">
        {Array.from({ length: 126 }, (_, index) => (
          <span key={index} className="aspect-square rounded-xs bg-[#343842]" />
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-xs">
        <span>Less</span>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} aria-hidden="true" className="size-2 rounded-xs bg-[#343842]" />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
