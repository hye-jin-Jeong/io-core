import { useState } from 'react'

export const useAuthValidation = () => {
  const [isValid, setIsValid] = useState(false)

  const validateAuth = (token: string) => {
    // Common validation logic
    setIsValid(!!token)
  }

  return { isValid, validateAuth }
}