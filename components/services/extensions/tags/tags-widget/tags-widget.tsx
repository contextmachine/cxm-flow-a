import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import { useState } from "react";
import TagExtension from "./tags-extension";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";

interface TagWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const TagWidget: React.FC<TagWidgetProps> = ({ isPreview, extension }) => {
  const viewer = useViewer();
  const tagService = extension;

  console.log("%cTagWidget", "color: red", tagService);

  return (
    <WidgetPaper isPreview={isPreview} title={"Tags"}>
      Tags
    </WidgetPaper>
  );
};

export default TagWidget;

const Tabs = styled.div<{ $activeTab: number }>`
  width: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  background-color: var(--main-bg-color);
  height: 30px;
  border-radius: 9px;
  padding: 3px;

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
  }
  .tab.active {
    background-color: var(--paper-bg-color);
    border-radius: 6px;
    box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.1);
  }
`;

const OutlinerSearch = styled.div`
  width: 100%;
  font-size: 12px;
  display: flex;
  min-height: 25px;
  display: flex;
  justify-content: start;
  width: 100%;
  border-radius: 9px;
  padding: 2px;
  background-color: var(--select-bg-color);
  border: 1px solid var(--box-border-color);

  input {
    width: 100%;
    border: 0px;
    background-color: transparent;
    &:focus-visible {
      outline: -webkit-focus-ring-color auto 0px;
    }
  }
  .search-icon {
    margin-right: 3px;
    align-self: center;
    font-size: 14px;
    fill: grey;
  }

  .clear-button {
    margin-right: 3px;
    * {
      font-size: 14px;
      fill: grey;
    }
  }
`;

const TreeContainer = styled.div`
  width: 100%;
  display: block;
  flex-direction: column;
  gap: 6px;
  max-height: 500px;
  min-height: 150px;
  overflow: auto;
`;
