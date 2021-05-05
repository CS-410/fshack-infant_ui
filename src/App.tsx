import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './components/Home';
import Results from './components/Results';

class App extends React.Component {
	render(): JSX.Element {
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
