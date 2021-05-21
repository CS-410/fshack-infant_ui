import { useEffect } from "react";
import { initialState, State, useSharedState } from "../state";
import { LinkContainer } from "react-router-bootstrap";
import { Container, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import LoginModal from "./LoginModal";
import chrisLogo from "../assets/chrisLogo.png";
import "../css/Navigation.css";

export default function Navigation(): JSX.Element {
	const [state, setState] = useSharedState();

	useEffect(() => {
		setState((prev: State) => {
			return {
				...prev,
				username: window.localStorage.getItem("username"),
			};
		});
	}, [state.username]);

	function loginStatus(): JSX.Element {
		if (state.username) {
			return (
				<Nav id="logoutButton">
					<NavDropdown title={<b>{state.username}</b>} id="">
						<NavDropdown.Item onSelect={handleLogout}>
							Logout
						</NavDropdown.Item>
					</NavDropdown>
				</Nav>
			);
		} else {
			return (
				<Nav>
					<Nav.Link onClick={() => toggleLoginModal(true)}>
						<b>Login</b>
					</Nav.Link>
				</Nav>
			);
		}
	}

	function handleLogout(): void {
		setState((prev: State) => {
			return {
				...prev,
				username: initialState.username,
			};
		});
		window.localStorage.clear();
	}

	function toggleLoginModal(boolean: boolean): void {
		setState((prev: State) => {
			return {
				...prev,
				showLogin: boolean,
			};
		});
	}

	return (
		<>
			<Navbar className="py-3" bg="light" expand="md">
				<Container>
					<Navbar.Brand>
						<Image id="logo" src={chrisLogo} />
						{` InfantFS UI`}
					</Navbar.Brand>
					<Navbar.Toggle />
					<Navbar.Collapse>
						<Nav className="navbar-nav me-auto">
							<LinkContainer to="/">
								<Nav.Link>Home</Nav.Link>
							</LinkContainer>
							<LinkContainer to="/results">
								<Nav.Link disabled={!state.username}>
									Results
								</Nav.Link>
							</LinkContainer>
						</Nav>
						{loginStatus()}
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<LoginModal
				show={state.showLogin}
				onHide={() => toggleLoginModal(false)}
			/>
		</>
	);
}
