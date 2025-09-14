import { BoardList } from '../../domains/auth/board'
import { UserProfile } from '../../domains/auth/user'

export const AuthDashboard = () => {
  return (
    <div>
      <h1>Auth Dashboard</h1>
      <UserProfile />
      <BoardList />
    </div>
  )
}