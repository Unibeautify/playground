import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Container } from "./Container";
import { hot } from "react-hot-loader";
require("bootstrap/dist/css/bootstrap.min.css");
require("font-awesome/css/font-awesome.css");
require("./styles/main.css");

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Container} />
    </div>
  </Router>
);

export default hot(module)(App);
