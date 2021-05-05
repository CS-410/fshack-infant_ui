import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Results from "./components/Results";

class App extends React.Component {
	render(): JSX.Element {
		return (
			<Router>
				<Navigation />
				<Switch>
					<Route path="/results">
						<Results />
					</Route>
					<Route path="/">
						<Home />
					</Route>
				</Switch>
				{this.props.children}
				<Footer />
			</Router>
		);
	}
}

export default App;
