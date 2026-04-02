// components/SplineBackground.tsx
'use client';

import Spline from '@splinetool/react-spline';

export default function SplineBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Spline scene="https://prod.spline.design/mUccT9dDKFJmWUhl/scene.splinecode" />
    </div>
  );
}