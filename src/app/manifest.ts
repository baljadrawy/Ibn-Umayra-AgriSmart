import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'تقويم ابن عميرة الزراعي',
    short_name: 'ابن عميرة',
    description: 'التقويم الزراعي الذكي مبني على تقويم ابن عميرة التراثي — معدَّل لكل مناطق المملكة',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    lang: 'ar',
    dir: 'rtl',
    orientation: 'portrait',
    categories: ['agriculture', 'productivity', 'weather'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'النجم الحالي',
        short_name: 'اليوم',
        description: 'عرض النجم الحالي والتوصيات',
        url: '/',
        icons: [{ src: '/favicon.ico', sizes: '96x96' }],
      },
      {
        name: 'التقويم الكامل',
        short_name: 'التقويم',
        description: 'عرض تقويم ابن عميرة لعام 2026',
        url: '/calendar',
        icons: [{ src: '/favicon.ico', sizes: '96x96' }],
      },
      {
        name: 'استشر الذكاء',
        short_name: 'الذكاء',
        description: 'الاستشارة الزراعية الذكية',
        url: '/ask',
        icons: [{ src: '/favicon.ico', sizes: '96x96' }],
      },
    ],
  };
}
