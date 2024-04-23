import useSubscribe from "@/components/hooks/use-subscribe";
import { useStates } from "@/components/services/state-service/state-provider";
import ArrowLeftIcon from "@/components/ui/icons/arrow-left-icon";
import ExportIcon from "@/components/ui/icons/export-icon";
import InfoIcon from "@/components/ui/icons/info-icon";
import SettingsIcons from "@/components/ui/icons/settings-icon";
import { IconButton } from "@mui/material";
import styled from "styled-components";

const BarTools = () => {
  const { stateService, isWidgetsOpen } = useStates();

  const [modalPanelType, setModalPanelType] = useSubscribe(
    stateService.modalPanelType$
  );

  console.log("modalPanelType", modalPanelType);

  return (
    <Wrapper>
      <IconButton>
        <InfoIcon />
      </IconButton>

      <IconButton>
        <ExportIcon />
      </IconButton>

      <IconButton
        data-open={`${modalPanelType === "settings" ? "true" : "false"}`}
        onClick={() => setModalPanelType("settings")}
      >
        <SettingsIcons />
      </IconButton>

      <IconButton
        data-type="widget"
        data-open={`${isWidgetsOpen}`}
        onClick={() => stateService.toogleWidgets()}
      >
        <ArrowLeftIcon />
      </IconButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  column-gap: 0px;
  align-items: center;
  height: 100%;

  & *[data-type="widget"] {
    &[data-open="true"] {
      transform: rotate(-90deg);
    }
  }
`;

export default BarTools;
