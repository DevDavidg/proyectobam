import { useRef } from 'react';
import { Vector3, type Camera, type Object3D } from 'three';

export type ContextMenuPositionResolver = (
  element: Object3D,
  cameraRef: Camera,
  size: { width: number; height: number },
) => [number, number];

export const useContextMenuPosition = (
  menuRef: React.RefObject<HTMLDivElement | null>,
): ContextMenuPositionResolver => {
  const projectedAnchorRef = useRef<Vector3>(new Vector3());

  return (element, cameraRef, size) => {
    const bounds = menuRef.current?.getBoundingClientRect();
    const measuredWidth = bounds?.width ?? menuRef.current?.offsetWidth ?? 360;
    const measuredHeight = bounds?.height ?? menuRef.current?.offsetHeight ?? 340;
    const edgePadding = 10;
    const anchorOffset = 16;
    projectedAnchorRef.current.setFromMatrixPosition(element.matrixWorld).project(cameraRef);
    const anchorScreenX = (projectedAnchorRef.current.x * 0.5 + 0.5) * size.width;
    const anchorScreenY = (-projectedAnchorRef.current.y * 0.5 + 0.5) * size.height;
    const centeredX = anchorScreenX - measuredWidth * 0.5;
    const preferredTop = anchorScreenY - measuredHeight - anchorOffset;
    const preferredBottom = anchorScreenY + anchorOffset;
    const maxX = Math.max(edgePadding, size.width - measuredWidth - edgePadding);
    const maxY = Math.max(edgePadding, size.height - measuredHeight - edgePadding);
    const finalX = Math.max(edgePadding, Math.min(centeredX, maxX));
    const finalY = preferredTop >= edgePadding ? preferredTop : Math.max(edgePadding, Math.min(preferredBottom, maxY));
    return [finalX, finalY];
  };
};
