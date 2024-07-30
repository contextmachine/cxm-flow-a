import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import OutlinerExtension from "../outliner-extension";
import { useSubscribe } from "@/src/hooks";
import TreeItem from "./tree-item";
import { useEffect, useState } from "react";
import { Icon, IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
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
        {search == "" && <SearchIcon className="search-icon" />}
        {search !== "" && (
          <IconButton className="clear-button" onClick={(e) => setSearch("")}>
            <CancelIcon />
          </IconButton>
        )}
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
