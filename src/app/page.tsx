import Link from 'next/link';
import { SplashScreen } from '@/components/splash/SplashScreen';

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <SplashScreen />
    </main>
  );
} 