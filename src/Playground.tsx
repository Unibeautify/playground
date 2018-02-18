import * as React from "react";
import { Link } from "react-router-dom";
import Unibeautify, { Language, BeautifyData } from "unibeautify";
import * as CodeMirror from "react-codemirror";
import * as _ from "lodash";
import Form, { FormProps, IChangeEvent } from "react-jsonschema-form";
import * as LZString from "lz-string";
import { History } from "history";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");

import ApiClient, { SupportResponse } from "./ApiClient";

export class Playground extends React.Component<
  PlaygroundProps,
  PlaygroundState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      status: PlaygroundStatus.Init,
      languageName: "JavaScript",
      originalText: `function helloWorld() {
console.log('Hello World');
}`,
      beautifiedText: "",
      options: {
        JavaScript: {
          beautifiers: ["Pretty Diff", "Prettier"],
          align_assignments: false,
          arrow_parens: "as-needed",
          break_chained_methods: true,
          end_with_comma: true,
          end_with_semicolon: true,
          indent_char: " ",
          indent_size: 2,
          jsx_brackets: false,
          multiline_ternary: true,
          object_curly_spacing: true,
          quotes: "double",
          space_after_anon_function: false,
          wrap_line_length: 80
        } as any
      },
      ...this.props.defaultState
    };
    this.beautify = _.throttle(this.beautify, 1000, {
      trailing: true
    });
  }

  public componentDidMount() {
    console.log("componentDidMount");
    this.beautify();
  }

  public componentWillUnmount() {
    console.log("componentWillUnmount");
  }

  public render() {
    const log = (type: string) => console.log.bind(console, type);
    const { codeMirrorMode } = this;
    const { languageName, originalText, beautifiedText, options } = this.state;
    return (
      <div className="row">
        <div className="col-sm-2">
          <Form
            schema={this.schemaForLanguage(languageName)}
            formData={this.langOptions(languageName)}
            onChange={this.onChangeOptions.bind(this)}
            onSubmit={log("submitted")}
            onError={log("errors")}
          />
        </div>
        <div className="col-sm-10">
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
                  mode: codeMirrorMode
                }}
              />
            </div>
            <div className="col-sm-6">
              <CodeMirror
                key={beautifiedText}
                value={beautifiedText}
                options={{
                  lineNumbers: true,
                  mode: codeMirrorMode
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private get codeMirrorMode(): string {
    const { languageName } = this.state;
    const { support } = this;
    if (support) {
      const { languages } = support;
      const language: Language = languages.find(
        (lang: Language) => lang.name === languageName
      );
      if (language) {
        return language.aceMode;
      }
    }
    return "javascript";
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
      languageName: newLanguage
    }));
  }

  private renderStatus() {
    return <div className="lead">{this.statusMessage}</div>;
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

  private onChangeOptions(changeEvent: IChangeEvent): void {
    const { languageName } = this.state;
    const { formData } = changeEvent;
    this.setState(prevState => ({
      ...prevState,
      options: {
        ...prevState.options,
        [languageName]: formData
      }
    }));
    this.beautify();
  }

  private onChangeText(newValue: string): void {
    this.setState(prevState => ({
      ...prevState,
      originalText: newValue
    }));
    this.beautify();
  }

  private updateHash(): void {
    const hash = LZString.compressToEncodedURIComponent(
      JSON.stringify({
        languageName: this.state.languageName,
        options: this.state.options,
        originalText: this.state.originalText
      })
    );
    this.replaceHash(hash);
  }

  private beautify() {
    this.setStatus(PlaygroundStatus.Sending);
    this.updateHash();
    return this.client
      .beautify(this.beautifyPayload)
      .then(({ beautifiedText }) => {
        this.setState(prevState => ({
          ...prevState,
          status: PlaygroundStatus.Beautified,
          beautifiedText
        }));
      })
      .catch(error => {
        this.setStatus(PlaygroundStatus.BeautifierError);
      });
  }

  private get beautifyPayload(): BeautifyData {
    return {
      languageName: this.state.languageName,
      options: this.state.options,
      text: this.state.originalText
    };
  }

  private get statusMessage(): string {
    switch (this.state.status) {
      case PlaygroundStatus.Init:
        return "Initializing!";
      case PlaygroundStatus.Sending:
        return "Loading...";
      case PlaygroundStatus.Beautified:
        return "Beautified!";
      default:
        return "Waiting";
    }
  }

  private setStatus(newStatus: PlaygroundStatus): void {
    this.setState(prevState => ({
      ...prevState,
      status: newStatus
    }));
  }

  private langOptions(languageName: string): BeautifyData["options"][string] {
    return this.state.options[languageName] || {};
  }

  private schemaForLanguage(languageName: string): FormProps["schema"] {
    return this.schema;
  }

  private get schema(): FormProps["schema"] {
    return {
      title: `${this.state.languageName} Options`,
      type: "object",
      required: ["beautifiers", "indent_char", "indent_size"],
      properties: {
        beautifiers: {
          type: "array",
          title: "Beautifiers",
          items: {
            type: "string",
            default: this.supportedBeautifiers[0],
            enum: this.supportedBeautifiers
            // default: "Prettier",
            // enum: ["Prettier", "Pretty Diff"]
          }
        },
        align_assignments: {
          type: "boolean",
          title: "Align Assignments",
          default: false
        },
        arrow_parens: {
          type: "string",
          title: "Arrow Parens",
          default: "as-needed",
          enum: ["as-needed", "always"]
        },
        break_chained_methods: {
          type: "boolean",
          title: "Break Chained Methods",
          default: true
        },
        end_with_comma: {
          type: "boolean",
          title: "End with comma",
          default: true
        },
        end_with_semicolon: {
          type: "boolean",
          title: "End with semicolon",
          default: true
        },
        indent_char: {
          type: "string",
          title: "Indent Char",
          default: " ",
          enum: [" ", "\t"]
        },
        indent_size: {
          type: "integer",
          title: "Indent Size",
          default: 2
        },
        jsx_brackets: {
          type: "boolean",
          title: "JSX Brackets",
          default: false
        },
        multiline_ternary: {
          type: "boolean",
          title: "Multiline Ternary",
          default: true
        },
        object_curly_spacing: {
          type: "boolean",
          title: "Object curly spacing",
          default: true
        },
        quotes: {
          type: "string",
          title: "Quotes",
          default: "double",
          enum: ["double", "single"]
        },
        space_after_anon_function: {
          type: "boolean",
          title: "Space after anonymous function",
          default: false
        },
        wrap_line_length: {
          type: "integer",
          title: "Wrap line length",
          default: 80
        }
      }
    };
  }

  private get supportedBeautifiers(): string[] {
    const { support } = this;
    if (support) {
      return support.beautifiers.sort();
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

interface PlaygroundState {
  status: PlaygroundStatus;
  languageName: string;
  options: {
    [languageName: string]: BeautifyData["options"];
  };
  originalText: string;
  beautifiedText: string;
}

enum PlaygroundStatus {
  Init,
  LoadingSupport,
  SupportLoaded,
  BeautifierError,
  OptionsError,
  Sending,
  Beautified
}
