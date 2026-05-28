import { useEffect } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export const IsometricCamera = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return <OrthographicCamera makeDefault position={[100, 100, 100]} zoom={12} near={0.1} far={1000} />;
};
