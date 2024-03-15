import BarChartWidget from "./bar-widget";
import ChartWidget from "./chart-widget";
import MappingWidget from "./mapping-widget";
import QueryWidget from "./query-widget";
import StatisticsWidget from "./statistics-widget";
import { WidgetType } from "./widget.types";

const Widget: React.FC<WidgetProps> = ({ type, isPreview }) => {
  switch (type) {
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
    default:
      return null;
  }
};

interface WidgetProps {
  isPreview?: boolean;
  type: WidgetType;
}

export default Widget;
