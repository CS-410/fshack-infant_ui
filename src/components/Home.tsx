import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import Upload from "./Upload";
import Overview from "./Overview";

function Home(): JSX.Element {
	return (
		<Container>
			<Row>
				<Overview />
				<Upload />
			</Row>
		</Container>
	);
}

export default Home;
