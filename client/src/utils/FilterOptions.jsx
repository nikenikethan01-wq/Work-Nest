export function Search({ search, handleChange }) {
  return (
    <div className="filter-search">
      <span className="filter-search-icon">⌕</span>

      <input
        type="search"
        placeholder="Search posted jobs..."
        aria-label="Search posted jobs"
        onChange={handleChange}
        value={search}
      />
    </div>
  )
}

export function Status({ children, value, status, setStatus }) {
  return (
    <label className="filter-option">
      <input
        type="radio"
        name="job-status"
        value={value}
        checked={status === value}
        onChange={() => setStatus(value)}
      />
      <span className="filter-option-label">{children}</span>
    </label>
  )
}

export function Category({
  children,
  value,
  handleCategoryChange,
  categories,
}) {
  return (
    <button
      type="button"
      onClick={() => handleCategoryChange(value)}
      className={`category-btn ${categories.includes(value) ? 'active' : ''}`}
    >
      {children}
    </button>
  )
}

export function ClearFilter({ children, handleClear }) {
  return (
    <button className="clear-filter-btn" onClick={handleClear}>
      {children}
    </button>
  )
}

export function MinBudget({ value, handleMinBudgetChange }) {
  return (
    <input
      className="price-input"
      type="number"
      placeholder="Min Budget"
      value={value}
      onChange={handleMinBudgetChange}
    />
  )
}

export function MaxBudget({ value, handleMaxBudgetChange }) {
  return (
    <input
      className="price-input"
      type="number"
      placeholder="Max Budget"
      value={value}
      onChange={handleMaxBudgetChange}
    />
  )
}
