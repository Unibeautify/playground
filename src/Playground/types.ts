import { BeautifyData, LanguageOptionValues, OptionValues } from "unibeautify";

/*
export interface PlaygroundStateBase {
  status: PlaygroundStatus;
  languageName: string;
  options: {
    [languageName: string]: BeautifyData["options"];
  };
  originalText: string;
  beautifiedText: string;
}

export interface PlaygroundStateWithError extends PlaygroundStateBase {
  status: PlaygroundStatus.BeautifierError;
  error: string;
}

export interface PlaygroundStateWithoutError extends PlaygroundStateBase {
  status: Exclude<PlaygroundStatus, PlaygroundStatus.BeautifierError>;
  error?: undefined;
}

export type PlaygroundState = PlaygroundStateWithError | PlaygroundStateWithoutError;
*/

export interface PlaygroundState {
  status: PlaygroundStatus;
  languageName: string;
  options: PlaygroundOptions;
  originalText: string;
  beautifiedText: string;
  error?: string;
}

// export type PlaygroundOptions = LanguageOptionValues;
// BeautifyData["options"][string]
export interface PlaygroundOptions {
  // [languageName: string]: BeautifyData["options"];
  [languageName: string]: LanguageOptions;
}

export interface LanguageOptions extends OptionValues {
  beautifiers: string[];
}

export enum PlaygroundStatus {
  Init,
  LoadingSupport,
  SupportLoaded,
  BeautifierError,
  OptionsError,
  BeautifyRequested,
  Sending,
  Beautified,
}
