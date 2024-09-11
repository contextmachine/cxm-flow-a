import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import OutlinerExtension from "../outliner-extension";
import { useSubscribe } from "@/src/hooks";
import TreeItem from "./tree-item";
import { useEffect, useRef, useState } from "react";
import { Box, IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import CodeIcon from "@/components/ui/icons/code-icon";
import StackIcon from "@/components/ui/icons/stack-icon";
import QueriesComponent from "./queries/queries";
import { Tabs } from "@/components/ui/scene/primitives/tabs/tabs";

interface OutlinerWidgetProps {
  isPreview?: boolean;
  extension: OutlinerExtension;
}

const outlinerTabs = [
  { name: "Layers", icon: <StackIcon /> },
  { name: "Queries", icon: <CodeIcon /> },
];

const OutlinerWidget: React.FC<OutlinerWidgetProps> = ({
  isPreview,
  extension,
}) => {
  const [tab, setTab] = useState(0);
  const tree = useSubscribe(extension.$tree, extension.tree);
  const [search, setSearch] = useState("");

  const onTabChange = (e: number) => {
    setTab(e);
  };

  useEffect(() => {
    extension.onFilter(search);
  }, [search]);

  return (
    <WidgetPaper isPreview={isPreview} title={"Outliner"}>
      <Tabs $activeTab={tab} className="outliner-tabs">
        {outlinerTabs.map((x, index) => (
          <div
            key={index}
            className={`tab ${tab === index ? "active" : ""}`}
            onClick={(e) => onTabChange(index)}
          >
            {x.icon}
            {x.name}
          </div>
        ))}
      </Tabs>
      {tab === 0 && (
        <>
          <OutlinerSearch>
            <input
              value={search}
              placeholder="Type for search"
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
            {search == "" && <SearchIcon className="search-icon" />}
            {search !== "" && (
              <IconButton
                className="clear-button"
                onClick={(e) => setSearch("")}
              >
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
        </>
      )}
      {tab === 1 && <QueriesComponent queryControl={extension.queryControl} />}
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
