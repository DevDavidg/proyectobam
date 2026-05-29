import type { Ref } from 'react';
import type { Group } from 'three';
import type { MaterialFactory, PebbleShinerDimensions } from '../types';
import { CentrifugeAxle } from './centrifuge-axle';
import { CentrifugeDrum } from './centrifuge-drum';
import { CentrifugeFrame } from './centrifuge-frame';
import { CentrifugeHopper } from './centrifuge-hopper';
import { CentrifugeOutput } from './centrifuge-output';

type CentrifugeMachineProps = {
  dim: PebbleShinerDimensions;
  createMaterial: MaterialFactory;
  rootRef: Ref<Group>;
  drum1Ref: Ref<Group>;
  drum2Ref: Ref<Group>;
  hopperDustRef: Ref<Group>;
  endDustRef: Ref<Group>;
};

export const CentrifugeMachine = ({
  dim,
  createMaterial,
  rootRef,
  drum1Ref,
  drum2Ref,
  hopperDustRef,
  endDustRef,
}: CentrifugeMachineProps) => {
  return (
    <group ref={rootRef}>
      <CentrifugeFrame dim={dim} createMaterial={createMaterial} />
      <CentrifugeAxle dim={dim} createMaterial={createMaterial} />
      <CentrifugeHopper dim={dim} createMaterial={createMaterial} />
      <CentrifugeDrum
        centerX={dim.drum1CenterX}
        centerY={dim.drumCenterY}
        centerZ={0}
        length={dim.drumLength}
        radius={dim.drumRadius}
        drumRef={drum1Ref}
        createMaterial={createMaterial}
      />
      <CentrifugeDrum
        centerX={dim.drum2CenterX}
        centerY={dim.drumCenterY}
        centerZ={0}
        length={dim.drumLength}
        radius={dim.drumRadius}
        drumRef={drum2Ref}
        createMaterial={createMaterial}
      />
      <CentrifugeOutput
        dim={dim}
        createMaterial={createMaterial}
        hopperDustRef={hopperDustRef}
        endDustRef={endDustRef}
      />
    </group>
  );
};
