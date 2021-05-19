import React from "react";
import { SharedStateProvider } from "./State";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import FeedPage from "./components/FeedPage";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Results from "./components/Results";

class App extends React.Component {
	render(): JSX.Element {
		return (
			<SharedStateProvider>
				<Router>
					<Navigation />
					<Switch>
						<Route path="/results" component={Results} />
						<Route path="/" component={Home} />
						<Route path="/feeds/:id" component={FeedPage} />
					</Switch>
					{this.props.children}
					<Footer />
				</Router>
			</SharedStateProvider>
		);
	}
}

export default App;
