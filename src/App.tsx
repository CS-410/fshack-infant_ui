import React from "react";
import { SharedStateProvider } from "./state";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import FeedView from "./components/FeedView";
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
						<Route path="/results/:id" component={FeedView} />
						<Route path="/results" component={Results} />
						<Route path="/" component={Home} />
					</Switch>
					{this.props.children}
					<Footer />
				</Router>
			</SharedStateProvider>
		);
	}
}

export default App;
