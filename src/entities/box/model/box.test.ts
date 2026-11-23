import { BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshPhysicalMaterial, Vector3 } from 'three';

import { darkTheme } from '@/shared/theme';

import { createBoxInstance } from './box';
import { LID_OPEN_ANGLE } from './hinge';

// The lid's top-back corner in the closed pose (MODEL.md closed bounds: Y 1.1166, Z -0.3799).
const LID_CORNER = new Vector3(0, 1.1166, -0.3799);

const meshAt = (name: string, point: Vector3, material: MeshPhysicalMaterial) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(point.toArray(), 3));
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  return mesh;
};

/** Mirrors the supplied GLB: parts are top-level nodes with identity transforms, vertices in model space. */
const buildScene = () => {
  const body = new MeshPhysicalMaterial({ name: 'ShellRole_Body_Matte' });
  const accent = new MeshPhysicalMaterial({ name: 'ShellRole_SeamAccent_Accent' });
  const scene = new Group();
  scene.add(
    meshAt('Shell_Base', new Vector3(0.56, 0, 0.3799), body),
    meshAt('Shell_Lid', LID_CORNER, body),
    meshAt('Shell_Wordmark', LID_CORNER, body),
    meshAt('Shell_Seam', new Vector3(0, 0.9, 0.3799), accent),
  );
  return { scene, body, accent };
};

const worldVertex = (root: Group | Mesh, name: string) => {
  root.updateMatrixWorld(true);
  const mesh = root.getObjectByName(name) as Mesh;
  const local = new Vector3().fromBufferAttribute(mesh.geometry.getAttribute('position'), 0);
  return mesh.localToWorld(local);
};

// Reparenting under the hinge must not visibly move the lid, or every closed box renders broken.
test('attaching the hinge keeps the closed pose', () => {
  const { scene } = buildScene();
  const { root } = createBoxInstance(scene, 'rare');

  expect(worldVertex(root as Group, 'Shell_Lid').distanceTo(LID_CORNER)).toBeLessThan(1e-6);
  expect(worldVertex(root as Group, 'Shell_Wordmark').distanceTo(LID_CORNER)).toBeLessThan(1e-6);
});

// Guards the pivot, axis and sign: fully open, the far lid corner must land on MODEL.md's open bound (Z 0.8543).
test('opening swings the lid back to the documented open bounds', () => {
  const { scene } = buildScene();
  const { root, hinge } = createBoxInstance(scene, 'rare');

  hinge.rotation.x = LID_OPEN_ANGLE;
  const corner = worldVertex(root as Group, 'Shell_Lid');

  expect(corner.z).toBeCloseTo(0.8543, 3);
  expect(corner.y).toBeGreaterThan(LID_CORNER.y);
  expect(corner.y).toBeLessThanOrEqual(1.8654);
  expect(worldVertex(root as Group, 'Shell_Wordmark').distanceTo(corner)).toBeLessThan(1e-6);
});

// The base, cushion and seam are stationary; only the lid and wordmark may move.
test('opening leaves the base in place', () => {
  const { scene } = buildScene();
  const { root, hinge } = createBoxInstance(scene, 'rare');

  hinge.rotation.x = LID_OPEN_ANGLE;

  expect(worldVertex(root as Group, 'Shell_Base').distanceTo(new Vector3(0.56, 0, 0.3799))).toBeLessThan(1e-6);
});

// The catalogue shows several tiers at once; recoloring one box must not repaint the shared GLB materials.
test('tier colors apply to the instance without touching the shared materials', () => {
  const { scene, body, accent } = buildScene();
  const originalBody = body.color.getHex();

  const { root, materials } = createBoxInstance(scene, 'legendary');
  const lid = root.getObjectByName('Shell_Lid') as Mesh;
  const seam = root.getObjectByName('Shell_Seam') as Mesh;

  expect(body.color.getHex()).toBe(originalBody);
  expect(lid.material).not.toBe(body);
  expect((seam.material as MeshPhysicalMaterial).color.getHexString()).toBe(
    darkTheme.rarity.legendary.slice(1).toLowerCase(),
  );
  expect(seam.material).not.toBe(accent);
  expect(materials).toHaveLength(2);
});

// A swapped or renamed model should fail loudly instead of rendering a lid that never opens.
test('throws when the model has no lid', () => {
  const { scene } = buildScene();
  scene.remove(scene.getObjectByName('Shell_Lid')!);

  expect(() => createBoxInstance(scene, 'common')).toThrow('Shell_Lid');
});
