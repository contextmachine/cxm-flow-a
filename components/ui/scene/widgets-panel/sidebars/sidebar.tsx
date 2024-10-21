import React, { useEffect, useState } from "react";
import { WidgetType } from "../widgets/widget.types";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import PointCloudHandlerSidebar from "./pointcloud-handler-sidebar/pointcloud-handler-sidebar";
import TagsSidebar from "./tags-sidebar/tags-sidebar";
import SelectionProps from "../../../../services/extensions/selection-props/selection-props-widget/selection-props-bar";

const Sidebar: React.FC<{
  type: WidgetType;
}> = ({ type }) => {
  const viewer = useViewer();

  const [extension, setExtension] = useState<ExtensionEntityInterface | null>(
    null
  );

  useEffect(() => {
    const extension = viewer.extensionControl.getExtension(type);

    if (extension) {
      setExtension(extension as any);
    }
  }, [type]);

  if (!extension) return null;

  switch (type) {
    case "pointcloud-handler":
      return <PointCloudHandlerSidebar extension={extension!} />;
    case "selection-props":
      return <SelectionProps extension={extension} />;
    default:
      return null;
  }
};

export default Sidebar;
