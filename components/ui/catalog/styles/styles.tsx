import styled from "styled-components";

export const WidgetHeader = styled.div`
  display: flex;
  align-items: center;

  column-gap: 10px;
`;

export const Ava = styled.div<{
  color: string;
}>`
  min-width: 27px;
  max-width: 27px;
  min-height: 27px;
  max-height: 27px;

  border-radius: 50%;
  border: 2px solid white;
  filter: brightness(1.2);

  background-color: ${({ color }) => color};
  margin-left: -8px;
`;
