import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import stc from "string-to-color";
import { IconBullet } from "../../left-bar";
import styled from "styled-components";
import { Box, Button } from "@mui/material";

const WorkspacesList = () => {
  const { workspaces, activeWorkspace, workspaceService } = useWorkspace();

  return (
    <MenuWrapper>
      {workspaces.map((item, i) => (
        <Box sx={{ width: "100%" }} key={i}>
          <Button
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              textTransform: "none",
            }}
            variant="contained"
            color="secondary"
            size="large"
            data-active={item.id === activeWorkspace?.id}
            onClick={() => workspaceService.setActiveWorkspace(item.id)}
            startIcon={<IconBullet color={stc(`${item.id}`)} />}
          >
            {item?.name}
          </Button>
        </Box>
      ))}
    </MenuWrapper>
  );
};

export const MenuWrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 0px;

  &&&&& {
    &,
    & * {
      font-size: 12px;
      color: #333333;
    }
  }
`;

export default WorkspacesList;
