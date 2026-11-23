import { Group, MathUtils, Vector3, type Object3D } from 'three';

/** Hinge pivot in model space, from assets/box/MODEL.md. */
export const LID_PIVOT = new Vector3(0, 0.914876, 0.359181);
export const LID_OPEN_ANGLE = MathUtils.degToRad(115);

const LID_PARTS = ['Shell_Lid', 'Shell_Wordmark'];

/**
 * Moves the lid and wordmark under a group placed at the hinge pivot, keeping the closed pose.
 * The parts' own origins are not the hinge, so rotating them directly would spin the lid in place.
 * Open the box by setting the returned group's `rotation.x` from 0 to `LID_OPEN_ANGLE`.
 */
export function attachLidHinge(root: Object3D): Group {
  const hinge = new Group();
  hinge.name = 'LidHinge';
  hinge.position.copy(LID_PIVOT);
  root.add(hinge);
  root.updateMatrixWorld(true);

  for (const name of LID_PARTS) {
    const part = root.getObjectByName(name);
    if (!part) throw new Error(`Box model is missing "${name}"; check it against assets/box/MODEL.md`);
    hinge.attach(part);
  }
  return hinge;
}
