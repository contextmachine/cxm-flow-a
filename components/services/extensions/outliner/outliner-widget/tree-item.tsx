import GroupIcon from "@/components/ui/icons/entities-icons/group-icon";
import MeshIcon from "@/components/ui/icons/entities-icons/mesh-icon";
import ExpandIcon from "@/components/ui/icons/expand-icon";
import { Entity } from "@/src/objects/entities/entity";
import React, { useState } from "react";
import styled from "styled-components";
import OutlinerExtension from "../outliner-extension";

interface TreeItemProps {
  extension: OutlinerExtension;
  item: Entity;
}

const TreeItem: React.FC<TreeItemProps> = (props: TreeItemProps) => {
  const { item, extension } = props;
  const [expanded, setExpanded] = useState(false);

  const onItemClick = () => {
    extension.onItemClick(item);
  };

  return (
    <>
      <TreeItemWrapper expanded={expanded} key={item.id}>
        <LineWrapper onClick={() => onItemClick()}>
          {item.children && item.children.length > 0 && (
            <ExpandButton
              expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              <ExpandIcon />
            </ExpandButton>
          )}
          <EntityIcon count={item.children?.length}>
            {entityIcon(item)}
            {item.children?.length}
          </EntityIcon>
          {item.name}
        </LineWrapper>
        <ChildrenContainer expanded={expanded}>
          {item.children?.map((x) => (
            <TreeItem item={x} extension={extension} />
          ))}
        </ChildrenContainer>
      </TreeItemWrapper>
    </>
  );
};

export default TreeItem;

const entityIcon = (entity: Entity) => {
  switch (entity.type) {
    case "group":
      return <GroupIcon />;
    case "mesh":
      return <MeshIcon />;
    default:
      return <MeshIcon />;
  }
};

const TreeItemWrapper = styled.div<{ expanded: boolean }>`
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const LineWrapper = styled.li`
  display: flex;
  flex-direction: row;
  margin-top: 3px;
  margin-bottom: 3px;
  align-items: center;
  height: 21px;
  border-radius: 9px;
  cursor: pointer;
  &:hover {
    background-color: #f3f3f3;
  }
`;

const ExpandButton = styled.button<{ expanded: boolean }>`
  background-color: transparent;
  width: 15px;
  border: 0px;
  cursor: pointer;
  transform: ${({ expanded }) => (expanded ? "rotate(90deg)" : "none")};
  transition: transform 0.2s ease;
`;

const EntityIcon = styled.div<{ count: number | undefined }>`
  background-color: ${({ count }) =>
    count !== undefined ? "#f3f3f3" : "transparent"};
  margin: 0px 3px;
  border-radius: 9px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0px 4px;
`;

const ChildrenContainer = styled.div<{ expanded: boolean }>`
  display: ${({ expanded }) => (expanded ? "flex" : "none")};
  margin-left: 5px;
  flex-direction: column;
`;
