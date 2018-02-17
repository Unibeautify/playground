import * as React from "react";
import {
  HashRouter as Router,
  Route,
} from 'react-router-dom';
import { Playground } from "./Playground";
require('./styles/lux.css');

export default class App extends React.Component<any, any> {
    render() {
        return (
            <Router>
                <div>
                    <Route exact path="/" component={Playground} />
                </div>
            </Router>
        );
    }
}