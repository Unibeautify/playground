import * as React from "react";
import * as GitHubButton from "react-github-button";
import * as CopyToClipboard from "react-copy-to-clipboard";

import { homepage } from "../package.json";
import { ReportIssueButton } from "./ReportIssueButton";
import { PlaygroundState } from "./Playground/types";

export class Nav extends React.Component<NavProps, {}> {
  public render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">
          Unibeautify Playground
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <CopyToClipboard text={window.location.href}>
                <button
                  className="btn btn-outline-primary my-2 my-sm-0"
                  type="submit"
                  title="Copy link to current playground configuration"
                >
                  Copy Link
                </button>
              </CopyToClipboard>
            </li>
            <li className="nav-item">
              <ReportIssueButton state={this.props.state} />
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
            <a
              href={homepage}
              target="_blank"
              className="btn btn-outline-info my-2 my-sm-0 mr-2"
              title="Contribute to playground"
            >
              Contribute
            </a>
            <GitHubButton
              type="stargazers"
              size="large"
              namespace="unibeautify"
              repo="unibeautify"
            />
          </form>
        </div>
      </nav>
    );
  }
}

export interface NavProps {
  state: PlaygroundState;
}
