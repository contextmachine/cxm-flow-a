import styled from "styled-components";
import { ChangeEvent, useState } from "react";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import WidgetPaper from "@/components/ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import ViewFilterExtension from "../view-filter-extension";
import { useSubscribe } from "@/src/hooks";

import { IconButton, InputAdornment, InputBase } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TuneIcon from "@mui/icons-material/Tune";

interface ViewFilterWidgetProps {
  isPreview?: boolean;
  extension: ExtensionEntityInterface;
}

const ViewFilterWidget: React.FC<ViewFilterWidgetProps> = ({
  isPreview,
  extension: ext,
}) => {
  const extension = ext as ViewFilterExtension;

  const properties = useSubscribe(extension.$properties, extension.properties);
  const filters = useSubscribe(extension.$filters, [
    ...extension.filters.values(),
  ]);

  const [filteredOptions, setFilteredOptions] = useState([
    ...properties.keys(),
  ]);

  const [filterInput, setFilterInput] = useState<string>("");

  const onChange = (e: string) => {
    extension.addFilter(e, undefined);
    setFilteredOptions(
      [...properties.keys()].filter((x) => filterOption(filterInput, x))
    );
  };

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("search:", e.target.value);
  };

  const onDelete = (id: string) => {
    extension.removeFilter(id);
  };

  const onEnable = (id: string) => {
    const condition = filters.find((x) => x.id === id) as any;
    condition.enabled = !condition.enabled;
    extension.updateFilter(id, condition);
  };

  const filterOption = (input: string, option: string | undefined) =>
    (option ?? "").toLowerCase().includes(input.toLowerCase());

  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: any) => {
    setIsOpen(false);
    onChange(option);
  };

  return (
    <WidgetPaper isPreview={isPreview} title={"View Filter"}>
      <FilterList>
        {filters.map((filter) => (
          <div className="filter-item" key={filter.id}>
            <div className="label">{filter.propertyName}</div>
            <div className="button-block">
              <IconButton onClick={() => onEnable(filter.id)}>
                {!filter.enabled && <AddIcon className="item-button" />}
                {filter.enabled && (
                  <CheckCircleIcon className="add-button item-button" />
                )}
              </IconButton>
              <IconButton>
                <TuneIcon className="item-button" />
              </IconButton>
              <IconButton onClick={() => onDelete(filter.id)}>
                <ClearIcon className="item-button" />
              </IconButton>
            </div>
          </div>
        ))}
      </FilterList>

      <SelectWrapper>
        <DropdownContainer>
          <InputBase
            className="TriggerButtonIntroduction"
            onClick={() => setIsOpen(!isOpen)}
            inputProps={{ disableUnderline: true }}
            value={filterInput !== "" ? filterInput : null}
            placeholder="Add new filter"
            onChange={onSearch}
            endAdornment={
              <InputAdornment position="end">
                <SearchOutlined sx={{ fontSize: 16 }} />
              </InputAdornment>
            }
          />
          {isOpen && (
            <DropdownList>
              {filteredOptions.map((option, index) => (
                <DropdownItem
                  key={index}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </DropdownContainer>
      </SelectWrapper>
    </WidgetPaper>
  );
};

export default ViewFilterWidget;

const SelectWrapper = styled.div`
  width: 100%;
  font-size: 12px;

  .MuiInputBase-root {
    width: 100%;
    height: 27px;
    border: 1px solid #e0e0e0;
    border-radius: 9px;
    padding: 0 10px;

    .MuiInputAdornment-root svg {
      fill: #e0e0e0;
    }
  }

  .base-Menu-root {
    z-index: 9999;
    width: 100%;
    height: 27px;
    border: 1px solid #e0e0e0;
    border-radius: 9px;
    padding: 0 10px;

    .MuiInputAdornment-root svg {
      fill: #e0e0e0;
    }
  }
`;

const FilterList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  .filter-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 27px;

    .label {
      justify-self: start;
      padding: 0 10px;
    }

    .button-block {
      display: flex;
    }

    .item-button {
      width: 16px;
    }

    .add-button {
      fill: #2789ff;
    }

    button {
      border-radius: 12px;
      font-size: 12px;
      width: 24px;
    }
  }
`;

const DropdownContainer = styled.div`
  z-index: 9999;
  width: 100%;
  position: relative;
  display: inline-block;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  border-radius: 9px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  list-style-type: none;
  padding: 0;
  max-height: 200px;
  overflow: auto;
`;

const DropdownItem = styled.li`
  padding: 10px;
  cursor: pointer;
  margin: 2px;
  border-radius: 7px;

  &:hover {
    background-color: #e0e0e0;
  }
`;
