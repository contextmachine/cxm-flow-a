import { useEffect, useState } from "react";
import styled from "styled-components";
import { ParamWrapper } from "./components/param-input/param-input";
import { Button, IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

interface NewParamFormProps {
  existingKeys: string[];
  onSubmit: (propertyName: string, propertyValue: string) => void;
}

const NewParamForm: React.FC<NewParamFormProps> = (
  props: NewParamFormProps
) => {
  const { existingKeys, onSubmit } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  return (
    <AddingWrapper>
      <Button
        sx={{
          width: "100%",
          minWidth: "max-content",
        }}
        disabled={false}
        variant="contained"
        color="secondary"
        size="medium"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {!isOpen && <>Add Property</>}
        {isOpen && <>Cancel</>}
      </Button>
      {isOpen && (
        <FormWrapper>
          <InputWrapper>
            <InputField>
              <input
                className="input-field"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Property Name"
              />
            </InputField>
          </InputWrapper>
          <InputWrapper>
            <InputField>
              <input
                className="input-field"
                onChange={(e) => setValue(e.target.value)}
                value={value}
                placeholder="Value"
              />
            </InputField>
          </InputWrapper>
          <IconButton
            sx={{ width: "25px" }}
            disabled={name === "" || existingKeys.includes(name)}
            onClick={() => {
              onSubmit(name, value);
              setIsOpen(false);
              setName("");
              setValue("");
            }}
          >
            <CheckIcon
              sx={{
                width: "12px",
                fill:
                  name === "" || existingKeys.includes(name)
                    ? "var(--button-secondary-danger-text-color)"
                    : "var(--button-secondary-active-text-color)",
              }}
            />
          </IconButton>
        </FormWrapper>
      )}
    </AddingWrapper>
  );
};

export default NewParamForm;

const AddingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 2px;
  justify-content: space-between;
  align-items: center;
`;

const InputField = styled.div`
  height: 25px;
  display: flex;
  background-color: var(--select-bg-color);
  border: 1px solid var(--box-border-color);
  align-items: center;
  flex-flow: row wrap;
  border-radius: 9px;
  .input-field {
    border: 0px;
    width: 90%;
    background-color: var(--select-bg-color);
    margin-left: 10px;
    height: 20px;
    &:focus-visible {
      outline: -webkit-focus-ring-color auto 0px;
    }
  }
`;

const InputWrapper = styled.div`
  width: 100%;
  font-size: 12px;
  display: flex;
`;
