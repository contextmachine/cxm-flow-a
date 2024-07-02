import { Box, Modal } from "@mui/material";
import styled from "styled-components";

const MembersModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <ModalBox>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              minHeight: 400,
              height: "max-content",
              gap: "10px",
            }}
          >
            sdfsdfsdfsdfsdf
          </Box>
        </ModalBox>
      </Box>
    </Modal>
  );
};

const ModalBox = styled(Box)`
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--paper-bg-color);
    opacity: 0.5;
  }

  position: relative;

  padding: 9px;
  border-radius: 27px;
  overflow: hidden;
  margin: auto;

  display: flex;
`;

export default MembersModal;
