import React from 'react';
import { db } from './firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import DashboardClient from './components/DashboardClient';

export const revalidate = 0;

export default async function DashboardPage() {
  // Server-side initial fetch is skipped — DashboardClient opens its own
  // real-time onSnapshot listeners on mount, so we simply render the shell.
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      <DashboardClient />
    </main>
  );
}
