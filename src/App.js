import "./App.css";
import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Navigation from "./Navigation.js";
import Footer from "./Footer.js";
import Results from "./Results";
import Home from "./Home";

class App extends React.Component {
  render() {
    return (
      <Router>
        <Navigation />
        <br />
        <br />
        {this.props.children}
        <Footer />
        <Switch>
          <Route path="/results">
            <Results />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
