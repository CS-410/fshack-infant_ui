import { useEffect } from "react";
import { initialState, State, useSharedState } from "../shared/state";
import { LinkContainer } from "react-router-bootstrap";
import { Container, Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import LoginModal from "./LoginModal";
import chrisLogo from "../assets/chrisLogo.png";
import "../css/Navigation.css";

export default function Navigation(): JSX.Element {
	const [state, setState] = useSharedState();

	useEffect(() => {
		setUsername(setState);
	}, [state.username]);

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
							<LinkContainer to="/about">
								<Nav.Link>About</Nav.Link>
							</LinkContainer>
							<LinkContainer to="/results">
								<Nav.Link disabled={!state.username}>
									Results
								</Nav.Link>
							</LinkContainer>
						</Nav>
						{renderLoginStatus(setState, state.username)}
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<LoginModal
				show={state.showLogin}
				onHide={() => toggleLoginModal(setState, false)}
			/>
		</>
	);
}

function renderLoginStatus(
	stateSetter: React.Dispatch<React.SetStateAction<State>>,
	username: string
): JSX.Element {
	if (username) {
		return (
			<Nav id="logoutButton">
				<NavDropdown title={<b>{username}</b>} id="">
					<NavDropdown.Item
						onSelect={() => handleLogout(stateSetter)}
					>
						Logout
					</NavDropdown.Item>
				</NavDropdown>
			</Nav>
		);
	} else {
		return (
			<Nav>
				<Nav.Link onClick={() => toggleLoginModal(stateSetter, true)}>
					<b>Login</b>
				</Nav.Link>
			</Nav>
		);
	}
}

function handleLogout(
	stateSetter: React.Dispatch<React.SetStateAction<State>>
): void {
	stateSetter((prev: State) => {
		return {
			...prev,
			username: initialState.username,
		};
	});
	window.localStorage.clear();
}

function toggleLoginModal(
	stateSetter: React.Dispatch<React.SetStateAction<State>>,
	boolean: boolean
): void {
	stateSetter((prev: State) => {
		return {
			...prev,
			showLogin: boolean,
		};
	});
}

function setUsername(
	stateSetter: React.Dispatch<React.SetStateAction<State>>
): void {
	stateSetter((prev: State) => {
		return {
			...prev,
			username: window.localStorage.getItem("username"),
		};
	});
}
