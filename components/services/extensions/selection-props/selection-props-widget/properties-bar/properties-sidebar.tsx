import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import { Box } from "@mui/material";
import React, { useMemo, useState } from "react";
import WidgetPaper from "../../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import { useSelected } from "@/src/hooks";
import ParamInput, { PropertyValue } from "./params/param-input/param-input";
import { MixedValue } from "../../params/mixed";
import { defineParamType } from "./utils";
import { ParamItem } from "@/components/ui/scene/widgets-panel/widgets/pointcloud-handler-widget/blocks/overall-form copy";

const SelectionProps: React.FC<{
  extension: ExtensionEntityInterface;
}> = ({ extension }) => {
  const selected = useSelected();

  const [formState, setFormState] = useState(new Map<string, PropertyValue>());

  const paramList = useMemo(() => {
    const params = new Map<string, PropertyValue>();
    const objectList = selected.filter((o) => o.props);

    const allKeys = new Set<string>();
    objectList.forEach((o) => {
      [...o.props!].forEach(([key, _]) => {
        allKeys.add(key);
      });
    });

    objectList.forEach((po) => {
      [...po.props!].forEach(([k, v]) => {
        if (params.has(k)) {
          const param = params.get(k)!;
          if (param.value !== v) {
            param.value = new MixedValue();
          }
        } else {
          const valueType = defineParamType(v);

          if (valueType) {
            params.set(k, { value: v, type: valueType });
          } else {
            params.set(k, { value: v, type: "string" });
          }
        }
      });
    });

    setFormState(params);

    console.log(params);
    return params;
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
              {[...paramList.entries()].map((x, i) => (
                <ParamInput
                  onChange={(e) => {
                    return;
                  }}
                  paramName={x[0]}
                  property={x[1]}
                />
              ))}
            </Box>
          </WidgetPaper>
        </Box>
      )}
    </>
  );
};

export default SelectionProps;
