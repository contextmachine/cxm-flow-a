import GroupIcon from "@/components/ui/icons/entities-icons/group-icon";
import MeshIcon from "@/components/ui/icons/entities-icons/mesh-icon";
import ExpandIcon from "@/components/ui/icons/expand-icon";
import { Entity } from "@/src/objects/entities/entity";
import React, { use, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import OutlinerExtension, { OutlinerItem } from "../outliner-extension";

interface TreeItemProps {
  extension: OutlinerExtension;
  item: OutlinerItem;
}

const TreeItem: React.FC<TreeItemProps> = (props: TreeItemProps) => {
  const { item, extension } = props;

  const [expanded, setExpanded] = useState(item.expanded);
  const [selected, setSelected] = useState(item.selected);
  const [isGroupActive, setGroupActive] = useState(item.isGroupActive);

  const itemRef = useRef(null);

  useEffect(() => {
    setSelected(item.selected);
    if (item.selected) {
      (itemRef.current as any).scrollIntoView({ behavior: "smooth" });
    }
  }, [item.selected]);

  useEffect(() => {
    setExpanded(item.expanded);
    if (item.expanded) {
      (itemRef.current as any).scrollIntoView({ behavior: "smooth" });
    }
  }, [item.expanded]);

  useEffect(() => {
    setGroupActive(item.isGroupActive);
    if (item.isGroupActive) {
      (itemRef.current as any).scrollIntoView({ behavior: "smooth" });
    }
  }, [item.isGroupActive]);

  const onItemClick = (e: any) => {
    extension.onItemClick(item.entity);
  };

  return (
    <>
      <TreeItemWrapper key={item.entity.id}>
        <LineWrapper
          ref={itemRef}
          selected={selected}
          onClick={(e) => onItemClick(e)}
        >
          {item.entity.children && item.entity.children.length > 0 && (
            <ExpandButton
              expanded={expanded}
              onClick={(e) => {
                item.expanded = !expanded;
                setExpanded(!expanded);
                e.stopPropagation();
              }}
            >
              <ExpandIcon />
            </ExpandButton>
          )}
          <EntityIcon
            count={item.children?.length}
            isGroupActive={isGroupActive}
          >
            {entityIcon(item.entity)}
            {item.children?.length}
          </EntityIcon>
          {item.entity.name}
        </LineWrapper>
        {expanded && (
          <ChildrenContainer>
            {item.children?.map((x) => (
              <TreeItem item={x} extension={extension} />
            ))}
          </ChildrenContainer>
        )}
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

const TreeItemWrapper = styled.div`
  margin-left: 5px;
  display: block;
  flex-direction: column;
  justify-content: center;
`;

const LineWrapper = styled.li<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  margin-top: 3px;
  margin-bottom: 3px;
  align-items: center;
  height: 21px;
  border-radius: 9px;
  cursor: pointer;
  background-color: ${({ selected }) => (selected ? "#bce1ff" : "transparent")};

  &:hover {
    background-color: ${({ selected }) => (selected ? "#abd9fe" : "#f3f3f3")};
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

const EntityIcon = styled.div<{
  count: number | undefined;
  isGroupActive: boolean;
}>`
  background-color: ${({ count, isGroupActive }) =>
    count !== undefined
      ? isGroupActive
        ? "#fec779"
        : "#f3f3f3"
      : "transparent"};
  margin: 0px 3px;
  border-radius: 9px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0px 4px;
`;

const ChildrenContainer = styled.div`
  margin-left: 5px;
  flex-direction: column;
`;
