import styled from "styled-components";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import WidgetPaper from "@/components/ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import ViewFilterExtension from "../view-filter-extension";
import { useSubscribe } from "@/src/hooks";

import FilterItemComponent from "./filter-item-component";

interface ViewFilterWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const ViewFilterWidget: React.FC<ViewFilterWidgetProps> = ({
  isPreview,
  extension: ext,
}) => {
  const extension = ext as ViewFilterExtension;

  const filterPreset = useSubscribe(extension.$filter, extension.filter);

  const currentScopeCount = useSubscribe(extension.$currentScopeCount, 0);
  const childrenCount = useSubscribe(extension.$childrenCount, undefined);

  if (!filterPreset) {
    return;
  } else {
    return (
      <WidgetPaper isPreview={isPreview} title={"View Filter"}>
        {currentScopeCount !== undefined && (
          <FilteredCountWrapper>
            <div className="count">
              <div>{currentScopeCount.toLocaleString()}</div>
              {childrenCount !== undefined && childrenCount !== 0 && (
                <div style={{ color: "#b3b3b3" }}>
                  ({childrenCount.toLocaleString()})
                </div>
              )}
            </div>
            <div className="label">Objects</div>
          </FilteredCountWrapper>
        )}

        <FilterItemComponent
          parentGroup={undefined}
          filterItem={filterPreset.filter}
          extension={extension}
          key={0}
          index={0}
        />
      </WidgetPaper>
    );
  }
};

export default ViewFilterWidget;

const FilteredCountWrapper = styled.div`
  padding: 5px;
  width: 100%;
  display: flex;
  align-items: baseline;
  background-color: #f3f3f3;
  border-radius: 10px;

  .count {
    display: flex;
    margin-right: 10px;

    & * {
      font-size: 24px;
    }
  }
`;

const formatNumber = (number: string) => {};
