import { cookies } from 'next/headers';
import LoginForm from '@/components/LoginForm';
import AdminDashboard from '@/components/AdminDashboard';
import path from 'path';
import fs from 'fs';

async function getProducts() {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

export default async function LoginPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth');
  const isLoggedIn = authCookie?.value === 'true';
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {isLoggedIn ? <AdminDashboard initialProducts={products} /> : <LoginForm />}
    </div>
  );
}
