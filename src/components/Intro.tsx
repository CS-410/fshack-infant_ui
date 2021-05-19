import { Col, Button, Nav } from "react-bootstrap";

function Intro(): JSX.Element {
	return (
		<Col md={7}>
			<h4 className="mt-2">
				<u>THE CHRIS PROJECT</u>
			</h4>
			<h1 className="display-3">pl-fshack-infant</h1>
			<p>
				An Infant FreeSurfer module implemented into the ChRIS Project
			</p>
			<Nav>
				<Nav.Link href="https://chrisproject.org/">
					<Button variant="primary">
						Learn more about the ChRIS Project
					</Button>
				</Nav.Link>
			</Nav>
		</Col>
	);
}

export default Intro;
