import { Box, Button, Modal, Paper, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useQueryWidget } from "../../query-widget";

const EditForm = () => {
  const { openedEditForm, queryExtension, editQueryId } = useQueryWidget();

  const [name, setName] = useState<string>("");
  const [endpoint, setEndpoint] = useState<string>("");

  const isNew = typeof editQueryId !== "number";

  useEffect(() => {
    if (typeof editQueryId === "number") {
      const query = queryExtension?.getQuery(editQueryId);
      if (!query) return;

      const name = query.name;
      const endpoint = query.endpoint;

      setName(name);
      setEndpoint(endpoint);
    } else {
      setName("");
      setEndpoint("");
    }
  }, [editQueryId]);

  const handleSave = () => {
    // Save logic here
  };

  const handleDelete = () => {
    // Delete logic here
  };

  return (
    <>
      <Modal
        open={openedEditForm}
        onClose={() => queryExtension?.closeEditForm()}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            padding: "20px",
            minWidth: "200px",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <form onSubmit={handleSave} style={{ width: "100%" }}>
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <TextField
                //label="Name"
                placeholder="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
              />
              <TextField
                placeholder="Endpoint"
                //label="Endpoint"
                variant="outlined"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                margin="normal"
              />

              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                {!isNew ? (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    sx={{
                      backgroundColor: "white !important",
                      borderColor: "red !important",
                      color: "red",
                      border: "1px solid",
                    }}
                  >
                    Delete
                  </Button>
                ) : (
                  <Box />
                )}

                <Button type="submit" variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Modal>
    </>
  );
};

export default EditForm;
