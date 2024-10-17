import React, { useState } from "react";
import styled from "styled-components";
import { useEntities } from "@/src/hooks";
import { CodeIcon } from "@radix-ui/react-icons";
import QueryControl from "../../query-control";
import ApiObject from "@/src/viewer/loader/objects/api-object";
import BinIcon from "@/components/ui/icons/bin-icon";
import EditIcon from "@mui/icons-material/Edit";
import CachedIcon from "@mui/icons-material/Cached";

interface QueryItemComponentProps {
  queryControl: QueryControl;
  query: ApiObject;
}

const QueryItemComponent: React.FC<QueryItemComponentProps> = (
  props: QueryItemComponentProps
) => {
  const { query, queryControl } = props;
  const [paramsOpen, setParamsOpen] = useState(false);

  const [name, setName] = useState(query.name);
  const [endpoint, setEndPoint] = useState(query.endpoint);

  const onDelete = () => {
    queryControl.deleteApiObject(query.id);
  };

  return (
    <QueryItemWrapper $paramsEnabled={true} $paramsOpen={paramsOpen}>
      <div className="first-line">
        <div className="label">
          <EntityIcon $loaded={query.model !== undefined}>
            <CodeIcon />
            REST
          </EntityIcon>
          {query.name}
        </div>
        <div className="button-block">
          <button
            className="query-button params-button"
            onClick={() => queryControl.reloadQuery(query.id)}
          >
            <CachedIcon />
          </button>
          <button
            className="query-button params-button"
            onClick={() => setParamsOpen(!paramsOpen)}
          >
            <EditIcon />
          </button>
          <button
            className="query-button delete-button"
            onClick={() => onDelete()}
          >
            <BinIcon />
          </button>
        </div>
      </div>
      <div className="second-line">
        <InputWrapper>
          <div className="label">Name</div>
          <div className="input-field">
            <input
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
              className="value-input"
              value={endpoint}
              onChange={(e) => setEndPoint(e.target.value)}
            />
          </div>
        </InputWrapper>
        <SaveButton
          onClick={() => {
            queryControl.updateQuery(query.id, {
              name,
              endpoint,
            });
            setParamsOpen(false);
          }}
        >
          Save
        </SaveButton>
      </div>
    </QueryItemWrapper>
  );
};

export default QueryItemComponent;

const EntityIcon = styled.div<{ $loaded: boolean }>`
  background-color: var(--button-secondary-color);
  font-size: 8px;
  border-radius: 9px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0px 4px;
  position: relative;
  top: 1px;
  color: ${({ $loaded }) =>
    $loaded
      ? "var(--main-text-color)"
      : "var(--button-secondary-danger-text-color)"};
  svg {
    align-items: center;
    width: 12px;
    path {
      fill: ${({ $loaded }) =>
        $loaded
          ? "var(--main-text-color)"
          : "var(--button-secondary-danger-text-color)"};
    }
  }
`;

const SaveButton = styled.button`
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
    gap: 4px;
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

const QueryItemWrapper = styled.div<{
  $paramsEnabled: boolean;
  $paramsOpen: boolean;
}>`
  display: flex;
  justify-content: start;
  width: 100%;
  flex-direction: column;
  gap: 5px;
  border-radius: 9px;
  padding: 3px;
  background-color: ${({ $paramsOpen }) =>
    $paramsOpen ? "var(--main-bg-color)" : "transparent"};

  .query-button {
    display: none;
    height: 27px;
    cursor: pointer;
    border: 0px;
    background-color: transparent;
    justify-content: center;
    align-items: center;
  }

  &:hover .query-button {
    display: flex;
  }

  .first-line {
    height: 27px;
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .label {
      width: 100%;
      display: flex;
      gap: 5px;
      flex-direction: row;
      align-items: center;
    }
  }

  .second-line {
    display: ${({ $paramsOpen }) => ($paramsOpen ? "flex" : "none")};
    flex-direction: column;
    gap: 4px;
  }

  .button-block {
    gap: 5px;
    display: flex;
    flex-direction: row;
  }

  .params-button svg {
    width: 14px;
  }

  .delete-icon {
    width: 14px;
    height: 14px;
    justify-self: center;
    align-self: center;
  }
`;
