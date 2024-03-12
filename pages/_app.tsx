import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createGlobalStyle } from "styled-components";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <GlobalStyle />

      <Component {...pageProps} />
    </>
  );
};

const Colors = {
  Primary: "#2689FF",
  PrimaryHover: "#51A1FF",
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;

    &, & * {
      color: #333333;
      font-size: 12px;
    }
  }

  ::-webkit-scrollbar {
    width: 3px; /* width of the entire scrollbar */
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
  
  // Papers
  & .MuiPaper-root {
    & {
      & {
        border-radius: 18px !important;
        box-shadow: none !important;
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

    // MUI BUTTONS - PRIMARY
    &.MuiButton-containedPrimary {
      background-color: ${Colors.Primary};

      &:hover {
        background-color: ${Colors.PrimaryHover};
      }
    }

    // MUI BUTTONS - SECONDARY
    &.MuiButton-containedSecondary {
      background-color: transparent;

      &, & * {
        color: #333333;
      }

      &:hover {
        background-color: #F5FAFF;
      }

      &[data-active="true"] {
        background-color: #ECF5FF;

        &, & * {
          color: ${Colors.Primary};
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

    &:hover {
      background-color: #F5FAFF
    }
  }

  // MUI SELECT
  & .MuiInputBase-root[data-type='select'] {
    & .MuiOutlinedInput-notchedOutline {
      border: 1px solid rgba(0, 0, 0, 0);
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
      background-color: #F3F3F3;
      border: 1px solid rgba(0, 0, 0, 0);

      &, & * {
        font-size: 12px;
      }
    }
  }

  // Radix Select
  @import '@radix-ui/colors/black-alpha.css';
  @import '@radix-ui/colors/mauve.css';
  @import '@radix-ui/colors/violet.css';

  /* reset */
  button {
    all: unset;
  }

  .SelectTrigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0 15px;
    font-size: 13px;
    line-height: 1;
    height: 35px;
    gap: 5px;
    background-color: white;
    color: var(--violet-11);
    box-shadow: 0 2px 10px var(--black-a7);
  }
  .SelectTrigger:hover {
    background-color: var(--mauve-3);
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
`;

export default App;
