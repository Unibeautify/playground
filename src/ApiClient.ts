import { BeautifyData, Language, OptionsRegistry } from "unibeautify";
import { get } from "lodash";

import { trackEvent, trackPromise } from "./GoogleAnalytics";

export default class ApiClient {
  constructor(private apiUrl: string) {}

  public beautify(payload: BeautifyData): Promise<BeautifyResponse> {
    const { languageName } = payload;
    const beautifiers: string[] = get(
      payload.options,
      [languageName || "", "beautifiers"],
      []
    );
    const eventLabel = beautifiers.join(",");
    trackEvent({
      action: "beautify",
      category: languageName,
      label: eventLabel,
    });
    return trackPromise({
      name: "beautify",
      category: languageName,
      label: eventLabel,
    })(this.fetch<BeautifyResponse>("beautify", payload));
  }

  public support(): Promise<SupportResponse> {
    return trackPromise({
      name: "support",
    })(this.fetch<SupportResponse>("support"));
  }

  private fetch<T>(path: string = "", payload?: object): Promise<T> {
    return fetch(`${this.apiUrl}/${path}`, {
      method: "POST",
      body: payload && JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
    }).then(res => res.json());
  }
}

export interface BeautifyResponse {
  error?: string;
  beautifiedText: string;
}

export interface SupportResponse {
  beautifiers: string[];
  languages: LanguageWithOptions[];
}

export interface LanguageWithOptions extends Language {
  options: OptionsRegistry;
  beautifiers: string[];
}
