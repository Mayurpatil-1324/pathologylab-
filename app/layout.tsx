import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LocationProvider } from '@/lib/location-context';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'HealthPoint Diagnostics | Book Blood Tests & Health Checkups Online',
  description:
    'NABL & ISO compliant diagnostic laboratory and pathology services in India. Book lab tests and preventive full body health checkups with convenient home sample collection and secure digital reports.',
  keywords: [
    'pathology lab',
    'blood test',
    'diagnostic center',
    'home sample collection',
    'full body checkup',
    'CBC test',
    'lipid profile',
    'thyroid profile',
    'hba1c test',
    'India lab test',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <LocationProvider>
            <CartProvider>{children}</CartProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
