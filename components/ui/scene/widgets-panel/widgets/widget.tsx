import { useEffect, useState } from "react";
import BarChartWidget from "./bar-widget";
import ChartWidget from "./chart-widget";
import DummyWidget from "./dummy-widget";
import MappingWidget from "./mapping-widget";
import StatisticsWidget from "./statistics-widget";
import ToolsetWidget from "./toolset-widget";
import ViewsWidget from "./views-widget/views-widget";
import { WidgetType } from "./widget.types";
import { useViewer } from "@/components/services/scene-service/scene-provider";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";
import ViewFilterWidget from "@/components/services/extensions/view-filter/filter-widget/filter-widget";
import PointCloudHandlerWidget from "./pointcloud-handler-widget/pointcloud-handler-widget";
import OutlinerWidget from "@/components/services/extensions/outliner/outliner-widget/outliner-widget";
import OutlinerExtension from "@/components/services/extensions/outliner/outliner-extension";
import TagWidget from "@/components/services/extensions/tags/tags-widget/tags-widget";

const Widget: React.FC<WidgetProps> = ({ type, isPreview }) => {
  if (type.toLowerCase().startsWith("product")) {
    const index = parseInt(type.toLowerCase().split("product")[1]);
    return <DummyWidget isPreview={isPreview} index={index} />;
  }

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

  const exceptions = [
    "bar-widget",
    "chart-widget",
    "mapping-widget",
    "statistics-widget",
    "toolset-widget",
  ];

  if (!extension && !exceptions.includes(type)) return null;

  switch (type) {
    case "outliner":
      return (
        <OutlinerWidget
          isPreview={isPreview}
          extension={extension! as OutlinerExtension}
        />
      );
    case "views":
      return <ViewsWidget isPreview={isPreview} extension={extension!} />;
    case "view-filter":
      return <ViewFilterWidget isPreview={isPreview} extension={extension!} />;
    case "pointcloud-handler":
      return (
        <PointCloudHandlerWidget isPreview={isPreview} extension={extension!} />
      );
    case "chart-widget":
      return <ChartWidget isPreview={isPreview} extension={extension} />;
    case "mapping-widget":
      return <MappingWidget isPreview={isPreview} extension={extension} />;
    case "statistics-widget":
      return <StatisticsWidget isPreview={isPreview} extension={extension} />;
    case "bar-widget":
      return <BarChartWidget isPreview={isPreview} extension={extension} />;
    case "toolset-widget":
      return <ToolsetWidget isPreview={isPreview} extension={extension} />;
    case "tags-widget":
      return <TagWidget isPreview={isPreview} extension={extension!} />;
    default:
      return null;
  }
};

interface WidgetProps {
  isPreview?: boolean;
  type: WidgetType;
}

export default Widget;
