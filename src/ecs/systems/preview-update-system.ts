type PreviewInput = {
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

export type PlacementPreview = PreviewInput & {
  valid: boolean;
};

export const runPreviewUpdateSystem = (
  input: PreviewInput,
  canPlaceAt: (x: number, y: number, sizeX: number, sizeY: number) => boolean
): PlacementPreview => ({
  ...input,
  valid: canPlaceAt(input.x, input.y, input.sizeX, input.sizeY),
});
