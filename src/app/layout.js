import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ShortKeun URL - Pemendek URL Simpel',
  description: 'Perpendek URL dengan mudah dan pantau statistik klik',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 to-blue-900`}>
        <div className="network-grid">
          {/* Background dengan efek grid jaringan */}
          <div className="fixed inset-0 z-0 opacity-20">
            <div className="absolute inset-0 bg-grid-pattern"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
} 