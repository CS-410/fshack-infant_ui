import { Container, Row } from "react-bootstrap";
import Upload from "./Upload";
import Overview from "./Overview";

function Home(): JSX.Element {
	return (
		<Container className="py-5">
			<Row>
				<Overview />
				<Upload />
			</Row>
		</Container>
	);
}

export default Home;
