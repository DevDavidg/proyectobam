import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping } from 'three';
import { TerrainBoundary } from './terrain-boundary';

type TerrainProps = {
  worldSize: number;
  gridOpacity: number;
};

const createSeededRandom = (seed: number) => {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };
};

type RgbColor = { red: number; green: number; blue: number };

const hexToRgb = (hex: string): RgbColor => {
  const normalised = hex.replace('#', '');
  const value = Number.parseInt(normalised, 16);
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  };
};

const mixColors = (colorA: RgbColor, colorB: RgbColor, ratio: number): RgbColor => {
  const clamped = Math.max(0, Math.min(1, ratio));
  return {
    red: Math.round(colorA.red * (1 - clamped) + colorB.red * clamped),
    green: Math.round(colorA.green * (1 - clamped) + colorB.green * clamped),
    blue: Math.round(colorA.blue * (1 - clamped) + colorB.blue * clamped),
  };
};

export const TERRAIN_GRASS_COLOR = '#5aab1c';
/** Tint applied on the terrain material (matches visible grass in-game). */
export const TERRAIN_MATERIAL_COLOR = '#9ad94e';

const GRASS_BASE = hexToRgb(TERRAIN_GRASS_COLOR);
const GRASS_LIGHT = hexToRgb('#84c626');
const GRASS_SHADE = hexToRgb('#3a780d');
const GRASS_DRY = hexToRgb('#99bc23');
const BLADE_LIGHT = hexToRgb('#a2dd57');
const BLADE_DARK = hexToRgb('#4f8f1a');
const GRID_COLOR = 'rgba(255, 255, 255, 0.12)';

const TEXTURE_RESOLUTION = 1024;
const GRID_TEXTURE_RESOLUTION = 1024;
const GRID_CELL_PX = 64;
const GRID_LINE_PX = 1;

const drawPathPolyline = (
  context: CanvasRenderingContext2D,
  controlPoints: Array<[number, number]>
): void => {
  context.beginPath();
  context.moveTo(controlPoints[0][0], controlPoints[0][1]);
  for (let index = 1; index < controlPoints.length; index += 1) {
    const point = controlPoints[index];
    context.lineTo(point[0], point[1]);
  }
};

const createTerrainCanvas = (): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_RESOLUTION;
  canvas.height = TEXTURE_RESOLUTION;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }
  context.fillStyle = `rgb(${GRASS_BASE.red}, ${GRASS_BASE.green}, ${GRASS_BASE.blue})`;
  context.fillRect(0, 0, TEXTURE_RESOLUTION, TEXTURE_RESOLUTION);

  const random = createSeededRandom(5227);
  const drawBladeCluster = (x: number, y: number, density: number): void => {
    for (let blade = 0; blade < density; blade += 1) {
      const tilt = (random() - 0.5) * 1.1;
      const length = 3 + random() * 6;
      const xOffset = (random() - 0.5) * 8;
      const yOffset = (random() - 0.5) * 7;
      const mix = random();
      const bladeColor = mixColors(BLADE_DARK, BLADE_LIGHT, mix);
      context.strokeStyle = `rgba(${bladeColor.red}, ${bladeColor.green}, ${bladeColor.blue}, ${0.24 + random() * 0.36})`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x + xOffset, y + yOffset);
      context.lineTo(x + xOffset + tilt, y + yOffset - length);
      context.stroke();
    }
  };

  for (let index = 0; index < 5600; index += 1) {
    const x = random() * TEXTURE_RESOLUTION;
    const y = random() * TEXTURE_RESOLUTION;
    const density = 2 + Math.floor(random() * 5);
    drawBladeCluster(x, y, density);
  }

  context.globalAlpha = 0.2;
  for (let pass = 0; pass < 3; pass += 1) {
    const highlight = pass === 0 ? GRASS_LIGHT : pass === 1 ? GRASS_SHADE : GRASS_DRY;
    context.fillStyle = `rgb(${highlight.red}, ${highlight.green}, ${highlight.blue})`;
    for (let patch = 0; patch < 95; patch += 1) {
      const x = random() * TEXTURE_RESOLUTION;
      const y = random() * TEXTURE_RESOLUTION;
      const width = 18 + random() * 40;
      const height = 10 + random() * 24;
      context.beginPath();
      context.ellipse(x, y, width, height, random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;

  const drawPath = (controlPoints: Array<[number, number]>, width: number): void => {
    context.save();
    context.strokeStyle = 'rgba(139, 90, 43, 0.42)';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = width;
    drawPathPolyline(context, controlPoints);
    context.stroke();
    context.strokeStyle = 'rgba(171, 126, 71, 0.22)';
    context.lineWidth = Math.max(4, width * 0.42);
    drawPathPolyline(context, controlPoints);
    context.stroke();

    // Break edges so roads look worn and organic.
    context.globalCompositeOperation = 'destination-out';
    const chipCount = 600;
    for (let chip = 0; chip < chipCount; chip += 1) {
      const segmentIndex = Math.floor(random() * (controlPoints.length - 1));
      const a = controlPoints[segmentIndex];
      const b = controlPoints[segmentIndex + 1];
      const t = random();
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      const edgeSign = random() > 0.5 ? 1 : -1;
      const edgeOffset = (width * 0.33 + random() * width * 0.22) * edgeSign;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const length = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / length;
      const ny = dx / length;
      const radius = 2 + random() * 9;
      context.beginPath();
      context.arc(x + nx * edgeOffset, y + ny * edgeOffset, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalCompositeOperation = 'source-over';

    // Blend grass blades back into road borders.
    context.globalAlpha = 0.28;
    for (let patch = 0; patch < 360; patch += 1) {
      const segmentIndex = Math.floor(random() * (controlPoints.length - 1));
      const a = controlPoints[segmentIndex];
      const b = controlPoints[segmentIndex + 1];
      const t = random();
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      drawBladeCluster(
        x + (random() - 0.5) * width * 0.45,
        y + (random() - 0.5) * width * 0.45,
        1 + Math.floor(random() * 3)
      );
    }
    context.globalAlpha = 1;
    context.restore();
  };

  drawPath(
    [
      [120, 660],
      [290, 590],
      [430, 510],
      [610, 430],
      [820, 360],
    ],
    58
  );
  drawPath(
    [
      [170, 280],
      [330, 350],
      [490, 450],
      [670, 560],
      [870, 650],
    ],
    44
  );

  return canvas;
};

const createGridCanvas = (): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = GRID_TEXTURE_RESOLUTION;
  canvas.height = GRID_TEXTURE_RESOLUTION;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }
  context.clearRect(0, 0, GRID_TEXTURE_RESOLUTION, GRID_TEXTURE_RESOLUTION);
  context.strokeStyle = GRID_COLOR;
  context.lineWidth = GRID_LINE_PX;

  for (let position = 0; position <= GRID_TEXTURE_RESOLUTION; position += GRID_CELL_PX) {
    context.beginPath();
    context.moveTo(position + 0.5, 0);
    context.lineTo(position + 0.5, GRID_TEXTURE_RESOLUTION);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position + 0.5);
    context.lineTo(GRID_TEXTURE_RESOLUTION, position + 0.5);
    context.stroke();
  }
  const fadeGradient = context.createRadialGradient(
    GRID_TEXTURE_RESOLUTION / 2,
    GRID_TEXTURE_RESOLUTION / 2,
    GRID_TEXTURE_RESOLUTION * 0.18,
    GRID_TEXTURE_RESOLUTION / 2,
    GRID_TEXTURE_RESOLUTION / 2,
    GRID_TEXTURE_RESOLUTION * 0.66
  );
  fadeGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  fadeGradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.68)');
  fadeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = fadeGradient;
  context.fillRect(0, 0, GRID_TEXTURE_RESOLUTION, GRID_TEXTURE_RESOLUTION);
  context.globalCompositeOperation = 'source-over';
  return canvas;
};

