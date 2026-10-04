import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { model as modelConfig } from "../config/site.js";

/*
 * Loads the Fusion 360 OBJ/MTL once and shares it between the homepage
 * preview and the full viewer.
 *
 * Fusion exports MTL files with only a diffuse colour (Kd). The Fusion
 * appearance name survives as the material name ("Brass - Polished",
 * "Paint - Metallic (Green)" …), so it is used to pick physically based
 * metalness/roughness values while keeping the exported colour exact.
 */

const PRESETS = [
  { test: /chrome|steel|alumin|titan|nickel|iron/i, metalness: 1, roughness: 0.22 },
  { test: /brass|bronze|copper|gold|silver/i, metalness: 1, roughness: 0.2 },
  { test: /paint.*metal|metallic/i, metalness: 0.55, roughness: 0.32 },
  { test: /rubber|wax|matte|foam/i, metalness: 0, roughness: 0.62 },
  { test: /plastic|abs|nylon|resin|paint/i, metalness: 0, roughness: 0.42 },
  { test: /glass|acrylic/i, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.4 },
];

function toStandard(src) {
  const preset = PRESETS.find((p) => p.test.test(src.name)) ?? { metalness: 0.1, roughness: 0.5 };
  const mat = new THREE.MeshStandardMaterial({
    name: src.name,
    color: src.color?.clone() ?? new THREE.Color(0xcccccc),
    map: src.map ?? null,
    normalMap: src.normalMap ?? null,
    metalness: preset.metalness,
    roughness: preset.roughness,
    transparent: preset.transparent ?? src.transparent,
    opacity: preset.opacity ?? src.opacity,
    side: THREE.FrontSide,
  });
  if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
  src.dispose();
  return mat;
}

function collectStats(root) {
  const box = new THREE.Box3().setFromObject(root);
  let triangles = 0;
  const parts = [];
  root.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry;
    triangles += (g.index ? g.index.count : g.attributes.position.count) / 3;
    parts.push(o);
  });
  return { box, size: box.getSize(new THREE.Vector3()), triangles: Math.round(triangles), parts };
}

let cache = null;
const listeners = new Set();

export function onModelProgress(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function loadCadModel() {
  if (cache) return cache;
  cache = (async () => {
    const mtl = new MTLLoader();
    mtl.setResourcePath(modelConfig.basePath);
    const materials = await mtl.loadAsync(modelConfig.mtl);
    materials.preload();

    const obj = new OBJLoader();
    obj.setMaterials(materials);
    const raw = await obj.loadAsync(modelConfig.obj, (e) => {
      if (e.total) listeners.forEach((fn) => fn(e.loaded / e.total));
    });

    const converted = new Map();
    const convert = (m) => {
      if (!converted.has(m)) converted.set(m, toStandard(m));
      return converted.get(m);
    };

    raw.traverse((o) => {
      if (!o.isMesh) return;
      // OBJ geometry arrives un-indexed; welding shared vertices cuts GPU memory.
      const welded = mergeVertices(o.geometry, 1e-5);
      o.geometry.dispose();
      o.geometry = welded;
      o.geometry.computeBoundingSphere();
      o.material = Array.isArray(o.material) ? o.material.map(convert) : convert(o.material);
      o.frustumCulled = true;
      o.matrixAutoUpdate = false;
      o.updateMatrix();
    });

    // Re-centre on the origin so framing is independent of the CAD origin and units.
    const centre = new THREE.Box3().setFromObject(raw).getCenter(new THREE.Vector3());
    raw.position.sub(centre);
    raw.updateMatrixWorld(true);

    const root = new THREE.Group();
    root.add(raw);
    root.updateMatrixWorld(true);

    // Vertex cloud used for tight camera framing (far tighter than a bounding sphere
    // for long, slender parts).
    const points = [];
    const v = new THREE.Vector3();
    root.traverse((o) => {
      if (!o.isMesh) return;
      const pos = o.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) points.push(v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).clone());
    });

    return { root, points, materials: [...converted.values()], ...collectStats(root) };
  })();
  cache.catch(() => (cache = null));
  return cache;
}

/* Distance along `dir` (unit, from target toward camera) at which every point fits the frustum. */
export function fitDistance(points, dir, camera, margin = 1.12, aspect = camera.aspect) {
  const forward = dir.clone().normalize();
  const worldUp = Math.abs(forward.y) > 0.98 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(worldUp, forward).normalize();
  const up = new THREE.Vector3().crossVectors(forward, right);
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const tanH = tanV * aspect;
  let d = 0;
  for (const p of points) {
    const z = p.dot(forward);
    d = Math.max(d, z + Math.abs(p.dot(right)) / tanH, z + Math.abs(p.dot(up)) / tanV);
  }
  return d * margin;
}
