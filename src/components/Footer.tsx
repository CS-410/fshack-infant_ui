import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import footerImage from "../assets/nodes.svg";

function Footer(): JSX.Element {
	return (
		<div className="fixed-bottom">
			<Navbar bg="light" expand="sm">
				<Container>
					<Navbar.Collapse className="justify-content-end">
						<Nav>
							<Nav.Link href="https://github.com/CS-410/pl-fshack-infant/">
								GitHub
							</Nav.Link>
							<Nav.Link href="https://chrisproject.org/">
								ChRIS Project
							</Nav.Link>
						</Nav>
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<div
				style={{
					background: `url(${footerImage}) no-repeat`,
					backgroundSize: "cover",
				}}
			>
				<br />
				<br />
				<br />
				<br />
			</div>
		</div>
	);
}

export default Footer;
