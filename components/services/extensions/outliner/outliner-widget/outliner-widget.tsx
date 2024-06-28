import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import OutlinerExtension from "../outliner-extension";

interface OutlinerWidgetProps {
  isPreview?: boolean;
  extension: OutlinerExtension;
}

const OutlinerWidget: React.FC<OutlinerWidgetProps> = ({
  isPreview,
  extension,
}) => {
  return (
    <WidgetPaper isPreview={isPreview} title={"Outliner"}>
      <div> outliner </div>
    </WidgetPaper>
  );
};

export default OutlinerWidget;
