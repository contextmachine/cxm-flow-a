import GroupIcon from "@/components/ui/icons/entities-icons/group-icon";
import MeshIcon from "@/components/ui/icons/entities-icons/mesh-icon";
import ExpandIcon from "@/components/ui/icons/expand-icon";
import { Entity } from "@/src/objects/entities/entity";
import React, { use, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import OutlinerExtension, { OutlinerItem } from "../outliner-extension";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useViewer } from "@/components/services/scene-service/scene-provider";

interface TreeItemProps {
  extension: OutlinerExtension;
  item: OutlinerItem;
  search?: string;
}

const TreeItem: React.FC<TreeItemProps> = (props: TreeItemProps) => {
  const { item, extension, search } = props;

  const viewer = useViewer();

  const [expanded, setExpanded] = useState(item.expanded);
  const [selected, setSelected] = useState(item.selected);
  const [isGroupActive, setGroupActive] = useState(item.isGroupActive);
  const [visibility, setVisibility] = useState(item.entity.visibility);
  const [isShowed, setIsShowed] = useState(item.isShowed);

  const [itemClicked, setItemClicked] = useState(false);

  useEffect(() => {
    item.entity.setVisibility(visibility);
  }, [visibility]);

  const itemRef = useRef(null);

  const scrollToItem = () => {
    if (isShowed) {
      (itemRef.current as any).scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsShowed(item.isShowed);
  }, [item.isShowed]);

  useEffect(() => {
    setSelected(item.selected);
    if (item.selected && !itemClicked) {
      scrollToItem();
    }
    if (itemClicked) {
      setItemClicked(false);
    }
  }, [item.selected]);

  useEffect(() => {
    setExpanded(item.expanded);
    if (item.expanded) {
      scrollToItem();
    }
  }, [item.expanded]);

  useEffect(() => {
    setGroupActive(item.isGroupActive);
    if (item.isGroupActive) {
      scrollToItem();
    }
  }, [item.isGroupActive]);

  const onItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setItemClicked(true);
    extension.onItemClick(e, item.entity);
  };

  return (
    <>
      {isShowed && (
        <TreeItemWrapper key={item.entity.id}>
          <LineWrapper
            ref={itemRef}
            $selected={selected}
            onClick={(e) => onItemClick(e)}
          >
            <LeftContentWrapper>
              {item.entity.children && item.entity.children.length > 0 && (
                <ExpandButton
                  $expanded={expanded}
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
                onClick={(e) => {
                  viewer.controls.fitToObjects([item.entity.bbox.box]);
                }}
                $count={item.children?.length}
                $isGroupActive={isGroupActive}
              >
                {entityIcon(item.entity)}
                {item.children?.length}
              </EntityIcon>
              <LabelWrapper>{item.entity.name}</LabelWrapper>
            </LeftContentWrapper>
            <VisibiltyButton
              onClick={(e) => {
                e.stopPropagation();
                setVisibility(!visibility);
              }}
            >
              {visibility && <VisibilityIcon className="visibility-icon" />}
              {!visibility && (
                <VisibilityOffIcon className="unvisibility-icon" />
              )}
            </VisibiltyButton>
          </LineWrapper>
          {expanded && (
            <ChildrenContainer>
              {item.children?.map((x) => (
                <TreeItem item={x} extension={extension} search={search} />
              ))}
            </ChildrenContainer>
          )}
        </TreeItemWrapper>
      )}
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

const VisibiltyButton = styled.button`
  background-color: transparent;
  border: 0px;
  margin-right: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  svg {
    width: 16px;
  }

  .unvisibility-icon {
    fill: gray;
  }
`;

const TreeItemWrapper = styled.div`
  margin-left: 5px;
  display: block;
  flex-direction: column;
  justify-content: center;
`;

const LeftContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(100% - 30px);
`;

const LabelWrapper = styled.div`
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const LineWrapper = styled.li<{ $selected: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 3px;
  margin-bottom: 3px;
  align-items: center;
  height: 21px;
  border-radius: 9px;
  cursor: pointer;
  background-color: ${({ $selected }) =>
    $selected ? "#bce1ff" : "transparent"};

  &:hover {
    background-color: ${({ $selected }) =>
      $selected ? "#abd9fe" : "var(--button-secondary-hover-color)"};
  }

  .visibility-icon {
    display: none;
  }

  &:hover .visibility-icon {
    display: flex;
  }
`;

const ExpandButton = styled.button<{ $expanded: boolean }>`
  background-color: transparent;
  width: 15px;
  border: 0px;
  cursor: pointer;
  transform: ${({ $expanded }) => ($expanded ? "rotate(90deg)" : "none")};
  transition: transform 0.2s ease;
`;

const EntityIcon = styled.div<{
  $count: number | undefined;
  $isGroupActive: boolean;
}>`
  background-color: ${({ $count, $isGroupActive }) =>
    $count !== undefined
      ? $isGroupActive
        ? "#fec779"
        : "var(--button-secondary-color)"
      : "transparent"};
  margin: 0px 3px;
  border-radius: 9px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0px 4px;

  svg {
    justify-self: center;
    align-items: center;
  }

  svg * {
    stroke: var(--main-text-color);
  }

  &:hover {
    color: var(--button-primary-color);
    svg * {
      stroke: var(--button-primary-color);
    }
  }
`;

const ChildrenContainer = styled.div`
  margin-left: 5px;
  flex-direction: column;
`;
