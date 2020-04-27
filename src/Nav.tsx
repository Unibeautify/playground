import * as React from "react";
import * as GitHubButton from "react-github-button";
import * as CopyToClipboard from "react-copy-to-clipboard";
import "bootstrap/js/dist/collapse";

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
              <a
                className="btn btn-outline-info my-2 my-sm-0"
                type="button"
                title="Open the Unibeautify configuration assistant"
                href={"https://assistant.unibeautify.com/#/setup"}
                target="_blank"
              >
                <i className="fa fa-info" /> Config Assistant
              </a>
            </li>
            {/* <li className="nav-item">
              <a
                className="btn btn-outline-info my-2 my-sm-0"
                type="button"
                href={"https://unibeautify.com/docs/config-file"}
                target="_blank"
                title="Learn how to create configuration file"
              >
                <i className="fa fa-question" />{' '}
                How to create config file
              </a>
            </li> */}
            <li className="nav-item">
              <CopyToClipboard text={window.location.href}>
                <button
                  className="btn btn-outline-primary my-2 my-sm-0"
                  type="button"
                  title="Copy link to current playground configuration"
                >
                  <i className="fa fa-clipboard" /> Copy Link
                </button>
              </CopyToClipboard>
            </li>
            <li className="nav-item">
              <CopyToClipboard
                text={JSON.stringify(this.props.state.options, null, 2)}
              >
                <a
                  className="btn btn-outline-success my-2 my-sm-0"
                  type="button"
                  title="Export configuration as JSON into clipboard"
                  href={"https://unibeautify.com/docs/config-file"}
                  target="_blank"
                >
                  <i className="fa fa-sliders" /> Copy config JSON
                </a>
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
              className="btn btn-outline-dark my-2 my-sm-0 mr-2"
              title="Contribute to playground"
            >
              <i className="fa fa-code" /> Contribute
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
