import * as React from "react";
import { Link } from "react-router-dom";
import Unibeautify, { BeautifyData } from "unibeautify";
import * as CodeMirror from "react-codemirror";
import * as _ from "lodash";
import Form, { FormProps, IChangeEvent } from "react-jsonschema-form";
import * as LZString from "lz-string";
import { History } from "history";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");

import beautify from "./beautify";

export class Playground extends React.Component<
  PlaygroundProps,
  PlaygroundState
> {
  constructor(props: any) {
    super(props);
    this.state = {
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
      ...this.stateFromUri
    };
    this.beautify = _.throttle(this.beautify.bind(this), 1000, {
      trailing: true
    });
    this.beautify();
  }

  private get stateFromUri(): object {
    const hash = this.locationHash;
    const json = LZString.decompressFromEncodedURIComponent(hash);
    try {
      const payload = JSON.parse(json) || {};
      console.log("loaded state", payload);
      return payload;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  private get locationHash(): string {
    return this.history.location.hash.slice(1);
  }

  private get history(): History {
    return (this.props as any).history;
  }

  public render() {
    const log = (type: string) => console.log.bind(console, type);
    const { languageName, originalText, beautifiedText, options } = this.state;
    return (
      <div className="container-fluid">
        <div className="jumbotron">
          <h1 className="display-3 text-center">Unibeautify Playground</h1>
          <div className="row">
            <div className="col-sm-2">
              <Form
                schema={this.schemaForLanguage(languageName)}
                formData={this.langOptions(languageName)}
                onChange={this.onChangeOptions}
                onSubmit={log("submitted")}
                onError={log("errors")}
              />
            </div>
            <div className="col-sm-5">
              <CodeMirror
                value={originalText}
                onChange={this.onChangeText}
                options={{
                  lineNumbers: true,
                  mode: "javascript"
                }}
              />
            </div>
            <div className="col-sm-5">
              <CodeMirror
                key={beautifiedText}
                value={beautifiedText}
                options={{
                  lineNumbers: true,
                  mode: "javascript"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  private onChangeOptions = (changeEvent: IChangeEvent): void => {
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
  };

  private onChangeText = (newValue: string): void => {
    this.setState(prevState => ({
      ...prevState,
      originalText: newValue
    }));
    this.beautify();
  };

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
    this.updateHash();
    beautify(this.beautifyPayload).then(({ beautifiedText }) => {
      this.setState(prevState => ({
        ...prevState,
        beautifiedText
      }));
    });
  }

  private get beautifyPayload(): BeautifyData {
    return {
      languageName: this.state.languageName,
      options: this.state.options,
      text: this.state.originalText
    };
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
      //   required: ["title"],
      properties: {
        beautifiers: {
          type: "array",
          title: "Beautifiers",
          items: {
            type: "string",
            default: "Prettier",
            enum: ["Prettier", "Pretty Diff"]
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

  private replaceHash(hash: string) {
    this.history.replace(`/#${hash}`);
  }
}

interface PlaygroundProps {}

interface PlaygroundState {
  languageName: string;
  options: {
    [languageName: string]: BeautifyData["options"];
  };
  originalText: string;
  beautifiedText: string;
}
