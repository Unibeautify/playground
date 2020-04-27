import * as React from "react";
import { Language, BeautifyData, OptionsRegistry } from "unibeautify";
import * as CodeMirror from "react-codemirror";
import * as _ from "lodash";
import Form, { IChangeEvent, UiSchema } from "react-jsonschema-form";
import * as LZString from "lz-string";
import { JSONSchema6 } from "json-schema";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/xml/xml");
require("codemirror/mode/jsx/jsx");
require("codemirror/mode/css/css");
require("codemirror/mode/markdown/markdown");
require("codemirror/mode/php/php");

import ApiClient, { SupportResponse, LanguageWithOptions } from "../ApiClient";
import {
  PlaygroundState,
  PlaygroundStatus,
  PlaygroundOptions,
  LanguageOptions,
} from "./types";
import { Nav } from "../Nav";

const websiteBaseUrl = 'https://unibeautify.com/docs';

export class Playground extends React.Component<
  PlaygroundProps,
  PlaygroundState
  > {
  private throttleDelay: number = 5000;

  constructor(props: PlaygroundProps) {
    super(props);
    this.beautify = _.throttle(this.beautify, this.throttleDelay, {
      trailing: true,
    });
  }

  state: PlaygroundState = this.initState(this.props);

  private initState(props: PlaygroundProps): PlaygroundState {
    return {
      options: this.optionsFromLanguages(props.support.languages),
      status: PlaygroundStatus.Init,
      languageName: "JavaScript",
      originalText: `function helloWorld() {
console.log('Hello World');
}`,
      beautifiedText: "",
      ...props.defaultState,
    };
  }

  private optionsFromLanguages(
    languages: PlaygroundProps["support"]["languages"]
  ): PlaygroundOptions {
    return languages.reduce(
      (options, language: LanguageWithOptions) => ({
        ...options,
        [language.name]: {
          beautifiers: language.beautifiers,
        },
      }),
      {} as PlaygroundOptions
    );
  }

  public componentDidMount() {
    console.log("componentDidMount");
    this.requestBeautify();
  }

  public componentWillUnmount() {
    console.log("componentWillUnmount");
  }

  public render() {
    const log = (type: string) => console.log.bind(console, type);
    const { codeMirrorMode } = this;
    const { languageName, originalText, beautifiedText } = this.state;
    return (
      <>
        <Nav state={this.state} />
        <div className="container-fluid">
          <div className="row playground">
            <div className="col-options col-sm-3">
              <Form
                schema={this.jsonSchema}
                uiSchema={this.uiSchema}
                formData={this.langOptions(languageName)}
                onChange={this.onChangeOptions.bind(this)}
                onError={log("errors")}
              >
                <p />
              </Form>
            </div>
            <div className="col-sm-9 pl-0">
              <div className="row">
                <div className="col-sm-6">
                  <div>{this.renderLanguageSelect()}</div>
                </div>
                <div className="col-sm-6">
                  <div>{this.renderStatus()}</div>
                </div>
              </div>
              <div className="row" style={{ height: "100%" }}>
                <div className="col-sm-6">
                  <CodeMirror
                    value={originalText}
                    onChange={this.onChangeText.bind(this)}
                    options={{
                      lineNumbers: true,
                      mode: codeMirrorMode,
                    }}
                  />
                </div>
                <div className="col-sm-6">
                  <CodeMirror
                    key={beautifiedText}
                    value={beautifiedText}
                    options={{
                      lineNumbers: true,
                      mode: codeMirrorMode,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  private get codeMirrorMode(): string {
    const { language } = this;
    return (language && language.codeMirrorMimeType) || "javascript";
  }

  private renderLanguageSelect() {
    const { languageName, languageNames } = this;
    return (
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <label className="input-group-text" htmlFor="inputLanguageSelect">
            Language
          </label>
        </div>
        <select
          className="custom-select"
          id="inputLanguageSelect"
          value={languageName}
          onChange={this.onChangeLanguage.bind(this)}
        >
          {languageNames.map(lang => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
    );
  }

  private onChangeLanguage(event: React.ChangeEvent<HTMLSelectElement>) {
    const newLanguage = (event.target as any).value;
    this.setState(prevState => ({
      ...prevState,
      languageName: newLanguage,
    }));
  }

  private renderStatus() {
    return (
      <div className="lead status" title={this.statusMessage}>
        {this.statusMessage}
      </div>
    );
  }

  private get languageNames(): string[] {
    return this.supportedLanguages.map(lang => lang.name);
  }

  private get supportedLanguages(): Language[] {
    const { support } = this;
    if (support) {
      return support.languages;
    }
    return [];
  }

  private get languageName(): string {
    return this.state.languageName;
  }

  private onChangeOptions(changeEvent: IChangeEvent<LanguageOptions>): void {
    const { languageName } = this.state;
    const { formData } = changeEvent;
    this.setState(prevState => ({
      ...prevState,
      options: {
        ...prevState.options,
        [languageName]: formData,
      },
    }));
    this.requestBeautify();
  }

  private onChangeText(newValue: string): void {
    this.setState(prevState => ({
      ...prevState,
      originalText: newValue,
    }));
    this.requestBeautify();
  }

  private updateHash(): void {
    const hash = LZString.compressToEncodedURIComponent(
      JSON.stringify({
        languageName: this.state.languageName,
        options: this.state.options,
        originalText: this.state.originalText,
      })
    );
    this.replaceHash(hash);
  }

  private requestBeautify() {
    this.setStatus(PlaygroundStatus.BeautifyRequested);
    this.beautify();
  }

  private beautify() {
    this.setStatus(PlaygroundStatus.Sending);
    this.updateHash();
    return this.client
      .beautify(this.beautifyPayload)
      .then(({ beautifiedText, error }) => {
        if (error) {
          this.setError(error);
        } else {
          this.setState(prevState => ({
            ...prevState,
            status: PlaygroundStatus.Beautified,
            beautifiedText,
          }));
        }
      })
      .catch(error => {
        this.setError(error);
      });
  }

  private get beautifyPayload(): BeautifyData {
    return {
      languageName: this.state.languageName,
      options: this.state.options,
      text: this.state.originalText,
    };
  }

  private get statusMessage(): string {
    const { state } = this;
    switch (state.status) {
      case PlaygroundStatus.Init:
        return "Initializing!";
      case PlaygroundStatus.Sending:
        return "Loading...";
      case PlaygroundStatus.Beautified:
        return "Beautified!";
      case PlaygroundStatus.BeautifyRequested:
        return `Waiting for a pause (~${this.throttleDelay / 1000} seconds)...`;
      case PlaygroundStatus.BeautifierError:
        return `Beautify error: ${state.error}`;
      default:
        return "Waiting";
    }
  }

  private setError(error: string): void {
    this.setState(prevState => ({
      ...prevState,
      status: PlaygroundStatus.BeautifierError,
      error,
    }));
  }

  private setStatus(newStatus: PlaygroundStatus): void {
    this.setState(prevState => ({
      ...prevState,
      status: newStatus,
    }));
  }

  private langOptions(languageName: string): LanguageOptions {
    return this.state.options[languageName] || {};
  }

  private get jsonSchema(): JSONSchema6 {
    const { language } = this;
    const languageOptions: OptionsRegistry = language ? language.options : {};
    const options = _.mapValues(languageOptions, (option, key) => ({
      title: this.optionKeyToTitle(key),
      ...option,
      description: undefined,
    }));
    return {
      title: `${this.state.languageName} Options`,
      type: "object",
      required: ["beautifiers", "indent_style", "indent_size"],
      properties: {
        beautifiers: {
          type: "array",
          title: "Beautifiers",
          items: {
            type: "string",
            default: this.supportedBeautifiers[0],
            enum: this.supportedBeautifiers,
          },
        },
        ...options,
      },
    };
  }

  private get uiSchema(): UiSchema {
    const { language } = this;
    const languageOptions: OptionsRegistry = language ? language.options : {};
    return _.mapValues(languageOptions, (option, key) => {
      const docsUrl = this.docsUrlForOption(key, option.title, language?.name);
      const ui: UiSchema = {
        "ui:help": (<div>
          <a href={docsUrl} target="_blank" title={`Open docs for ${option.title || this.optionKeyToTitle(key)}`}>
            <i className="fa fa-external-link"></i>
          </a> {option.description}
        </div>)
      };
      if (option.type === "integer") {
        ui["ui:widget"] = "updown";
      }
      return ui;
    });
  }

  private docsUrlForOption(
    key: string,
    optionTitle: string | undefined,
    languageName?: string
  ): string {
    const title: string = optionTitle || this.optionKeyToTitle(key);
    const docId = `option-${slugify(title)}`;
    const url = new URL(`${websiteBaseUrl}/${docId}`);
    if (languageName) {
      url.searchParams.set('language', slugify(languageName));
    }
    return url.toString();
  }

  private optionKeyToTitle(key: string): string {
    return key
      .split("_")
      .map(_.capitalize)
      .join(" ");
  }

  private get language(): LanguageWithOptions | undefined {
    const { languageName } = this.state;
    const { support } = this;
    if (support) {
      const { languages } = support;
      const language = languages.find(
        (lang: Language) => lang.name === languageName
      );
      return language;
    }
    return;
  }

  private get supportedBeautifiers(): string[] {
    const { language } = this;
    if (language) {
      return language.beautifiers;
    }
    return [];
  }

  private get client(): ApiClient {
    return this.props.client;
  }

  private get support(): SupportResponse {
    return this.props.support;
  }

  private replaceHash(hash: string) {
    this.props.replaceHash(hash);
  }
}

interface PlaygroundProps {
  client: ApiClient;
  support: SupportResponse;
  defaultState: Partial<PlaygroundState>;
  replaceHash(hash: string): void;
}

export function slugify(title: string): string {
  return encodeURIComponent(
    title
      .toLowerCase()
      .replace("c#", "csharp")
      .replace("c++", "cpp")
      .replace(/ /g, "-")
      .replace(/\+/g, "-")
  );
}
