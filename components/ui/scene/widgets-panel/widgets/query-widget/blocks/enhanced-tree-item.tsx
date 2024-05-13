import {
  unstable_useTreeItem2 as useTreeItem2,
  UseTreeItem2Parameters,
} from "@mui/x-tree-view/useTreeItem2";
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2GroupTransition,
  TreeItem2Root,
} from "@mui/x-tree-view/TreeItem2";
import { useTreeItem2Utils } from "@mui/x-tree-view/hooks";
import { UseTreeItem2ContentSlotOwnProps } from "@mui/x-tree-view/useTreeItem2";
import { TreeItem2Provider } from "@mui/x-tree-view/TreeItem2Provider";

import React from "react";
import styled from "styled-components";
import TreeItemLabel from "./tree-item-label";

const EnhancedTreeItemProvider = TreeItem2Provider as any;

const EnhancedTreeItem = React.forwardRef<HTMLLIElement, EnhancedTreeItemProps>(
  function EnhancedTreeItem(
    { id, itemId, label, disabled, children, ...other },
    ref
  ) {
    // Custom hook to manage tree item state and behavior
    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getGroupTransitionProps,
      status,
      publicAPI,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

    // Function to toggle visibility of a model in the viewer
    const toggleVisibility = (
      dbId: number,
      modelId: number,
      isVisible: boolean
    ) => {
      return true;
    };

    // Utility hook to get item interactions
    const { interactions } = useTreeItem2Utils({
      itemId: itemId,
      children: children,
    });

    // Retrieve specific item details
    const item = publicAPI.getItem(itemId);
    const contentProps = getContentProps();

    // Event handlers for different user interactions
    const handleContentClick: UseTreeItem2ContentSlotOwnProps["onClick"] = (
      event
    ) => {
      event.defaultMuiPrevented = true;
      interactions.handleSelection(event);
    };

    const handleIconContainerClick = (event: React.MouseEvent) => {
      event.stopPropagation();

      interactions.handleExpansion(event);
    };

    // Click handler for toggling visibility
    const handleVisibilityClick = (e: any) => {
      e.stopPropagation();
      toggleVisibility(item.dbId, item.modelId, item.isVisible);
    };

    return (
      <EnhancedTreeItemProvider itemId={itemId}>
        <TreeItem2Root
          {...getRootProps(other)}
          className="MuiTreeItem-root"
          data-visible={item.isVisible ? "true" : "false"}
          data-loaded={!(item.isMain && !item.isLoaded) ? "true" : "false"}
        >
          <EnhancedTreeItemContent
            {...{ ...contentProps, onClick: handleContentClick }}
            data-priority={item.isMain ? "main" : ""}
            data-children={item.children.length > 0 ? "true" : "false"}
            data-folder={!item.elementId ? "true" : "false"}
            className={`MuiTreeItem-content ${
              status.selected ? "Mui-selected" : ""
            } ${status.focused ? "Mui-focused" : ""}`}
          >
            <TreeItem2IconContainer
              {...{
                ...getIconContainerProps(),
                onClick: handleIconContainerClick,
              }}
            >
              <Icon
                data-status={status.expanded ? "expanded" : "none"}
                data-expandable={status.expandable ? "true" : "false"}
              />
            </TreeItem2IconContainer>

            <TreeItemLabel
              handleVisibilityClick={handleVisibilityClick}
              item={item}
            />
          </EnhancedTreeItemContent>
          {children && (
            <TreeItem2GroupTransition {...getGroupTransitionProps()} />
          )}
        </TreeItem2Root>
      </EnhancedTreeItemProvider>
    );
  }
);

const Icon = styled.div`
  &&&&&& {
    width: 15px;
    min-width: 15px;
    height: 15px;

    &[data-expandable="true"] {
      background-image: url("/icons/arrow-tree-item.svg");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;

      &[data-status="none"] {
        transform: rotate(-90deg);
      }

      &[data-status="expanded"] {
        transform: rotate(0deg);
      }
    }
  }
`;

const EnhancedTreeItemContent = styled(TreeItem2Content)`
  & {
    overflow: hidden;
    height: 32px !important;
  }
`;

interface EnhancedTreeItemProps
  extends Omit<UseTreeItem2Parameters, "rootRef">,
    Omit<React.HTMLAttributes<HTMLLIElement>, "onFocus"> {}

export default EnhancedTreeItem;
