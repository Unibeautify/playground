import * as React from "react";
import { Link } from "react-router-dom";
import Unibeautify, { Language, BeautifyData } from "unibeautify";
import * as CodeMirror from "react-codemirror";
import * as _ from "lodash";
import Form, { FormProps, IChangeEvent } from "react-jsonschema-form";
import * as LZString from "lz-string";
import { History } from "history";
import * as GitHubButton from "react-github-button";

require("codemirror/lib/codemirror.css");
require("codemirror/mode/javascript/javascript");
require("react-github-button/assets/style.css");

import ApiClient, { SupportResponse } from "./ApiClient";
import { Playground } from "./Playground";

const apiUrl: string = "https://unibeautify-playground-eijdodv3e08v.runkit.sh";

(window as any).Unibeautify = Unibeautify;

export class Container extends React.Component<ContainerProps, ContainerState> {
  private readonly client: ApiClient;

  constructor(props: any) {
    super(props);
    this.client = new ApiClient(apiUrl);
    this.state = {
      status: ContainerStatus.Init,
      support: undefined
    };
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

  public componentDidMount() {
    console.log("componentDidMount");
    this.loadSupport();
  }

  public componentWillUnmount() {
    console.log("componentWillUnmount");
  }

  private loadSupport() {
    return this.client.support().then(support => {
      console.log("Support", support);
      this.setState(prevState => ({
        ...prevState,
        status: ContainerStatus.SupportLoaded,
        support
      }));
    });
  }

  public render() {
    return (
      <div>
        {this.renderNav()}
        <div className="container-fluid">{this.renderBody()}</div>
      </div>
    );
  }

  private renderNav() {
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
              <button
                className="btn btn-outline-primary my-2 my-sm-0"
                type="submit"
              >
                Copy Link
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-outline-danger my-2 my-sm-0"
                type="submit"
              >
                Report Issue
              </button>
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
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

  private renderBody() {
    if (!this.state.support) {
      return <div className="">Loading...</div>;
    }

    return (
      <Playground
        client={this.client}
        support={this.state.support}
        defaultState={this.stateFromUri}
        replaceHash={this.replaceHash}
      />
    );
  }

  private setStatus(newStatus: ContainerStatus): void {
    this.setState(prevState => ({
      ...prevState,
      status: newStatus
    }));
  }

  private replaceHash = (hash: string) => {
    this.history.replace(`/#${hash}`);
  };
}

interface ContainerProps {}

interface ContainerState {
  status: ContainerStatus;
  support?: SupportResponse;
}

enum ContainerStatus {
  Init,
  LoadingSupport,
  SupportLoaded,
  BeautifierError,
  OptionsError,
  Sending,
  Beautified
}
