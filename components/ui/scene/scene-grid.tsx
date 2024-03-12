import styled from "styled-components";
import Viewer from "./viewer/viewer";
import Bar from "./bar/bar";
import WidgetPanel from "./widgets-panel/widget-panel";
import ToolsPanel from "./tools-panel/tools-panel";

const SceneGrid = () => {
  return (
    <Wrapper>
      <Grid>
        <BarWrapper>
          <Bar />
        </BarWrapper>

        <ContentWrapper>
          <WidgetPanel />
        </ContentWrapper>

        <FooterWrapper>
          <ToolsPanel />
        </FooterWrapper>
      </Grid>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  position: fixed;

  z-index: 4;

  display: flex;
  pointer-events: none;
`;

const Grid = styled.div`
  margin: 9px;
  width: 100%;

  display: grid;
  grid-template-rows: 45px auto 45px;
  grid-row-gap: 9px;

  & > * > * {
    pointer-events: all;
  }

  & > * > * {
    height: 100%;
  }
`;

const LEFT_PANEL_MAXWIDTH = 366;

const BarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  & > *:first-child {
    width: 100%;
    max-width: ${LEFT_PANEL_MAXWIDTH}px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  & > *:first-child {
    width: 100%;
    max-width: ${LEFT_PANEL_MAXWIDTH}px;
  }

  height: 100%;
  position: relative;
  overflow: hidden;
`;

const FooterWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export default SceneGrid;
