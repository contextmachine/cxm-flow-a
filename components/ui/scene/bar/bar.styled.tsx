import styled, { css } from "styled-components";

export const TitleWrapper = styled.div`
  border: 1px solid transparent;
  display: flex;
  overflow: hidden;
  border-radius: 9px;

  &:hover {
    border-color: #333333;
  }
`;

export const AvatarCss = css<{ color?: string }>`
  min-width: 36px;
  width: 36px;
  height: 100%;
  position: relative;
  margin-left: -4.5px;

  &&::before {
    content: "";
    display: block;
    position: absolute;
    width: 36px;
    height: 36px;
    transform: translateY(-4.5px);
    border-radius: 13.5px;
    background-color: ${({ color }) => color || "#333333"};
  }
`;

export const Title = styled.div<{
  size?: "small" | "medium" | "large" | "large-number";
}>`
  font-size: 12px;
  font-weight: 500;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${({ size }) => {
    if (size === "small") {
      return `
        font-size: 10px;
      `;
    }
    if (size === "medium") {
      return `
        font-size: 12px;
      `;
    }
    if (size === "large") {
      return `
        font-size: 15px;
      `;
    }
    if (size === "large-number") {
      return `
        font-size: 24px;
      `;
    }
  }}
`;

export const CompanyAvatar = styled.div`
  ${AvatarCss}
`;
