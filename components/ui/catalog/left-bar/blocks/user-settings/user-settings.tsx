import { useAuth } from "@/components/services/auth-service/auth-provider";
import TabPanel from "@/components/ui/scene/settings/blocks/tab-panel";
import {
  AccordionBox,
  AccordionWrapper,
  ModalBox,
  TabsBox,
} from "@/components/ui/scene/settings/settings";
import { ParamItem } from "@/components/ui/scene/widgets-panel/widgets/pointcloud-handler-widget/blocks/overall-form copy";
import {
  Box,
  Button,
  Divider,
  Modal,
  Paper,
  Slider,
  Tab,
  Tabs,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Check, Close } from "@mui/icons-material";

const UserSettings: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [username, setUsername] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { userMetadata, authService } = useAuth();

  useEffect(() => {
    authService.updateTheme(isDarkTheme ? 1 : undefined);
  });

  useEffect(() => {
    if (!userMetadata) return;

    setUsername(userMetadata.username);
  }, [userMetadata]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      from: "user2",
      message: "Request to join your workspace as Editor",
    },
    {
      id: 2,
      from: "user8",
      message: "Request to join your workspace as Viewer",
    },
  ]);

  const handleAllow = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
    // Here you can add your logic to allow the user into the workspace
  };

  const handleDeny = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
    // Here you can add your logic to deny the user request
  };

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
            <TabsBox>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{ borderRight: 1, borderColor: "divider" }}
              >
                <Tab
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignContent: "center",
                        gap: "10px",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: "27px",
                          minHeight: "27px",
                          borderRadius: "9px",
                          backgroundColor: "#2689FF",
                        }}
                      />

                      <Box
                        data-type="tab-content"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>User Profile</Box>
                        <Box>Profile and UI Tweaks</Box>
                      </Box>
                    </Box>
                  }
                />

                <Tab
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignContent: "center",
                        gap: "10px",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: "27px",
                          minHeight: "27px",
                          borderRadius: "9px",
                          backgroundColor: "#2689FF",
                        }}
                      />

                      <Box
                        data-type="tab-content"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>Notifications</Box>
                        <Box>requests</Box>
                      </Box>
                    </Box>
                  }
                />
              </Tabs>
            </TabsBox>

            <Divider orientation="vertical" flexItem />

            <TabPanel value={value} index={0}>
              <Paper
                data-type="sec"
                sx={{
                  minWidth: "500px",
                }}
              >
                <AccordionBox>
                  <AccordionWrapper title={"User Profile"}>
                    <ParamItem data-type="overall">
                      <Box>Username</Box>
                      <Box>
                        <TextField
                          fullWidth
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </Box>
                    </ParamItem>
                  </AccordionWrapper>

                  <AccordionWrapper title={"UI Tweaks"}>
                    <ParamItem data-type="overall">
                      <Box>Theme</Box>
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isDarkTheme}
                              onChange={(e) => setIsDarkTheme(e.target.checked)}
                            />
                          }
                          label="Dark Theme"
                        />
                      </Box>
                    </ParamItem>
                  </AccordionWrapper>

                  <Button
                    sx={{
                      margin: "10px",
                    }}
                    variant="contained"
                    color="primary"
                  >
                    Save
                  </Button>
                </AccordionBox>
              </Paper>
            </TabPanel>

            <TabPanel value={value} index={1}>
              <Paper
                data-type="sec"
                sx={{
                  minWidth: "500px",
                  display: "flex",
                }}
              >
                <List
                  sx={{
                    width: "100%",
                  }}
                >
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: "10px",
                          width: "100%",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <ListItemText
                          sx={{ fontSize: "12px" }}
                          primary={`From: ${notification.from}`}
                          secondary={notification.message}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAllow(notification.id)}
                          >
                            Allow
                          </Button>

                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleAllow(notification.id)}
                          >
                            Ignore
                          </Button>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </TabPanel>
          </Box>
        </ModalBox>
      </Box>
    </Modal>
  );
};

export default UserSettings;
