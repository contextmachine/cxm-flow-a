import styled from "styled-components";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import { useStates } from "@/components/services/state-service/state-provider";
import { ViewerComponent } from "@/src/viewer/viewer-component";
import { useScene } from "@/components/services/scene-service/scene-provider";

const DynamicContextMenuDemo = dynamic(
  () => import("../primitives/context-menu"),
  { ssr: false }
);

const Viewer = () => {
  const { sceneService } = useScene();
  const { stateService } = useStates();

  return (
    <>
      <ViewerComponent sceneService={sceneService}>
        {/* {<DynamicContextMenuDemo />} */}
      </ViewerComponent>
    </>
  );
};

const Canvas = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  background-color: transparent;

  display: flex;
  justify-content: center;
  align-items: center;
`;



export default Viewer;
