function sanitizeData(data) {
  for (const [key, value] of Object.entries(data)) {
    // CHECK FOR EMPLTY VALUES
    if (!value) {
      return {
        error: {
          status: 400,
          message: 'Invalid data received.',
        },
      }
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
  if (!Number.isInteger(budget) || budget <= 0) {
    return {
      error: {
        status: 400,
        message: 'Invalid budget',
      },
    }
  }

  // VALIDATE STATUS
  const allowedStatus = ['live', 'inProgress', 'completed']
  if (!allowedStatus.includes(status)) {
    return {
      error: {
        status: 400,
        message: 'Invalid job status.',
      },
    }
  }

  const allowedCategories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Backend Development',
    'Graphic Design',
  ]

  if (!allowedCategories.includes(category)) {
    return {
      error: {
        status: 400,
        message: 'Invalid category.',
      },
    }
  }
  return {
    data,
  }
}

export { sanitizeData }
