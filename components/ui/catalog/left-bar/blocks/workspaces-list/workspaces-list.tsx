import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import stc from "string-to-color";
import { IconBullet } from "../../left-bar";
import styled from "styled-components";
import { Box, Button } from "@mui/material";
import { MinifiedWorkspaceDto } from "@/components/services/workspace-service/workspace-service.types";
import WorkspaceItem from "../workspace-item/workspace-item";

const WorkspacesList: React.FC<{
  workspaces: MinifiedWorkspaceDto[];
}> = ({ workspaces }) => {
  const { activeWorkspace, workspaceService, collections } = useWorkspace();

  return (
    <MenuWrapper>
      {workspaces.map((item, i) => (
        <Box sx={{ width: "100%" }} key={i}>
          <WorkspaceItem
            item={item}
            activeWorkspace={activeWorkspace}
            workspaceService={workspaceService}
            collections={collections}
          />
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
      color: var(--main-text-color);
    }
  }
`;

export default WorkspacesList;
