import * as React from "react";
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import { Playground } from "./Playground";
require('./styles/lux.css');
require('./styles/main.css');

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