import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: 'linear-gradient(145deg, #FFD600 0%, #FF8F00 100%)',
          borderRadius: 108,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 300, lineHeight: 1 }}>🐵</span>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
