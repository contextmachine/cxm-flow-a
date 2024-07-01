import { createGlobalStyle } from "styled-components";

const Colors = {
  Primary: "#2689FF",
  PrimaryHover: "#51A1FF",
};

const GlobalStyle = createGlobalStyle<{
  darkMode: boolean;
}>`
  :root {
    --button-primary-color: #2689FF;

    --button-secondary-color: ${(props) =>
      props.darkMode ? "#444444" : "#F3F3F3"};
    --button-secondary-hover-color: ${(props) =>
      props.darkMode ? "#4F4F4F" : "#F5FAFF"};
    --button-secondary-border-color: ${(props) =>
      props.darkMode ? "#444444" : "rgba(0,0,0,0.1)"};

    --button-secondary-danger-text-color: ${(props) =>
      props.darkMode ? "#ff6c6c" : "#AA1A1A"};

    --button-secondary-active-bg-color: ${(props) =>
      props.darkMode ? "#444444" : "#ECF5FF"};
    --button-secondary-active-text-color: ${(props) =>
      props.darkMode ? "#FFFFFF" : "#2689FF"};

    --icon-button-color: ${(props) =>
      props.darkMode ? "#444444" : "transparent"};
    --icon-button-hover-color: ${(props) =>
      props.darkMode ? "#4F4F4F" : "#ECF5FF"};

    --paper-bg-color: ${(props) => (props.darkMode ? "#2C2C2C" : "#FFFFFF")};
    --main-text-color: ${(props) => (props.darkMode ? "#FFFFFF" : "#333333")};
    --main-bg-color: ${(props) => (props.darkMode ? "#1E1E1E" : "#F3F3F3")};
    --font-size: 12px;

    --box-border-color: ${(props) =>
      props.darkMode ? "#444444" : "rgba(0, 0, 0, 0.12)"};

    --select-bg-color: ${(props) => (props.darkMode ? "#444444" : "#F3F3F3")};
  }

  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
    background-color: var(--main-bg-color);

    &, & * {
      color: var(--main-text-color);
      font-size: var(--font-size);
    }
  }

  ::-webkit-scrollbar {
    width: 3px; /* width of the entire scrollbar */
    display: none;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0,0,0,0);
  }

  ::-webkit-scrollbar-thumb {
    background: #8C8C8C; /* color of the scroll thumb /
    border-radius: 3px; / roundness of the scroll thumb */
    }
    
  ::-webkit-scrollbar-thumb:hover {
    background: #555; /* color when hovering over the scroll thumb */
  }

  // TEXT INPUTS
  & .MuiInputBase-root {
    border-radius: 9px;

    background-color: var(--select-bg-color);
    &,
    & * {
      color: var(--main-text-color);
    }

    & input {
      height: 33px;
      box-sizing: border-box;
      font-size: 12px;
      padding: 0 9px;
    }
  }

  // FORM LABELS
  & .MuiFormControlLabel-root, & .MuiFormControlLabel-root .MuiTypography-root {
    &, & * {
      color: var(--main-text-color);
      font-size: 12px;
    }
  }

  // SNACKBARS
  & .MuiSnackbarContent-root {
    background-color: #333333 !important;

    &, & * {
      font-size: 12px;
      color: white;
    }
  }
  
  // Papers
  & .MuiPaper-root {
    & {
      & {
        border-radius: 18px !important;
        box-shadow: none !important;
        background-color: var(--paper-bg-color);
        position: relative;
        display: flex;
        gap: 9px;

        padding: 9px;
        box-sizing: border-box;
      }
    }
  }

  // MUI BUTTONS
  & .MuiButton-root {
    border-radius: 9px;
    margin-top: 0px;

    &, &:hover, &:active, &:focus {
      box-shadow: none;
     }

    &, & * {
      font-weight: 500;
      text-transform: none;
    }
    
    &.MuiButton-containedSizeMedium {
      height: 27px;
      
      &, & * {
        font-size: 12px;
      }
    }

    &.MuiButton-containedSizeLarge {
      height: 33px;

      &, & * {
        font-size: 12px;
      }
    }

    // MUI BUTTONS - PRIMARY
    &.MuiButton-containedPrimary:not(.Mui-disabled) {
      background-color: ${Colors.Primary};

      &:hover {
        background-color: ${Colors.PrimaryHover};
      }
    }

    // MUI BUTTONS - SECONDARY
    &.MuiButton-containedSecondary {
      background-color: var(--button-secondary-color);

      &[data-type='danger'] {
        color: var(--button-secondary-danger-text-color);
      }

      &, & * {
        color: var(--main-text-color);
      }

      &:hover {
        background-color: var(--button-secondary-hover-color);
      }

      &[data-active="true"] {
        background-color: var(--button-secondary-active-bg-color);

        &, & * {
          color: var(--button-secondary-active-text-color) !important;
        }
      }

      &[data-active="false"] {
        background-color: transparent;

        &, & * {
          color: var(--main-text-color);
        }
      }
    }
  }

  // MUI BUTTON GROUP
  & .MuiButtonGroup-root {
   & > * {
    border-top-right-radius: 9px !important;
    border-bottom-right-radius: 9px !important;
    border-top-left-radius: 9px !important;
    border-bottom-left-radius: 9px !important;
   }
  }

  // MUI ICON BUTTONS
  & .MuiIconButton-root {
    padding: 0;
    background-color: var(--icon-button-color);
    border-radius: 9px;

    &:hover {
      background-color: var(--icon-button-hover-color);
    }
  }

  // MUI SELECT
  & .MuiInputBase-root[data-type='select'] {
    & .MuiOutlinedInput-notchedOutline {
      border: 1px solid rgba(0, 0, 0, 0);
    }

    & .MuiSvgIcon-root {
      display: none;
    }

    & {
      border-radius: 9px;
      min-width: max-content;
      border: 1px solid rgba(0, 0, 0, 0);
    }

    & .MuiSelect-select {
      border-radius: 9px;
      padding: 0px 10px;
      height: 24px;
      background-color: var(--select-bg-color);
      border: 1px solid rgba(0, 0, 0, 0);
      display: flex;
      align-items: center;
      justify-content: space-between;

      &::after {
        content: '';
        position: relative;
        background-image: url('/icons/arrow-select.svg');
        background-size: contain;
        min-width: 6.5px;
        min-height: 6px;
        max-width: 6.5px;
        max-height: 6px;
        margin-left: 9px;
      }

      &, & * {
        color: var(--main-text-color);
        font-size: 12px;
      }
    }
  }

  // SELECT MENU BADGE
  & .MuiInputBase-root[data-type='role-badge'] {
    &, & * {
      font-size: 12px;
      background-color: lightgrey;
      border-radius: 9px;
    }

    & .MuiSelect-select {
      padding: 0px 24px
    }

    &::before, &::after {
      display: none;
    }
  }

  // SELECT MENU
  .MuiPopover-paper {
      max-width: max-content !important;
      max-height: max-content !important;
  }

  .MuiPaper-root.MuiPopover-paper.MuiMenu-paper {
    border: 1px solid #EEEEEE;
    border-radius: 13.5px !important;
    max-width: max-content;
    padding: 4px;

    &, & * {
      font-size: 12px;
    }

    & .MuiList-root {
      width: 100%;
      padding: 0px 0px;

      & .MuiMenuItem-root {
        border-radius: 9px;

        &.Mui-selected {
          background-color: #2689FF;

          &, & * {
            color: white;
          }
        }
      }
    }
  }

  // MUI Slider
  & .MuiSlider-root[data-type='params'] {
    padding: 0;
    height: 24px;
    border-radius: 9px;

    & .MuiSlider-thumb {
      height: 24px;
      border-radius: 6px;
    }

    & .MuiSlider-rail {
      background-color: var(--select-bg-color);
      opacity: 1;
    }

    & .MuiSlider-track {
      border-radius: 9px 0 0 9px;
      opacity: 0.35;
    }
  }

  // MUI TREE GRID
  && .MuiTreeView-root {
    & .Mui-selected {
      background-color: transparent !important;
    }

    & .MuiTreeItem-content {
      height: calc(21px + 6px);
      border-radius: 9px;

      & .MuiTreeItem-label {
        &, & * {
          font-size: 12px;
        }
      }
    }
  }

  // MUI Accordion
  & .MuiAccordion-root {
   &, & * {
    font-size: var(--font-size);
   }

   gap: 0px;

   & .MuiAccordionSummary-root {
    & .MuiAccordionSummary-content {
      margin: 0;
     }

     min-height: max-content;
   }
  }

  .SelectTrigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    padding: 0 9px;
    font-size: 12px;
    line-height: 1;
    height: 24px;
    gap: 5px;
    background-color: #F3F3F3;
    color: var(--violet-11);
    box-shadow: 0 2px 10px var(--black-a7);
    cursor: pointer;
  }
  .SelectTrigger:hover {
    background-color: #E7E7E7
  }
  .SelectTrigger:focus {
    box-shadow: 0 0 0 2px black;
  }
  .SelectTrigger[data-placeholder] {
    color: var(--violet-9);
  }

  .SelectIcon {
    color: Var(--violet-11);
  }

  .SelectContent {
    overflow: hidden;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  }

  .SelectViewport {
    padding: 5px;
  }

  .SelectItem {
    font-size: 13px;
    line-height: 1;
    color: var(--violet-11);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 25px;
    padding: 0 35px 0 25px;
    position: relative;
    user-select: none;
  }
  .SelectItem[data-disabled] {
    color: var(--mauve-8);
    pointer-events: none;
  }
  .SelectItem[data-highlighted] {
    outline: none;
    background-color: var(--violet-9);
    color: var(--violet-1);
  }

  .SelectLabel {
    padding: 0 25px;
    font-size: 12px;
    line-height: 25px;
    color: var(--mauve-11);
  }

  .SelectSeparator {
    height: 1px;
    background-color: var(--violet-6);
    margin: 5px;
  }

  .SelectItemIndicator {
    position: absolute;
    left: 0;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .SelectScrollButton {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    background-color: white;
    color: var(--violet-11);
    cursor: default;
  }

  // Radix Context Menu
  .ContextMenuTrigger {
    display: block;
    border: 2px white dashed;
    color: white;
    border-radius: 4px;
    font-size: 15px;
    user-select: none;
    padding: 45px 0;
    width: 300px;
    text-align: center;
  }

  .ContextMenuContent,
  .ContextMenuSubContent {
    border-radius: 13.5px;
    min-width: 220px;
    background-color: white;
    overflow: hidden;
    padding: 5px;
    box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  }

  .ContextMenuItem,
  .ContextMenuCheckboxItem,
  .ContextMenuRadioItem,
  .ContextMenuSubTrigger {
    font-size: 12px;
    line-height: 1;
    color: var(--violet-11);
    border-radius: 9px;
    display: flex;
    align-items: center;
    height: 27px;
    padding: 0 5px;
    position: relative;
    padding-left: 25px;
    user-select: none;
    outline: none;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
  .ContextMenuSubTrigger[data-state='open'] {
    background-color: var(--violet-4);
    color: var(--violet-11);

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
  .ContextMenuItem[data-disabled],
  .ContextMenuCheckboxItem[data-disabled],
  .ContextMenuRadioItem[data-disabled],
  .ContextMenuSubTrigger[data-disabled] {
    color: var(--mauve-8);
    pointer-events: 'none';
  }
  .ContextMenuItem[data-highlighted],
  .ContextMenuCheckboxItem[data-highlighted],
  .ContextMenuRadioItem[data-highlighted],
  .ContextMenuSubTrigger[data-highlighted] {
    background-color: var(--violet-9);
    color: var(--violet-1);
  }

  .ContextMenuLabel {
    padding-left: 25px;
    font-size: 12px;
    line-height: 25px;
    color: var(--mauve-11);
  }

  .ContextMenuSeparator {
    height: 1px;
    background-color: var(--violet-6);
    margin: 5px;
  }

  .ContextMenuItemIndicator {
    position: absolute;
    left: 0;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .RightSlot {
    margin-left: auto;
    padding-left: 20px;
    color: var(--mauve-11);
  }
  [data-highlighted] > .RightSlot {
    color: white;
  }
  [data-disabled] .RightSlot {
    color: var(--mauve-8);
  }
`;

export default GlobalStyle;
