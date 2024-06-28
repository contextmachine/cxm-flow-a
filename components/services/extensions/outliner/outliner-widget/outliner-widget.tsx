import WidgetPaper from "../../../../ui/scene/widgets-panel/blocks/widget-paper/widget-paper";
import styled from "styled-components";
import OutlinerExtension from "../outliner-extension";
import { useSubscribe } from "@/src/hooks";
import TreeItem from "./tree-item";

interface OutlinerWidgetProps {
  isPreview?: boolean;
  extension: OutlinerExtension;
}

const OutlinerWidget: React.FC<OutlinerWidgetProps> = ({
  isPreview,
  extension,
}) => {
  const tree = useSubscribe(extension.$tree, extension.tree);

  return (
    <WidgetPaper isPreview={isPreview} title={"Outliner"}>
      <TreeContainer>
        {tree.map((x) => (
          <TreeItem item={x} extension={extension} />
        ))}
      </TreeContainer>
    </WidgetPaper>
  );
};

export default OutlinerWidget;

const TreeContainer = styled.div`
  flex-direction: column;
  gap: 6px;
  max-height: 500px;
  min-height: 150px;
  overflow: auto;
`;
