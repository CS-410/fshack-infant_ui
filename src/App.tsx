import React from "react";
import { SharedStateProvider } from "./State";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Footer from "./components/Footer";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Results from "./components/Results";
import About from "./components/About";

class App extends React.Component {
	render(): JSX.Element {
		return (
			<SharedStateProvider>
				<Router>
					<Navigation />
					<Switch>
						<Route path="/about">
							<About />
						</Route>
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
			</SharedStateProvider>
		);
	}
}

export default App;
