import React, { createContext, useContext } from "react";
import { Unsubscribable } from "rxjs";
import { Viewer } from "./viewer";
import { assertDefined } from "@/utils";

import styled from "styled-components";
import SceneService from "@/components/services/scene-service/scene-service";

const CanvasWrapper = styled.div`
  canvas:focus {
    border-top: 2px solid rgb(0, 153, 255);
  }

  canvas {
    border-top: 2px solid transparent;
  }

  width: 100%;
  height: 100vh;
  position: relative;
`;

interface NewViewerComponentProps {
  // settingsService: ProjectSettingsService
  children?: React.ReactNode;
  sceneService: SceneService;
}

export const ViewerContext = createContext<Viewer | undefined>(undefined);

export const useViewer = () => {
  const context = useContext(ViewerContext);
  return context!;
};

export class ViewerComponent extends React.Component<NewViewerComponentProps> {
  private _rootRef: HTMLDivElement | null = null;
  private _viewer: Viewer | undefined;
  private _subscriptions: Unsubscribable[] = [];

  private _props: NewViewerComponentProps;

  private _sceneService: SceneService;

  private _isInitializated = false;

  constructor(props: NewViewerComponentProps) {
    super(props);
    this._props = props;

    this._sceneService = props.sceneService;

    console.log("haaaa");

    // new Viewer()

    this.state = {
      project: undefined,
    };
  }

  componentDidMount() {
    console.log("did mount");

    this._viewer = new Viewer();
    // this._sceneService.addServices({ Viewer: this._viewer });
    // this._viewer.init(assertDefined(this._rootRef));
  }

  componentWillUnmount() {
    this._viewer?.dispose();
    this._subscriptions.forEach((x) => x.unsubscribe());
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  componentDidUpdate() { }

  render() {
    return (
      <ViewerContext.Provider value={this._viewer}>
        <CanvasWrapper ref={(x) => (this._rootRef = x)}>
          {this._props.children}
        </CanvasWrapper>
      </ViewerContext.Provider>
    );
  }
}
