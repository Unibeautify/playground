import * as React from "react";
import { Link } from "react-router-dom";
import Unibeautify, { BeautifyData } from "unibeautify";
import * as CodeMirror from "react-codemirror";
import * as _ from "lodash";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");

import beautify from "./beautify";
import beautifiers from "./beautifiers";
Unibeautify.loadBeautifiers(beautifiers);

(window as any).unibeautify = Unibeautify;

const languageName = "JavaScript";

export class Playground extends React.Component<
  PlaygroundProps,
  PlaygroundState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      languageName: "Javascript",
      originalText: `function helloWorld() {
console.log('Hello World');
}`,
      beautifiedText: "",
      options: JSON.stringify(
        {
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
        null,
        2
      )
    };
    this.beautify = _.throttle(this.beautify.bind(this), 1000, {
      trailing: true
    });
    this.beautify();
  }

  public render() {
    const { originalText, beautifiedText, options } = this.state;
    return (
      <div className="container-fluid">
        <div className="jumbotron">
          <h1 className="display-3 text-center">Unibeautify Playground</h1>
          <div className="row">
            <div className="col-sm">
              <CodeMirror
                value={options}
                onChange={this.onChangeOptions}
                options={{
                  lineNumbers: true,
                  mode: "javascript"
                }}
              />
            </div>
            <div className="col-sm">
              <CodeMirror
                value={originalText}
                onChange={this.onChangeText}
                options={{
                  lineNumbers: true,
                  mode: "javascript"
                }}
              />
            </div>
            <div className="col-sm">
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

  private onChangeOptions = (newValue: string): void => {
    this.setState(prevState => ({
      ...prevState,
      options: newValue
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

  private beautify() {
    beautify(this.beautifyPayload).then(({ beautifiedText }) => {
      this.setState(prevState => ({
        ...prevState,
        beautifiedText
      }));
    });
  }

  private get beautifyPayload(): BeautifyData {
    return {
      languageName: languageName,
      options: this.beautifyOptions,
      text: this.state.originalText
    };
  }

  private get beautifyOptions(): BeautifyData["options"] {
    try {
      return JSON.parse(this.state.options);
    } catch (error) {
      return {};
    }
  }
}

interface PlaygroundProps {}

interface PlaygroundState {
  languageName: string;
  options: string; // BeautifyData["options"]
  originalText: string;
  beautifiedText: string;
}
