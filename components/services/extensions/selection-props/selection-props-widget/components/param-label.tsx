import {
  Param,
  ParamType,
} from "@/components/services/extensions/selection-props/params/params";
import { FC, useState } from "react";
import styled from "styled-components";
import ClearIcon from "@mui/icons-material/Clear";

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

// стиль для редактирования параметра, пока отключен, ждет допиливания
// const Label = styled.div`
//     cursor: pointer;
//     &:hover {
//         text-decoration-line: underline;
//     }
// }
// `

const Label = styled.div``;

interface ParamLabelProps {
  param?: Param;
  paramName: string;
  type: ParamType;
  index: number;
}

const ParamLabel: FC<ParamLabelProps> = (props: ParamLabelProps) => {
  const { param, paramName, type, index } = props;
  const [edit, setOpenEdit] = useState(false);

  const onDelete = () => {
    // extension.removeFilterItem(parentGroup, id);
  };

  return (
    <>
      <LabelContainer $color={pallete[index % pallete.length]}>
        <div className="marker">
          <span className="marker-tag" />
          <DeleteButton className="delete-button" onClick={() => onDelete()}>
            <ClearIcon className="delete-icon" />
          </DeleteButton>
        </div>
        <Label
          onClick={() => {
            // setOpenEdit(true)
          }}
        >
          {paramName}
        </Label>
      </LabelContainer>

      {/* <EditParamForm
        isOpen={edit}
        setOpen={setOpenEdit}
        param={
          param
            ? param
            : {
                id: v4(),
                type: type,
                name: paramName,
              }
        }
      /> */}
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
