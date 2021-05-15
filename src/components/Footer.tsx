import { Container, Nav, Navbar } from "react-bootstrap";
import footerImage from "../assets/nodes.svg";
import "../css/Footer.css";

function Footer(): JSX.Element {
	return (
		<footer
			className="pb-5"
			style={{
				background: `url(${footerImage}) no-repeat`,
				backgroundSize: "cover",
			}}
		>
			<Navbar bg="light">
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
			<br />
			<br />
		</footer>
	);
}

export default Footer;
