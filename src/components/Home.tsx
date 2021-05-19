import { Container, Row } from "react-bootstrap";
import Upload from "./Upload";
import Intro from "./Intro";

function Home(): JSX.Element {
	return (
		<Container className="py-5">
			<Row>
				<Intro />
				<Upload />
			</Row>
		</Container>
	);
}

export default Home;
