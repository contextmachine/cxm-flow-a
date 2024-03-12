import styled from "styled-components";

const Viewer = () => {
  return (
    <>
      <ViewerBackground />
    </>
  );
};

const ViewerBackground = styled.div`
  background-color: #eeeeee;
  height: 100%;
  width: 100%;

  position: absolute;
`;

export default Viewer;
