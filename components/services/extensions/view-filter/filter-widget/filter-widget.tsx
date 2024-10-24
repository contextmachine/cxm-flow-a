import styled from "styled-components";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import WidgetPaper from "@/components/ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import ViewFilterExtension from "../view-filter-extension";
import { useSubscribe } from "@/src/hooks";

import FilterItemComponent from "./filter-item-component";
import { Button, IconButton } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useViewer } from "@/components/services/scene-service/scene-provider";
interface ViewFilterWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const ViewFilterWidget: React.FC<ViewFilterWidgetProps> = ({
  isPreview,
  extension: ext,
}) => {
  const extension = ext as ViewFilterExtension;
  const preset = useSubscribe(extension.$filter, extension.filter);

  const viewer = useViewer();

  const filterPreset = useSubscribe(extension.$filter, extension.filter);

  const currentScopeCount = useSubscribe(extension.$currentScopeCount, 0);
  const childrenCount = useSubscribe(extension.$childrenCount, 0);

  const onEnable = () => {
    if (preset) {
      preset.enabled = !preset.enabled;
      extension.updatePreset(preset);
    }
  };

  if (!filterPreset) {
    return;
  } else {
    return (
      <WidgetPaper isPreview={isPreview} title={"View Filter"}>
        {currentScopeCount !== undefined && (
          <FilteredCountWrapper>
            <div className="count-label">
              <div className="count">
                <div>{currentScopeCount.toLocaleString()}</div>
                {childrenCount !== undefined && childrenCount !== 0 && (
                  <div style={{ color: "#b3b3b3" }}>
                    ({childrenCount.toLocaleString()})
                  </div>
                )}
              </div>
              <div className="label">Objects</div>
            </div>
            <IconButton
              onClick={() =>
                viewer.selectionTool.addToSelection(
                  extension.filteredObjects.map((x) => x.id)
                )
              }
              sx={{ width: "20px", height: "20px" }}
            >
              <DoneIcon sx={{ fontSize: "14px" }} />
            </IconButton>
          </FilteredCountWrapper>
        )}

        <FilterItemComponent
          parentGroup={undefined}
          filterItem={filterPreset.filter}
          extension={extension}
          key={0}
          index={0}
        />

        <FilterButton
          onClick={() => onEnable()}
          $isActive={preset !== undefined && preset.enabled}
        ></FilterButton>
      </WidgetPaper>
    );
  }
};

export default ViewFilterWidget;

const FilterButton = styled.button<{ $isActive: boolean }>`
  width: 100%;
  height: 27px;
  color: ${({ $isActive }) =>
    $isActive ? "#FFFFFF" : "var(--main-text-color)"};
  background-color: ${({ $isActive }) =>
    $isActive
      ? "var(--button-primary-color)"
      : "var(--button-secondary-active-bg-color)"};
  border: 0px;
  border-radius: 9px;

  &::after {
    content: ${({ $isActive }) => ($isActive ? `"Enabled"` : `"Enable"`)};
  }
`;

const FilteredCountWrapper = styled.div`
  padding: 5px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--main-bg-color);
  border-radius: 10px;

  .count-label {
    display: flex;
    align-items: baseline;

    .count {
      display: flex;
      margin-right: 10px;

      & * {
        font-size: 24px;
      }
    }
  }
`;
