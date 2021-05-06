import { MouseEventHandler, useEffect } from "react";
import { initialState, State, useSharedState } from "../State";
import { SelectCallback } from "react-bootstrap/esm/helpers";

import { LinkContainer } from "react-router-bootstrap";
import { Container, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import LoginModal from "./LoginModal";

import chrisLogo from "../assets/chrisLogo.png";
import "../css/Navigation.css";

function Navigation(): JSX.Element {
	const [state, setState] = useSharedState();

	useEffect(() => {
		setState((previous: State) => {
			const username = window.localStorage.getItem("username");
			return {
				...previous,
				username,
			};
		});
	}, [state.username, setState]);

	const handleLogout: SelectCallback = () => {
		setState((previous: State) => {
			return {
				...previous,
				username: initialState.username,
			};
		});
		window.localStorage.clear();
	};

	const handleLogin: MouseEventHandler<HTMLAnchorElement> = () => {
		setState((previous: State) => {
			return {
				...previous,
				showLogin: true,
			};
		});
	};

	function loginStatus(): JSX.Element {
		if (state.username) {
			return (
				<Nav id="logoutButton">
					<NavDropdown id="" title={state.username}>
						<NavDropdown.Item onSelect={handleLogout}>
							Logout
						</NavDropdown.Item>
					</NavDropdown>
				</Nav>
			);
		} else {
			return (
				<Nav>
					<Nav.Link onClick={handleLogin}>Login</Nav.Link>
				</Nav>
			);
		}
	}

	function handleLoginModal(): void {
		setState((previous: State) => {
			return {
				...previous,
				showLogin: false,
			};
		});
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
			<LoginModal show={state.showLogin} onHide={handleLoginModal} />
		</>
	);
}

export default Navigation;
