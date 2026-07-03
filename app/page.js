import LoginPage from './components/LoginPage';

export const revalidate = 0;

export default async function DashboardPage() {
  return (
    <main className="min-h-screen px-4 md:px-8 py-10 max-w-7xl mx-auto">
      <LoginPage />
    </main>
  );
}
