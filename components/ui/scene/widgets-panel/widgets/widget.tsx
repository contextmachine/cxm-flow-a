import { useEffect, useState } from "react";
import BarChartWidget from "./bar-widget";
import ChartWidget from "./chart-widget";
import DummyWidget from "./dummy-widget";
import MappingWidget from "./mapping-widget";
import QueryWidget from "./query-widget/query-widget";
import StatisticsWidget from "./statistics-widget";
import ToolsetWidget from "./toolset-widget";
import ViewsWidget from "./views-widget";
import { WidgetType } from "./widget.types";
import { useScene } from "@/components/services/scene-service/scene-provider";
import { ExtensionEntityInterface } from "@/components/services/extension-service/entity/extension-entity.types";

const Widget: React.FC<WidgetProps> = ({ type, isPreview }) => {
  if (type.toLowerCase().startsWith("product")) {
    const index = parseInt(type.toLowerCase().split("product")[1]);
    return <DummyWidget isPreview={isPreview} index={index} />;
  }

  const { sceneService } = useScene();

  const [extension, setExtension] = useState<ExtensionEntityInterface | null>(
    null
  );

  useEffect(() => {
    const extension = sceneService.getExtension(type);
    setExtension(extension);
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
    case "queries":
      return <QueryWidget isPreview={isPreview} extension={extension!} />;
    case "views":
      return <ViewsWidget isPreview={isPreview} extension={extension!} />;
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
    default:
      return null;
  }
};

interface WidgetProps {
  isPreview?: boolean;
  type: WidgetType;
}

export default Widget;
