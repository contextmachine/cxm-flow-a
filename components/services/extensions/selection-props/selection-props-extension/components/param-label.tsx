import {
  Param,
  ParamType,
} from "@/components/services/extensions/selection-props/params/params";
import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import ClearIcon from "@mui/icons-material/Clear";
import { PropertyValue } from "../../selection-props-extension";

const LibraryTag = styled.div`
  display: flex;
  align-items: center;
  width: 10px;
  & span {
    display: flex;
    width: 5px;
    height: 5px;
    background: #e1e1e1;
    border-radius: 5px;
  }
`;

const Label = styled.div``;

interface ParamLabelProps {
  param?: Param;
  property: PropertyValue;
  type: ParamType;
  index: number;
  onDelete: (paramName: string) => void;
}

const ParamLabel: FC<ParamLabelProps> = (props: ParamLabelProps) => {
  const { param, type, index, property, onDelete } = props;
  const [edit, setOpenEdit] = useState(false);

  return (
    <>
      <LabelContainer $color={pallete[index % pallete.length]}>
        <div className="marker">
          <span className="marker-tag" />
          <DeleteButton
            className="delete-button"
            onClick={() => onDelete(property.paramName)}
          >
            <ClearIcon className="delete-icon" />
          </DeleteButton>
        </div>
        <Label
          style={{ textDecoration: property.value ? "none" : "line-through" }}
        >
          {property.paramName}
        </Label>
      </LabelContainer>
    </>
  );
};

export default ParamLabel;

const DeleteButton = styled.button`
  background-color: transparent;
  border: 0px;
`;

const LabelContainer = styled.div<{ $color: string }>`
  display: flex;
  width: 50%;
  flex-direction: row;
  button {
    cursor: pointer;
  }
  &:hover .delete-button {
    display: flex;
  }
  .delete-button {
    display: none;
  }
  .delete-icon {
    width: 14px;
    height: 14px;
    justify-self: center;
    align-self: center;
  }
  &:hover .marker-tag {
    display: none;
  }
  .marker {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    margin-right: 2px;
    .marker-tag {
      background: ${({ $color }) => $color};
      border-radius: 3px;
      height: 6px;
      width: 6px;
    }
  }
`;

const pallete = [
  "#f44336",
  "#2196f3",
  "#8bc34a",
  "#ff5722",
  "#e81e63",
  "#03a9f4",
  "#cddc39",
  "#795548",
  "#9c27b0",
  "#00bcd4",
  "#ffeb3b",
  "#9e9e9e",
  "#673ab7",
  "#009688",
  "#ffc107",
  "#607d8b",
  "#3f51b5",
  "#4caf50",
  "#ff9800",
  "#000000",
];
