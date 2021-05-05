import './App.css';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import Results from './Results';
import Home from './Home';

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
