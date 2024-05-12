import BarChartWidget from "./bar-widget";
import ChartWidget from "./chart-widget";
import DummyWidget from "./dummy-widget";
import MappingWidget from "./mapping-widget";
import PointCloudHandlerWidget from "./pointcloud-handler-widget/pointcloud-handler-widget";
import QueryWidget from "./query-widget";
import StatisticsWidget from "./statistics-widget";
import ToolsetWidget from "./toolset-widget";
import ViewsWidget from "./views-widget/views-widget";
import { WidgetType } from "./widget.types";

const Widget: React.FC<WidgetProps> = ({ type, isPreview }) => {
  if (type.toLowerCase().startsWith("product")) {
    const index = parseInt(type.toLowerCase().split("product")[1]);
    return <DummyWidget isPreview={isPreview} index={index} />;
  }

  switch (type) {
    case "views":
      return <ViewsWidget isPreview={isPreview} />;
    case "pointcloud-handler":
      return <PointCloudHandlerWidget isPreview={isPreview} />;
    case "chart-widget":
      return <ChartWidget isPreview={isPreview} />;
    case "mapping-widget":
      return <MappingWidget isPreview={isPreview} />;
    case "query-widget":
      return <QueryWidget isPreview={isPreview} />;
    case "statistics-widget":
      return <StatisticsWidget isPreview={isPreview} />;
    case "bar-widget":
      return <BarChartWidget isPreview={isPreview} />;
    case "toolset-widget":
      return <ToolsetWidget isPreview={isPreview} />;
    default:
      return null;
  }
};

interface WidgetProps {
  isPreview?: boolean;
  type: WidgetType;
}

export default Widget;
