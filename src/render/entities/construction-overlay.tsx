type ConstructionOverlayProps = {
  sizeX: number;
  sizeY: number;
  progress: number;
};

export const ConstructionOverlay = ({ sizeX, sizeY, progress }: ConstructionOverlayProps) => (
  <group>
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[sizeX, 1.2, sizeY]} />
      <meshStandardMaterial color="#facc15" transparent opacity={0.25} wireframe />
    </mesh>
    <mesh position={[0, 1.35, 0]}>
      <boxGeometry args={[sizeX * Math.max(0.08, progress), 0.15, 0.18]} />
      <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.4} />
    </mesh>
  </group>
);
