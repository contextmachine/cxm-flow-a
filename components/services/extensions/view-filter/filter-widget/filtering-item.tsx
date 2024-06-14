import styled from "styled-components";
import ViewFilterExtension, { FilterItem } from "../view-filter-extension";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TuneIcon from "@mui/icons-material/Tune";
import { useState } from "react";
import FilterSettings from "./filter-settings";

interface FilterItemProps {
  filter: FilterItem;
  extension: ViewFilterExtension;
}

const FilterItemComponent: React.FC<FilterItemProps> = (
  props: FilterItemProps
) => {
  const { filter, extension } = props;

  const [isParamsOpen, setParamsOpen] = useState(false);

  const onDelete = (id: string) => {
    extension.removeFilter(id);
  };

  const onEnable = (filter: FilterItem) => {
    filter.enabled = !filter.enabled;
    extension.updateFilter(filter);
  };

  return (
    <FilterItemWrapper
      isParamsOpen={isParamsOpen}
      isParamDefined={filter.condition.length > 0}
    >
      <div className="first-line">
        <div className="label">{filter.key}</div>
        <div className="button-block">
          <IconButton onClick={() => onEnable(filter)}>
            {!filter.enabled && <AddIcon className="item-button" />}
            {filter.enabled && (
              <CheckCircleIcon className="add-button item-button" />
            )}
          </IconButton>
          <IconButton onClick={() => setParamsOpen(!isParamsOpen)}>
            <TuneIcon className="item-button params-button" />
          </IconButton>
          <IconButton onClick={() => onDelete(filter.id)}>
            <ClearIcon className="item-button" />
          </IconButton>
        </div>
      </div>
      <div className="second-line">
        <FilterSettings filter={filter} extension={extension} />
      </div>
    </FilterItemWrapper>
  );
};

export default FilterItemComponent;

const FilterItemWrapper = styled.div<{
  isParamsOpen: boolean;
  isParamDefined: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: 100%;

  border-radius: 12px;
  background-color: ${({ isParamsOpen }) =>
    isParamsOpen ? "#F3F3F3" : "white"};
  transition: background-color 0.5s ease-in-out;
  padding: 5px;
  margin: 3px;

  .first-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 27px;
    width: 100%;
    padding-left: 10px;

    .label {
      justify-self: start;
    }

    .button-block {
      display: flex;
    }

    .item-button {
      width: 16px;
    }

    .add-button {
      display: flex !important;
      fill: #2789ff;
    }

    .params-button {
      fill: ${({ isParamDefined }) => (isParamDefined ? "#2789ff" : "black")};
    }

    button {
      border-radius: 12px;
      font-size: 12px;
      width: 24px;
    }
  }

  .second-line {
    max-height: ${({ isParamsOpen }) => (isParamsOpen ? "27px" : "0px")};
    opacity: ${({ isParamsOpen }) => (isParamsOpen ? "100%" : "0")};
    display: ${({ isParamsOpen }) => (isParamsOpen ? "flex" : "none")};

    transition: max-height 0.5s ease, opacity 0.3s ease;

    align-items: center;
    padding: 10 10px;
    height: 27px;
    width: 100%;
  }
`;
