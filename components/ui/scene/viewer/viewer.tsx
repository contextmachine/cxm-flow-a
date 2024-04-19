import styled from "styled-components";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import { useStates } from "@/components/services/state-service/state-provider";
import { ViewerComponent } from "@/src/viewer/viewer-component";

const DynamicContextMenuDemo = dynamic(
  () => import("../primitives/context-menu"),
  { ssr: false }
);

const Viewer = () => {
  const { stateService } = useStates();

  return (
    <>
      <ViewerComponent>

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

const ViewerBackground = styled.div`
  background-color: #eeeeee;
  height: 100%;
  width: 100%;

  position: absolute;
`;

export default Viewer;
