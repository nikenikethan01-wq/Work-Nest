import { useSearchParams } from 'react-router-dom'

import {
  Search,
  Category,
  ClearFilter,
  MinBudget,
  MaxBudget,
} from '../../utils/FilterOptions'

import {
  FilterPanel,
  SearchFilter,
  CategoryFilter,
  PriceFilter,
} from '../../utils/Filter'

export default function ClientJobFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') || ''
  const categories = searchParams.getAll('category')
  const minBudget = searchParams.get('min-budget') || ''
  const maxBudget = searchParams.get('max-budget') || ''

  function handleSearchChange(ev) {
    const value = ev.currentTarget.value

    setSearchParams((prev) => {
      if (value.trim() === '') {
        prev.delete('search')
      } else {
        prev.set('search', value)
      }

      return prev
    })
  }

  function handleCategoryChange(value) {
    setSearchParams((prev) => {
      const categories = prev.getAll('category')

      if (categories.includes(value)) {
        prev.delete('category')

        categories
          .filter((category) => category !== value)
          .forEach((category) => {
            prev.append('category', category)
          })
      } else {
        prev.append('category', value)
      }

      return prev
    })
  }

  function handleMinBudgetChange(ev) {
    const value = ev.currentTarget.value

    setSearchParams((prev) => {
      if (value.trim() === '') {
        prev.delete('min-budget')
      } else {
        prev.set('min-budget', Number(value))
      }

      return prev
    })
  }

  function handleMaxBudgetChange(ev) {
    const value = ev.currentTarget.value

    setSearchParams((prev) => {
      if (value.trim() === '') {
        prev.delete('max-budget')
      } else {
        prev.set('max-budget', Number(value))
      }

      return prev
    })
  }

  function handleClear() {
    setSearchParams({})
  }

  return (
    <FilterPanel>
      <SearchFilter>
        <Search search={search} handleChange={handleSearchChange} />
      </SearchFilter>

      <PriceFilter>
        <MinBudget
          value={minBudget}
          handleMinBudgetChange={handleMinBudgetChange}
        />
        <span className="budget-separator">-</span>
        <MaxBudget
          value={maxBudget}
          handleMaxBudgetChange={handleMaxBudgetChange}
        />
      </PriceFilter>

      <CategoryFilter>
        <Category
          value="Web Development"
          categories={categories}
          handleCategoryChange={handleCategoryChange}
        >
          Web Development
        </Category>

        <Category
          value="Mobile Development"
          categories={categories}
          handleCategoryChange={handleCategoryChange}
        >
          Mobile Development
        </Category>

        <Category
          value="UI/UX Design"
          categories={categories}
          handleCategoryChange={handleCategoryChange}
        >
          UI/UX
        </Category>

        <Category
          value="Backend Development"
          categories={categories}
          handleCategoryChange={handleCategoryChange}
        >
          Backend Development
        </Category>

        <Category
          value="Graphic Design"
          categories={categories}
          handleCategoryChange={handleCategoryChange}
        >
          Graphic Design
        </Category>
      </CategoryFilter>

      <div className="filter-actions">
        <ClearFilter handleClear={handleClear}>Clear Filters</ClearFilter>
      </div>
    </FilterPanel>
  )
}
