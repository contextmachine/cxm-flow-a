import { useWorkspace } from "@/components/services/workspace-service/workspace-provider";
import styled from "styled-components";
import { Box } from "@mui/material";
import {
  CollectionDto,
  MinifiedWorkspaceDto,
} from "@/components/services/workspace-service/workspace-service.types";
import WorkspaceItem from "../workspace-item/workspace-item";

const WorkspacesList: React.FC<{
  collection: CollectionDto;
  workspaces: MinifiedWorkspaceDto[];
}> = ({ workspaces, collection }) => {
  const { activeWorkspace, workspaceService, collections } = useWorkspace();

  return (
    <MenuWrapper>
      {workspaces.map((item, i) => (
        <Box sx={{ width: "100%" }} key={i}>
          <WorkspaceItem
            item={item}
            parentCollection={collection}
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
