import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import OutlinerExtension from "../outliner-extension";
import { useSubscribe } from "@/src/hooks";
import TreeItem from "./tree-item";
import { useEffect, useState } from "react";

interface OutlinerWidgetProps {
  isPreview?: boolean;
  extension: OutlinerExtension;
}

const OutlinerWidget: React.FC<OutlinerWidgetProps> = ({
  isPreview,
  extension,
}) => {
  const tree = useSubscribe(extension.$tree, extension.tree);
  const [search, setSearch] = useState("");

  useEffect(() => {
    console.log(search);
    extension.onFilter(search);
  }, [search]);

  return (
    <WidgetPaper isPreview={isPreview} title={"Outliner"}>
      <OutlinerSearch>
        <input
          value={search}
          placeholder="Type for search"
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </OutlinerSearch>
      <TreeContainer>
        {tree.map((x) => (
          <TreeItem
            item={x}
            extension={extension}
            key={x.entity.id}
            search={search}
          />
        ))}
      </TreeContainer>
    </WidgetPaper>
  );
};

export default OutlinerWidget;

const OutlinerSearch = styled.div`
  width: 100%;
  font-size: 12px;
  display: flex;

  input {
    min-height: 25px;
    display: flex;
    justify-content: start;
    width: 100%;

    background-color: var(--select-bg-color);
    border: 1px solid var(--box-border-color);
    border-radius: 9px;
    padding: 2px;

    &:focus-visible {
      outline: -webkit-focus-ring-color auto 0px;
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
