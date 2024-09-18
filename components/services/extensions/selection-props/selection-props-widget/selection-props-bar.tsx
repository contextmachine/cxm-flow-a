import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { Box, Button } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import { useSelected } from "@/src/hooks";
import SelectionPropsExtension, {
  PropertyValue,
} from "../selection-props-extension";
import ParamInput from "./components/param-input/param-input";
import NewParamForm from "./new-param-form";

const SelectionProps: React.FC<{
  extension: ExtensionEntityInterface;
}> = (props) => {
  const selected = useSelected();

  const { extension: ext } = props;
  const extension = ext as SelectionPropsExtension;

  const [formState, setFormState] = useState(new Map<string, PropertyValue>());

  const onPropertyAdd = (name: string, value: string) => {
    formState.set(name, {
      paramName: name,
      value,
      oldValue: undefined,
      type: "string",
      beenChanged: true,
    });
    setFormState(new Map(formState));
  };

  const onPropertyChange = (value: any, paramName: string) => {
    const param = formState.get(paramName) as PropertyValue;
    param.beenChanged = true;
    param.value = value;
    setFormState(new Map(formState));
  };

  const onPropertyRevert = (paramName: string) => {
    const param = formState.get(paramName) as PropertyValue;
    if (param.oldValue) {
      param.beenChanged = false;
      param.value = param.oldValue;
    } else {
      formState.delete(paramName);
    }
    setFormState(new Map(formState));
  };

  const onPropertyDelete = (paramName: string) => {
    const param = formState.get(paramName) as PropertyValue;
    if (param.oldValue) {
      param.beenChanged = true;
      param.value = undefined;
    }
    setFormState(new Map(formState));
  };

  useEffect(() => {
    const params = extension.getSelectionParams(selected);
    setFormState(params);
  }, [selected]);

  return (
    <>
      {selected.length > 0 && (
        <Box
          data-type="properties-panel"
          sx={{
            display: "flex",
            flexDirection: "column",
            pointerEvents: "all !important",
          }}
        >
          <WidgetPaper isPreview={false} title={"Selection properties"}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                width: "100%",
              }}
            >
              {[...formState.entries()].map((x, i) => (
                <ParamInput
                  onChange={onPropertyChange}
                  onRevert={onPropertyRevert}
                  onDelete={onPropertyDelete}
                  property={x[1]}
                  index={i}
                />
              ))}
              <NewParamForm
                existingKeys={[...formState.keys()]}
                onSubmit={onPropertyAdd}
              />
              <Button
                sx={{
                  width: "100%",
                  minWidth: "max-content",
                }}
                disabled={![...formState].some((x) => x[1].beenChanged)}
                variant="contained"
                color="primary"
                size="medium"
                onClick={() => extension.submitChanges(formState)}
              >
                Save
              </Button>
            </Box>
          </WidgetPaper>
        </Box>
      )}
    </>
  );
};

export default SelectionProps;
