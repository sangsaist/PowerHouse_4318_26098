import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { fitDistance } from "./cadModel.js";

/* Shared, deliberately cheap renderer settings: capped DPR, no shadows,
 * render-on-demand. */
export const canvasProps = {
  frameloop: "demand",
  dpr: [1, 1.75],
  shadows: false,
  gl: { antialias: true, alpha: true, powerPreference: "high-performance", stencil: false },
  camera: { fov: 32, near: 0.01, far: 1000, position: [10, 6, 18] },
  onCreated: ({ gl }) => {
    // Neutral tone mapping keeps the Fusion 360 colours closer to source than ACES.
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.05;
  },
};

/* Studio reflections generated once on the GPU — no HDR download. */
export function StudioEnvironment({ intensity = 0.85 }) {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    invalidate();
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
      room.traverse((o) => o.isMesh && (o.geometry.dispose(), o.material.dispose()));
    };
  }, [gl, scene, intensity, invalidate]);
  return null;
}

export function StudioLights() {
  return (
    <>
      <directionalLight position={[6, 10, 8]} intensity={1.6} />
      <directionalLight position={[-8, 3, -6]} intensity={0.45} />
    </>
  );
}

const ease = (t) => 1 - Math.pow(1 - t, 3);

/*
 * Orbit controls + camera framing. Exposes reset() / fit() through `ref`.
 * Framing uses the model's vertex cloud, so any CAD scale or unit frames correctly.
 */
export function CameraRig({ ref, points, viewDir, intro = false, margin = 1.12, insetRight = 0, onCamera, controls = {} }) {
  const { camera, gl, size, invalidate } = useThree();
  // Reserve space for a side panel on wide screens by shifting the projection centre.
  const inset = size.width > 860 ? insetRight : 0;
  useLayoutEffect(() => {
    if (inset) camera.setViewOffset(size.width, size.height, inset / 2, 0, size.width, size.height);
    else camera.clearViewOffset();
    invalidate();
  }, [camera, inset, size.width, size.height, invalidate]);
  const orbit = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl]);
  const controlsRef = useRef(orbit);
  controlsRef.current = orbit;
  const tween = useRef(null);
  const homeDir = useRef(new THREE.Vector3(...viewDir).normalize());

  const goalFor = (dir) => {
    const dist = fitDistance(points, dir, camera, margin, (size.width - inset) / size.height);
    return { pos: dir.clone().multiplyScalar(dist), tgt: new THREE.Vector3(), dist };
  };

  const updateLimits = (dist) => {
    camera.near = Math.max(dist / 500, 0.001);
    camera.far = dist * 50;
    camera.updateProjectionMatrix();
    controlsRef.current.minDistance = dist * 0.15;
    controlsRef.current.maxDistance = dist * 6;
  };

  const flyTo = (goal, duration = 0.8) => {
    updateLimits(goal.dist);
    tween.current = {
      fromPos: camera.position.clone(),
      fromTgt: controlsRef.current.target.clone(),
      ...goal,
      t: 0,
      duration,
    };
    invalidate();
  };

  useImperativeHandle(ref, () => ({
    reset: () => flyTo(goalFor(homeDir.current)),
    fit: () => {
      const dir = camera.position.clone().sub(controlsRef.current.target).normalize();
      flyTo(goalFor(dir));
    },
  }));

  // Touch devices on the homepage: controls are disabled, so give scrolling back to the page.
  useEffect(() => {
    if (controls.enabled === false) gl.domElement.style.touchAction = "pan-y";
  }, [gl, controls.enabled]);

  // Initial framing, and re-framing when the viewport flips orientation.
  const landscape = size.width >= size.height;
  useEffect(() => {
    const goal = goalFor(homeDir.current);
    updateLimits(goal.dist);
    controlsRef.current.target.set(0, 0, 0);
    if (intro && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const start = homeDir.current.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.6);
      camera.position.copy(start.multiplyScalar(goal.dist * 1.3));
      flyTo(goal, 2.4);
    } else {
      camera.position.copy(goal.pos);
      controlsRef.current.update();
      emit();
      invalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, landscape, inset > 0]);

  useFrame((_, dt) => {
    const tw = tween.current;
    if (!tw) return;
    tw.t = Math.min(1, tw.t + Math.min(dt, 1 / 30) / tw.duration);
    const k = ease(tw.t);
    camera.position.lerpVectors(tw.fromPos, tw.pos, k);
    controlsRef.current.target.lerpVectors(tw.fromTgt, tw.tgt, k);
    controlsRef.current.update();
    if (tw.t >= 1) tween.current = null;
    invalidate();
  });

  const spherical = useRef(new THREE.Spherical());
  const emit = () => {
    if (!onCamera) return;
    const s = spherical.current.setFromVector3(camera.position.clone().sub(controlsRef.current.target));
    onCamera({
      azimuth: THREE.MathUtils.radToDeg(s.theta),
      elevation: 90 - THREE.MathUtils.radToDeg(s.phi),
      distance: s.radius,
    });
  };

  // Damped controls: each update that moves the camera fires "change", which requests
  // one more frame — so rendering stops by itself once the camera settles.
  useEffect(() => {
    Object.assign(orbit, {
      enableDamping: true,
      dampingFactor: 0.08,
      rotateSpeed: 0.7,
      zoomSpeed: 0.8,
      panSpeed: 0.8,
      screenSpacePanning: true,
      ...controls,
    });
    const onChange = () => (invalidate(), emit());
    const onStart = () => (tween.current = null);
    orbit.addEventListener("change", onChange);
    orbit.addEventListener("start", onStart);
    return () => {
      orbit.removeEventListener("change", onChange);
      orbit.removeEventListener("start", onStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orbit, JSON.stringify(controls)]);
  useEffect(() => () => orbit.dispose(), [orbit]);

  useFrame(() => orbit.enabled && orbit.update(), -1);

  return null;
}
