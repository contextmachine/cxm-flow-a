import styled from "styled-components";

export const Tabs = styled.div<{ $activeTab: number }>`
  width: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  background-color: var(--main-bg-color);
  height: 30px;
  border-radius: 9px;
  padding: 3px;

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
  }
  .tab.active {
    background-color: var(--paper-bg-color);
    border-radius: 6px;
    box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.1);
  }
`;
