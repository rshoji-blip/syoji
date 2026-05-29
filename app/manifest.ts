import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'おさるのジョージ エピソード検索',
    short_name: 'ジョージ検索',
    description: 'おさるのジョージのエピソードをキャラクターやジャンルで検索！',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF8E1',
    theme_color: '#FFB300',
    lang: 'ja',
    categories: ['entertainment', 'kids'],
    icons: [
      { src: '/pwa/icon192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa/icon512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
