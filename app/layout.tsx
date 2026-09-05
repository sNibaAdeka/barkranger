import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BarkRanger — vertical biodiversity scanner',
  description: 'Автономный робот-биолог для 360° исследования вертикальной экосистемы дерева.',
  openGraph: {
    title: 'BarkRanger — vertical biodiversity scanner',
    description: 'Жизнь дерева. В каждом метре.',
    type: 'website',
    images: [{ url: '/og.png', width: 1728, height: 910, alt: 'BarkRanger обхватывает ствол тропического дерева' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BarkRanger — vertical biodiversity scanner',
    description: 'Жизнь дерева. В каждом метре.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
