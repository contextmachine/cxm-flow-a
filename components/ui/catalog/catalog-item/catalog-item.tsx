import { Box } from "@mui/material";
import styled from "styled-components";
import { Title } from "../../scene/bar/bar.styled";
import { SceneDto } from "@/components/services/workspace-service/workspace-service.types";
import moment from "moment";
import stc from "string-to-color";
import { UserMetadata } from "@/components/services/auth-service/auth-service.types";
import { Ava } from "../styles/styles";

interface CatalogItemProps extends SceneDto {
  user_workspaces: { user: UserMetadata }[];
}

const CatalogItem: React.FC<CatalogItemProps> = ({
  id,
  name,
  created_at,
  user_workspaces,
}) => {
  const handleNavigate = (e: any) => {
    e.preventDefault(); // Prevent default link behavior
    window.location.href = `/scene/${id}`; // Navigate with a full page reload
  };

  const date = moment(created_at).fromNow();

  return (
    <Wrapper onClick={handleNavigate}>
      <Thumb />

      <Box
        sx={{
          display: "flex",
          columnGap: "18px",
          justifyContent: "space-between",
          width: "100%",
          padding: "0px 18px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Title size="large">{name}</Title>
          <Title>Modified {date}</Title>
        </Box>

        <Box sx={{ display: "flex" }}>
          {user_workspaces.map((user, i: number) => {
            return (
              <Ava
                color={stc(user.user.username)}
                data-userid={user.user.id}
                key={i}
              />
            );
          })}
        </Box>
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  gap: 9px;
  position: relative;
  height: max-content;

  cursor: pointer;
`;

const Thumb = styled.div`
  width: 100%;
  padding-bottom: 50%;
  border-radius: 18px;
  background: white;
  position: relative;

  background-color: white;
  background-image: url("/test-thumbs/1.jpg");
  background-repeat: no-repeat;
  background-position: center;
`;

export default CatalogItem;