const createTerrainTexture = (): CanvasTexture => {
  const canvas = createTerrainCanvas();
  if (!canvas) {
    const fallbackCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (fallbackCanvas) {
      fallbackCanvas.width = 4;
      fallbackCanvas.height = 4;
    }
    const fallback = new CanvasTexture(fallbackCanvas as HTMLCanvasElement);
    fallback.wrapS = RepeatWrapping;
    fallback.wrapT = RepeatWrapping;
    fallback.needsUpdate = true;
    return fallback;
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  texture.repeat.set(2.15, 2.15);
  texture.needsUpdate = true;
  return texture;
};

const createGridTexture = (): CanvasTexture | null => {
  const canvas = createGridCanvas();
  if (!canvas) {
    return null;
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
  return texture;
};

type TerrainGroundProps = {
  worldSize: number;
  gridOpacity: number;
  /** Multiplier for the grass plane beyond the grid (game default 4.4). */
  extentMultiplier?: number;
};

export const TerrainGround = ({
  worldSize,
  gridOpacity,
  extentMultiplier = 4.4,
}: TerrainGroundProps) => {
  const terrainTexture = useMemo(() => createTerrainTexture(), []);
  const gridTexture = useMemo(() => createGridTexture(), []);
  const extendedWorldSize = worldSize * extentMultiplier;

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.011, 0]}>
        <planeGeometry args={[extendedWorldSize, extendedWorldSize]} />
        <meshStandardMaterial
          map={terrainTexture}
          color={TERRAIN_MATERIAL_COLOR}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {gridTexture ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]}>
          <planeGeometry args={[worldSize, worldSize]} />
          <meshBasicMaterial
            map={gridTexture}
            transparent
            opacity={gridOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
};

export const Terrain = ({ worldSize, gridOpacity }: TerrainProps) => {
  const boundaryProps = useMemo(() => {
    const random = createSeededRandom(7401);
    return Array.from({ length: 34 }).map((_, index) => {
      const angle = (index / 34) * Math.PI * 2;
      const radius = worldSize * (0.6 + random() * 0.06);
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        moundScale: 0.9 + random() * 1.2,
        canopyScale: 0.8 + random() * 1.3,
      };
    });
  }, [worldSize]);

  return (
    <group>
      <TerrainGround worldSize={worldSize} gridOpacity={gridOpacity} />
      <TerrainBoundary boundaryProps={boundaryProps} />
    </group>
  );
};
