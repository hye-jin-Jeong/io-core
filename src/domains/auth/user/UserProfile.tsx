import { useAuthValidation } from '../_common/hooks'

export const UserProfile = () => {
  const { isValid, validateAuth } = useAuthValidation()

  return (
    <div>
      <h2>User Profile</h2>
      {/* User profile specific logic */}
    </div>
  )
}