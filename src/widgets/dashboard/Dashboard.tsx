'use client';

import { AuthGuard } from '@/widgets/auth/AuthGuard';

export const Dashboard = () => {
  return (
    <AuthGuard>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard!</p>
      </div>
    </AuthGuard>
  );
};
