import { useSharedState } from "../State";

import { LinkContainer } from "react-router-bootstrap";
import { Container, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import LoginModal from "./LoginModal";

import chrisLogo from "../assets/chrisLogo.png";
import "../css/Navigation.css";

function Navigation(): JSX.Element {
	const [state, setState] = useSharedState();

	function loginStatus(): JSX.Element {
		/*const username = window.localStorage.getItem("username");
		if (!state.username && username) {
			setState((prev: any) => ({ ...prev, username: username }));
		}*/

		if (state.username) {
			return (
				<Nav id="logoutButton">
					<NavDropdown id="" title={state.username}>
						<NavDropdown.Item
							onSelect={() => {
								setState((prev: any) => ({ ...prev, username: "" }));
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
					<Nav.Link onClick={() => setState((prev: any) => ({ ...prev, showLogin: true }))}>
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
				show={state.showLogin}
				onHide={() => setState((prev: any) => ({ ...prev, showLogin: false }))}
			/>
		</>
	);
}

export default Navigation;
