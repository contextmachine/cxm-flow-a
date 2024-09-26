import { useMessage } from "@/src/hooks";
import {
  Alert,
  IconButton,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import React, { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface MessageProps {}

export type MessageType = Message | undefined;

export interface Message {
  message: string;
  status: "success" | "warning" | "info" | "error";
}

const Message: React.FC<MessageProps> = (props: MessageProps) => {
  const message = useMessage();

  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (message) {
      setOpen(true);
    }
  }, [message]);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      action={
        <React.Fragment>
          <IconButton aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </React.Fragment>
      }
    >
      <Alert
        onClose={handleClose}
        severity={message?.status}
        variant="outlined"
        sx={{ width: "100%" }}
      >
        {message?.message}
      </Alert>
    </Snackbar>
  );
};

export default Message;
