import { useState } from "react";
import { LinkContainer } from "react-router-bootstrap";

import { Container, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";

import chrisLogo from "../assets/chrisLogo.png";
import "../css/Navigation.css";
import LoginModal from "./LoginModal";

function Navigation(): JSX.Element {
	const [localUsername, setLocalUsername] = useState("");
	const [showLogin, setShowLogin] = useState(false);

	function loginStatus(): JSX.Element {
		const storedUsername = window.localStorage.getItem("username");
		if (localUsername === "" && storedUsername) {
			setLocalUsername(storedUsername);
		}
		if (localUsername) {
			return (
				<Nav id="logoutButton">
					<NavDropdown id="" title={localUsername}>
						<NavDropdown.Item
							onSelect={() => {
								setLocalUsername("");
								window.localStorage.clear();
							}}
						>
							Logout
						</NavDropdown.Item>
					</NavDropdown>
				</Nav>
			);
		} else {
			return (
				<Nav>
					<Nav.Link onClick={() => setShowLogin(true)}>
						Login
					</Nav.Link>
				</Nav>
			);
		}
	}

	const navbarBrand = (
		<Navbar.Brand>
			<Image
				src={chrisLogo}
				style={{
					filter: "brightness(1) invert(1)",
				}}
				className="d-inline-block"
				height="50"
			/>
			{` InfantFS UI`}
		</Navbar.Brand>
	);

	const navbarCollapse = (
		<Navbar.Collapse>
			<Nav className="navbar-nav me-auto">
				<LinkContainer to="/">
					<Nav.Link>Home</Nav.Link>
				</LinkContainer>
				<LinkContainer to="/results">
					<Nav.Link>Results</Nav.Link>
				</LinkContainer>
			</Nav>
			{loginStatus()}
		</Navbar.Collapse>
	);

	return (
		<>
			<Navbar bg="light" expand="md" className="py-3">
				<Container>
					{navbarBrand}
					<Navbar.Toggle />
					{navbarCollapse}
				</Container>
			</Navbar>
			<LoginModal
				show={showLogin}
				onHide={() => setShowLogin(false)}
				setLocalUsername={setLocalUsername}
			/>
		</>
	);
}

export default Navigation;
