import { useSearchParams } from 'react-router-dom'

import {
  Search,
  Status,
  Category,
  ClearFilter,
} from '../../utils/FilterOptions'

import {
  FilterPanel,
  SearchFilter,
  StateFilter,
  CategoryFilter,
} from '../../utils/Filter'

export default function ClientJobFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const categories = searchParams.getAll('category')

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

  function handleStatusChange(value) {
    setSearchParams((prev) => {
      if (value === 'all') {
        prev.delete('status')
      } else {
        prev.set('status', value)
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

  function handleClear() {
    setSearchParams({})
  }

  return (
    <FilterPanel>
      <SearchFilter>
        <Search search={search} handleChange={handleSearchChange} />
      </SearchFilter>

      <StateFilter>
        <Status value="all" status={status} setStatus={handleStatusChange}>
          All
        </Status>

        <Status value="live" status={status} setStatus={handleStatusChange}>
          Live
        </Status>

        <Status
          value="in_progress"
          status={status}
          setStatus={handleStatusChange}
        >
          In Progress
        </Status>

        <Status
          value="completed"
          status={status}
          setStatus={handleStatusChange}
        >
          Completed
        </Status>
      </StateFilter>

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
