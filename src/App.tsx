import { SharedStateProvider } from "./shared/State";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import FeedPage from "./components/FeedPage";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Results from "./components/Results";
import About from "./components/About";

function App(): JSX.Element {
	return (
		<SharedStateProvider>
			<Router>
				<Navigation />
				<Switch>
					<Route path="/about" component={About} />
					<Route path="/results/:id" component={FeedPage} />
					<Route path="/results" component={Results} />
					<Route path="/" component={Home} />
				</Switch>
				<Footer />
			</Router>
		</SharedStateProvider>
	);
}

export default App;
