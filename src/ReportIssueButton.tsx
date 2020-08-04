import * as React from "react";
import * as _ from "lodash";
import { PlaygroundState } from "./Playground/types";

export class ReportIssueButton extends React.PureComponent<
  ReportIssueButtonProps,
  {}
> {
  public render() {
    const { beautifiers } = this;
    if (beautifiers.length === 0) {
      return null;
    }
    if (beautifiers.length === 1) {
      const beautifier = beautifiers[0];
      const body = createMarkdownBody(this.props.state);
      const url = createIssueUrl(beautifier, body);
      return (
        <Button
          title={`Report a formatter issue for ${beautifier} beautifier`}
          target="_blank"
          href={url}
        >
          <i className="fa fa-bug" /> Report {beautifiers} Issue
        </Button>
      );
    }
    const message = `Please select only 1 beautifier from ${beautifiers.join(
      " or "
    )} to report a specific issue. This is required to narrow down where the problem is.`;
    return (
      <Button title={message} href="#" onClick={() => alert(message)}>
        <i className="fa fa-bug" /> Report an issue
      </Button>
    );
  }

  private get beautifiers() {
    return this.langOptions.beautifiers || [];
  }

  private get langOptions() {
    const { state } = this.props;
    const { options, languageName } = state;
    return options[languageName] || {};
  }
}

export interface ReportIssueButtonProps {
  state: PlaygroundState;
}

const Button = (props: JSX.IntrinsicElements["a"]) => (
  <a className="btn btn-outline-danger my-2 my-sm-0" type="button" {...props} />
);

function createIssueUrl(beautifier: string, body: string): string {
  const beautifierProject =
    beautifierProjects[beautifier] || "Unibeautify/playground";
  const url = new URL(`https://github.com/${beautifierProject}/issues/new`);
  url.searchParams.set("title", "");
  url.searchParams.set("body", body);
  return url.toString();
}

function createMarkdownBody(state: PlaygroundState): string {
  const shortOptions = {
    [state.languageName]: state.options[state.languageName],
  };
  return `[Unibeautify Playground link](${window.location.href})

**Language:** ${state.languageName}

**Config**:
\`\`\`
${JSON.stringify(shortOptions, null, 2)}
\`\`\`

**Input**:
\`\`\`
${state.originalText}
\`\`\`

${
  state.error
    ? `**Error**:
\`\`\`
${state.error}
\`\`\`

`
    : ""
}
**Output**:
\`\`\`
${state.beautifiedText}
\`\`\`

**Expected behavior:**

`;
}

const beautifierProjects: { [beautifierName: string]: string } = {
  Prettier: "Unibeautify/beautifier-prettier",
  "Pretty Diff": "Unibeautify/beautifier-prettydiff",
  "JS-Beautify": "Unibeautify/beautifier-js-beautify",
  ESLint: "Unibeautify/beautifier-eslint",
  "PHP-CS-Fixer": "Unibeautify/beautifier-php-cs-fixer",
};
