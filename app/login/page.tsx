import { cookies } from 'next/headers';
import LoginForm from '@/components/LoginForm';
import AddProductForm from '@/components/AddProductForm';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth');
  const isLoggedIn = authCookie?.value === 'true';

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {isLoggedIn ? <AddProductForm /> : <LoginForm />}
    </div>
  );
}
