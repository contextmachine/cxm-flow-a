import { Box, Button, Menu, MenuItem, Popover } from "@mui/material";
import styled from "styled-components";
import { Title } from "../../scene/bar/bar.styled";
import moment from "moment";
import stc from "string-to-color";
import { UserMetadata } from "@/components/services/auth-service/auth-service.types";
import { Ava } from "../styles/styles";
import SceneEntity from "@/components/services/workspace-service/entities/scene-entity";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import { MinifiedWorkspaceDto } from "@/components/services/workspace-service/workspace-service.types";

interface CatalogItemProps {
  id: number;
  name: string;
  created_at: string;
  user_workspaces: { user: UserMetadata }[];
}

const CatalogItem: React.FC<CatalogItemProps> = ({
  id,
  name,
  created_at,
  user_workspaces,
}) => {
  const { workspaces, collections, workspaceService } = useWorkspace();

  const allWorkspaces = useMemo(() => {
    const all: MinifiedWorkspaceDto[] = [];
    collections.forEach((collection) => {
      all.push(...collection.collection_workspaces.map((cw) => cw.workspace));
    });

    return all;
  }, [collections]);

  const handleNavigate = (e: any) => {
    e.preventDefault(); // Prevent default link behavior
    window.location.href = `/scene/${id}`; // Navigate with a full page reload
  };

  const date = moment(created_at).fromNow();

  const [anchorEl, setAnchorEl] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    event.stopPropagation();
    event.preventDefault();

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMoveAnchorEl(null);
  };

  const handleMoveClick = (event: any) => {
    event.stopPropagation();
    event.preventDefault();

    setMoveAnchorEl(event.currentTarget);
  };

  const handleMove = (collectionId: number) => {
    workspaceService.moveSceneToWorkspace(id, collectionId);
    handleClose();
  };

  const handleDelete = () => {
    workspaceService.deleteScene(id);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const moveOpen = Boolean(moveAnchorEl);

  return (
    <>
      <Wrapper onClick={handleNavigate}>
        <Thumb>
          <Box
            sx={{
              display: "flex",
              gap: "4px",
            }}
            data-type="actions"
          >
            <Button
              onClick={handleClick}
              variant="contained"
              color="primary"
              size="small"
              sx={{
                minWidth: "24px",
                minHeight: "24px",
                borderRadius: "50%",
                padding: "0",
                fontSize: "12px",
                color: "white !important",
              }}
            >
              ...
            </Button>
          </Box>
        </Thumb>

        <Box
          sx={{
            display: "flex",
            columnGap: "18px",
            justifyContent: "space-between",
            width: "100%",
            padding: "0px 18px",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Title size="large">{name}</Title>
            <Title>Modified {date}</Title>
          </Box>

          {/* <Box sx={{ display: "flex" }}>
          {user_workspaces.map((user, i: number) => {
            return (
              <Ava
                color={stc(user.user.username)}
                data-userid={user.user.id}
                key={i}
              />
            );
          })}
        </Box> */}
        </Box>
      </Wrapper>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{
          maxWidth: "max-content !important",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            maxWidth: "max-content",
          }}
        >
          <Button
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              textTransform: "none",
            }}
            variant="contained"
            data-active={false}
            color="secondary"
            size="large"
            onClick={handleMoveClick}
            endIcon={<ArrowRightIcon />}
          >
            Move
          </Button>

          <Button
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              textTransform: "none",
            }}
            variant="contained"
            data-active={false}
            color="secondary"
            size="large"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Popover>

      <Menu
        anchorEl={moveAnchorEl}
        open={moveOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {allWorkspaces.map((collection) => (
          <MenuItem
            key={collection.id}
            onClick={() => handleMove(collection.id)}
          >
            {collection.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 9px;
  position: relative;
  height: max-content;

  cursor: pointer;
`;

const Thumb = styled.div`
  width: 100%;
  padding-bottom: 50%;
  border-radius: 18px;
  background: white;
  position: relative;

  background-color: white;
  background-image: url("/test-thumbs/1.jpg");
  background-repeat: no-repeat;
  background-position: center;

  & > [data-type="actions"] {
    position: absolute;
    top: 9px;
    right: 9px;
    opacity: 0;
    pointer-events: none;
  }

  &:hover > [data-type="actions"] {
    opacity: 1;
    pointer-events: all;
  }
`;

export default CatalogItem;
