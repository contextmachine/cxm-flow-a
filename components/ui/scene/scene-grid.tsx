import styled from "styled-components";
import Bar from "./bar/bar";
import ToolsPanel from "./tools-panel/tools-panel";
import BarUser from "./bar-users/bar-user";
import dynamic from "next/dynamic";
import WidgetPanelGrid from "./widgets-panel/widget-panel-grid";

const SceneGrid = () => {
  return (
    <Wrapper>
      <Grid>
        <BarWrapper>
          <Bar />

          <BarUser />
        </BarWrapper>

        <ContentWrapper>
          <WidgetPanelGrid />
        </ContentWrapper>
      </Grid>

      <FooterWrapper>
        <ToolsPanel />
      </FooterWrapper>
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
  margin: 9px 9px 0px 9px;
  width: 100%;

  display: grid;
  grid-template-rows: 45px auto;
  grid-row-gap: 9px;

  & > * > * {
    pointer-events: all;
  }

  & > * > * {
    height: 100%;
  }
`;

const LEFT_PANEL_MAXWIDTH = 366;
const RIGHT_PANEL_MAXWIDTH = 270;

const BarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  & > *:first-child {
    width: 100%;
    max-width: ${LEFT_PANEL_MAXWIDTH}px;
  }

  & > *:last-child {
    width: 100%;
    max-width: ${RIGHT_PANEL_MAXWIDTH}px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  & > div {
    pointer-events: none;

    & > * {
      pointer-events: all;
    }
  }

  & .drop-zone {
    background-color: #2689ff !important;
    overflow: hidden;
    height: 8px;
    padding: 0;
    position: relative;

    & * {
      display: none;
    }
  }

  & div[data-type="widgets-panel"] {
    width: 100%;
    max-width: ${LEFT_PANEL_MAXWIDTH}px;
    min-width: ${LEFT_PANEL_MAXWIDTH}px;
  }

  & div[data-type="properties-panel"] {
    width: 100%;
    max-width: ${RIGHT_PANEL_MAXWIDTH}px;
    min-width: ${RIGHT_PANEL_MAXWIDTH}px;
  }

  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  & > * {
    width: 100%;
  }
`;

const FooterWrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 45px;
  bottom: 10px;

  display: flex;
  justify-content: center;
`;

export default SceneGrid;
