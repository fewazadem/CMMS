
import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'Manufacturing CMMS',
  description: 'Localhost CMMS Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-gray-50 text-black">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
