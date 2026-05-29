import { View } from '@react-three/drei';
import type { RefObject } from 'react';
import { PerfCanvas } from '../../../app/perf-canvas';

type ShopPreviewCanvasProps = {
  containerRef: RefObject<HTMLElement | null>;
};

export const ShopPreviewCanvas = ({ containerRef }: ShopPreviewCanvasProps) => (
  <PerfCanvas
    className="pointer-events-none absolute inset-0 z-[2]"
    eventSource={containerRef as RefObject<HTMLElement>}
    shadows={false}
    dpr={[1, 1.25]}
    frameloop="demand"
    gl={{
      antialias: false,
      powerPreference: 'low-power',
      stencil: false,
      depth: true,
      alpha: true,
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false,
    }}
  >
    <View.Port />
  </PerfCanvas>
);
