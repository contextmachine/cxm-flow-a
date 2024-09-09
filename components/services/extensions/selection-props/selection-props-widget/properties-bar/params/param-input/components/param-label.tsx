import {
  Param,
  ParamType,
} from "@/components/services/extensions/selection-props/params/params";
import { FC, useState } from "react";
import styled from "styled-components";
import { v4 } from "uuid";

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

const LabelContainer = styled.div`
  display: flex;
  width: 50%;
  flex-direction: row;
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
}

const ParamLabel: FC<ParamLabelProps> = (props: ParamLabelProps) => {
  const { param, paramName, type } = props;
  const [edit, setOpenEdit] = useState(false);

  return (
    <>
      <LabelContainer>
        <LibraryTag>{param && <span />}</LibraryTag>
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
