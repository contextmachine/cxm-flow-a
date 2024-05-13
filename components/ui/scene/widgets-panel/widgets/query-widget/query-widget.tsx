import EnhancedTreeItem from "./blocks/enhanced-tree-item";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import WidgetPaper from "../../blocks/widget-paper/widget-paper";
import styled from "styled-components";
import SearchBar from "../../blocks/search-bar/search-bar";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useScene } from "@/components/services/scene-service/scene-provider";
import QueryExtension from "@/components/services/extension-service/extensions/query-extension/query-extension";
import { QuerySectionTreeItem } from "@/components/services/extension-service/extensions/query-extension/query-extension.types";
import EditForm from "./blocks/edit-form/edit-form";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";

const TreeView = RichTreeView;

interface QueryWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const QueryWidget: React.FC<QueryWidgetProps> = ({ isPreview, extension }) => {
  const treeViewRef = useRef<any>(null);
  const apiRef = useRef<any>(null);

  const [queryExtension] = useState<QueryExtension | null>(
    extension as QueryExtension
  );

  const [treeData, setTreeData] = useState<QuerySectionTreeItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [openedEditForm, setOpenedEditForm] = useState(false);
  const [editQueryId, setEditQueryId] = useState<number | null>(null);

  useEffect(() => {
    if (queryExtension) {
      const treeDataSub = queryExtension.treeData$.subscribe(setTreeData);
      const oefSub =
        queryExtension.openedEditForm$.subscribe(setOpenedEditForm);
      const eqiSub = queryExtension.editQueryId$.subscribe(setEditQueryId);

      return () => {
        treeDataSub.unsubscribe();
        oefSub.unsubscribe();
        eqiSub.unsubscribe();
      };
    }
  }, [queryExtension]);

  return (
    <QueryWidgetContext.Provider
      value={{ queryExtension, openedEditForm, editQueryId }}
    >
      <WidgetPaper isPreview={isPreview} title={"Queries"}>
        <EditForm />

        <SearchBar buttonLabel="Find query" />

        <TreeWrapper>
          <TreeView
            ref={treeViewRef}
            slots={{
              item: EnhancedTreeItem,
            }}
            apiRef={apiRef}
            multiSelect
            items={treeData}
            expandedItems={expandedItems}
            onExpandedItemsChange={(event, ids) => setExpandedItems(ids)}
            onSelectedItemsChange={(event, ids) => true}
          />
        </TreeWrapper>
      </WidgetPaper>
    </QueryWidgetContext.Provider>
  );
};

interface QueryWidgetProviderProps {
  queryExtension: QueryExtension | null;
  openedEditForm: boolean;
  editQueryId: number | null;
}

const QueryWidgetContext = createContext<QueryWidgetProviderProps | null>(null);

export function useQueryWidget() {
  const service = useContext(QueryWidgetContext);

  if (service === null) {
    throw new Error("useQueryWidget must be used within a QueryWidgetContext");
  }

  return service;
}

const TreeWrapper = styled.div`
  & {
    display: flex;
    width: 100%;
  }

  &,
  & * {
    font-size: 12px !important;
  }

  & .MuiRichTreeView-root {
    width: 100%;
  }

  & .MuiTreeItem-content {
    background-color: transparent !important;
  }
`;

export default QueryWidget;
