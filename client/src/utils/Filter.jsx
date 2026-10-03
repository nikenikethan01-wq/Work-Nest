export function FilterPanel({ children }) {
  return <div className="jobs-filters">{children}</div>
}

export function SearchFilter({ children }) {
  return <div className="filter-section">{children}</div>
}

export function StateFilter({ children }) {
  return (
    <div className="filter-section">
      <div className="status-scroll">{children}</div>
    </div>
  )
}

export function CategoryFilter({ children }) {
  return (
    <div className="filter-section">
      <div className="jobs-categories">{children}</div>
    </div>
  )
}

export function PriceFilter({ children }) {
  return (
    <div className="budget-filter">
      <div className="budget-inputs">{children}</div>
    </div>
  )
}
