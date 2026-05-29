import { Canvas, type CanvasProps } from '@react-three/fiber';
import { wrapRendererInstance } from './perf-debugger';

export const PerfCanvas = ({ onCreated, ...props }: CanvasProps) => (
  <Canvas
    {...props}
    onCreated={(state) => {
      if (import.meta.env.DEV) {
        wrapRendererInstance(state.gl);
      }
      onCreated?.(state);
    }}
  />
);
