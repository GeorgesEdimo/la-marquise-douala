interface FilterButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

/** Reusable filter pill with aria-pressed for a11y. */
export default function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      className="filter-pill"
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
