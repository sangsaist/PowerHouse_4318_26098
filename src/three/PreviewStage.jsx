import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useCadModel } from "./useCadModel.js";
import { CameraRig, StudioEnvironment, StudioLights, canvasProps } from "./SceneKit.jsx";
import { ModelReadout, LoadState } from "./Readouts.jsx";

const VIEW = [0.62, 0.3, 1];

/* Homepage preview: rotate-only on pointer devices, static on touch so the
 * page still scrolls. Renders only when the camera moves. */
export default function PreviewStage() {
  const { status, progress, data } = useCadModel();
  const coarse = useMemo(() => matchMedia("(pointer: coarse)").matches, []);

  return (
    <>
      {data && (
        <Canvas {...canvasProps} className="stage-canvas">
          <StudioEnvironment />
          <StudioLights />
          <primitive object={data.root} dispose={null} />
          <CameraRig
            points={data.points}
            viewDir={VIEW}
            intro
            controls={{ enabled: !coarse, enableZoom: false, enablePan: false, minPolarAngle: 0.5, maxPolarAngle: 2.3 }}
          />
        </Canvas>
      )}
      <LoadState status={status} progress={progress} />
      {data && <ModelReadout data={data} />}
    </>
  );
}
