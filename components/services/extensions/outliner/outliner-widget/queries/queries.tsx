import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import styled from "styled-components";
import SearchBar from "../../../../../ui/scene/widgets-panel/blocks/search-bar/search-bar";
import { useState } from "react";
import QueryControl from "../../query-control";
import { useSubscribe } from "@/src/hooks";
import QueryItemComponent from "./query-item";
import { Divider } from "@mui/material";
import { CodeIcon } from "@radix-ui/react-icons";

const TreeView = RichTreeView;

interface QueryComponentProps {
  queryControl: QueryControl;
}

const QueriesComponent: React.FC<QueryComponentProps> = (props) => {
  const { queryControl } = props;

  const queries = useSubscribe(queryControl.$queries, queryControl.queries);

  const [name, setName] = useState("");
  const [endpoint, setEndPoint] = useState("");

  return (
    <QueriesWrapper>
      {[...queries.values()].map((x, index) => (
        <QueryItemComponent queryControl={queryControl} query={x} />
      ))}

      <Divider sx={{ margin: "5px" }} />
      <AddQueryHeader>
        <CodeIcon />
        Add Query
      </AddQueryHeader>
      <AddSection>
        <InputWrapper>
          <div className="label">Name</div>
          <div className="input-field">
            <input
              placeholder="Query name"
              className="value-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </InputWrapper>
        <InputWrapper>
          <div className="label">Endpoint</div>
          <div className="input-field">
            <input
              placeholder="Query endpoint"
              className="value-input"
              value={endpoint}
              onChange={(e) => setEndPoint(e.target.value)}
            />
          </div>
        </InputWrapper>
        <AddButton
          onClick={() => {
            queryControl.addApiObject({
              name,
              endpoint,
            });
            setName("");
            setEndPoint("");
          }}
        >
          + Add Query
        </AddButton>
      </AddSection>
    </QueriesWrapper>
  );
};

export default QueriesComponent;

const AddQueryHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  gap: 4px;
`;

const QueriesWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const AddSection = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 3px;
`;

const AddButton = styled.button`
  width: 100%;
  border: 0px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  background-color: var(--button-primary-color);
  color: white;
  height: 27px;
  border-radius: 9px;
  align-items: center;
`;

const InputWrapper = styled.div`
  width: 100%;
  font-size: 12px;
  display: flex;
  flex-direction: row;

  .label {
    display: flex;
    align-items: center;
    width: 20%;
  }

  .input-field {
    width: 100%;
    height: 25px;
    display: flex;
    justify-content: start;

    background-color: var(--select-bg-color);
    border: 1px solid var(--box-border-color);

    border-radius: 9px;
    padding: 0 10px;

    .value-input {
      border: 0px;
      width: 100%;
      background-color: var(--select-bg-color);
      &:focus-visible {
        outline: -webkit-focus-ring-color auto 0px;
      }
    }
  }
`;
