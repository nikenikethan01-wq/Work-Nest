export default function validateCreateJobData(data) {
  for (const [key, value] of Object.entries(data)) {
    // CHECK FOR EMPLTY VALUES
    if (!value) {
      throw new Error('Invalid data received.')
    }

    // TRIM EMPTY SPACES
    if (typeof value === 'string') data[key] = data[key].trim()

    // MAKE SURE BUDGET IS A NUMBER
    if (key === 'budget') {
      data[key] = Number(value)
    }
  }
  const { budget, status, category } = data

  // VALIDATE BUDGET
  if (!Number.isInteger(budget) || budget <= 0)
    throw new Error('Invalid budget')

  // VALIDATE STATUS
  const allowedStatus = ['live', 'completed', 'inProgress']
  if (!allowedStatus.includes(status)) throw new Error('Invalid job status')

  //VALIDATE CATEGORY
  const allowedCategories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Backend Development',
    'Graphic Design',
  ]

  if (!allowedCategories.includes(category))
    throw new Error('Invalid category selected.')

  return data
}
