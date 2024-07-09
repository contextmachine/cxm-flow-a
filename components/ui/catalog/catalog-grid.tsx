import styled, { css } from "styled-components";
import LeftBar from "./left-bar/left-bar";
import Content from "./content/content";
import RightBar from "./right-bar/right-bar";

const CatalogGrid = () => {
  return (
    <Wrapper>
      <Grid>
        <LeftBarWrapper>
          <LeftBar />
        </LeftBarWrapper>

        <ContentWrapper>
          <Content />
        </ContentWrapper>

        <RightBarWrapper>
          <RightBar />
        </RightBarWrapper>
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
  margin: 27px 18px 0px 18px;
  width: 100%;

  display: grid;
  grid-template-columns: 225px auto 260px;
  gap: 27px;

  & > * > * {
    pointer-events: all;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;

  overflow-y: scroll;
  overflow-x: hidden;

  gap: 18px;
`;

const BarWrapper = css`
  & {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    overflow-y: scroll;

    gap: 9px;
  }
`;

const LeftBarWrapper = styled.div`
  ${BarWrapper}
`;

const RightBarWrapper = styled.div`
  ${BarWrapper}
`;

export default CatalogGrid;
