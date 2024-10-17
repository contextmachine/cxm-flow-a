import { FilterConditionTmp } from "@/components/services/extensions/view-filter/filter-widget/filter-condition";
import TagsExtension from "../../tags-extension";
import { useState } from "react";
import { TagCondition } from "../../tags-extension.types";
import stc from "string-to-color";

const TagFilterCondition = ({
  index,
  extension,
  condition,
}: {
  index: number;
  extension: TagsExtension;
  condition: TagCondition;
}) => {
  const [paramsOpen, setParamsOpen] = useState(false);
  const handleDelete = () => {
    extension.removeSubFilter(condition);
  };

  const handleUpdate = () => {
    condition.enabled = !condition.enabled;
    extension.updateSubFilter(condition);
  };

  return (
    <FilterConditionTmp
      index={index}
      color={stc(condition.name)}
      disabledParams
      paramsOpen={paramsOpen}
      setParamsOpen={setParamsOpen}
      onOperatorChange={() => {}}
      onEnable={handleUpdate}
      onDelete={handleDelete}
      filterItem={{
        id: condition.name,
        key: condition.name,
        type: "condition",
        enabled: condition.enabled,
        valueType: "number",
        value: 1,
        operator: "EQUAL",
      }}
      type="number"
      values={[]}
      extension={extension}
    />
  );
};

export default TagFilterCondition;
