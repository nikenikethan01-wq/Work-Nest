export default function validateRegisterForm(formData) {
  // CHECK IF BOTH PASSWORDS MATCH
  if (formData.password !== formData.confirmPassword) {
    throw new Error('Passwords do not match.')
  }
  // CHECK FOR EMPTY VALES OR INVALID TYPES
  // Common fields
  if (
    !formData.role ||
    typeof formData.role !== 'string' ||
    !formData.fullName ||
    typeof formData.fullName !== 'string' ||
    !formData.email ||
    typeof formData.email !== 'string' ||
    !formData.password ||
    typeof formData.password !== 'string'
  ) {
    throw new Error('Field is empty or invalid format.')
  }

  // Client fields
  if (formData.role === 'client') {
    if (
      !formData.company ||
      typeof formData.company !== 'string' ||
      !formData.clientLocation ||
      typeof formData.clientLocation !== 'string' ||
      !formData.description ||
      typeof formData.description !== 'string'
    ) {
      throw new Error('Field is empty or invalid format.')
    }
  }

  // Freelancer fields
  if (formData.role === 'freelancer') {
    if (
      !formData.professionalTitle ||
      typeof formData.professionalTitle !== 'string' ||
      !formData.skills ||
      typeof formData.skills !== 'string' ||
      !formData.experience ||
      !formData.hourlyRate ||
      !formData.bio ||
      typeof formData.bio !== 'string' ||
      !formData.freelancerLocation ||
      typeof formData.freelancerLocation !== 'string'
    ) {
      throw new Error('Field is empty or invalid format.')
    }
  }
  const dataToSend = {
    role: formData.role.trim().toLowerCase(),
    name: formData.fullName.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  }
  if (formData.role === 'client') {
    dataToSend.company = formData.company.trim()
    dataToSend.clientLocation = formData.clientLocation.trim()
    dataToSend.description = formData.description.trim()
  }

  if (formData.role === 'freelancer') {
    dataToSend.professionalTitle = formData.professionalTitle.trim()
    dataToSend.skills = formData.skills.trim()
    dataToSend.experience = formData.experience.trim()
    dataToSend.hourlyRate = formData.hourlyRate.trim()
    dataToSend.bio = formData.bio.trim()
    dataToSend.freelancerLocation = formData.freelancerLocation.trim()
  }

  return dataToSend
}
