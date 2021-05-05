import React, { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';

import Client from '@fnndsc/chrisapi';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import chrisLogo from '../assets/chrisLogo.png';
import '../css/Navigation.css';

interface LoginProps {
	show: boolean;
	onHide: () => void;
	setUsername: React.Dispatch<React.SetStateAction<string>>;
}

function LoginModal(props: LoginProps): JSX.Element {
	const labelColSize = 3;
	const fieldColSize = 9;

	const { show, onHide, setUsername } = props;
	const [loginFailed, setLoginFailed] = useState(false);
	const usernameRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
	const passwordRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();

	async function onLogin(): Promise<void> {
		try {
			const authUrl = process.env.REACT_APP_API_URL + 'auth-token/';
			const username = usernameRef.current.value;
			const password = passwordRef.current.value;
			const authToken = await Client.getAuthToken(
				authUrl,
				username,
				password
			);
			window.sessionStorage.setItem('username', username);
			window.sessionStorage.setItem('authToken', authToken);
			setLoginFailed(false);
			setUsername(username);
			onHide();
		} catch (error) {
			setLoginFailed(true);
			console.log(error);
		}
	}

	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header>
				<Modal.Title>Log into ChRIS</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{loginFailed && (
					<Alert variant="danger">
						Invalid login credentials! Please try again.
					</Alert>
				)}
				<Form>
					<Form.Group as={Row}>
						<Form.Label column sm={labelColSize}>
							Username
						</Form.Label>
						<Col sm={fieldColSize}>
							<Form.Control
								ref={usernameRef}
								type="text"
								placeholder="chris"
							/>
						</Col>
					</Form.Group>
					<br />
					<Form.Group as={Row}>
						<Form.Label column sm={labelColSize}>
							Password
						</Form.Label>
						<Col sm={fieldColSize}>
							<Form.Control
								ref={passwordRef}
								type="password"
								placeholder="chris1234"
							/>
						</Col>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-danger" onClick={onHide}>
					Close
				</Button>
				<Button variant="success" onClick={onLogin}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

function Navigation(): JSX.Element {
	const [username, setUsername] = useState('');
	const [showLogin, setShowLogin] = useState(false);

	function loggedOut(): JSX.Element {
		return (
			<Nav>
				<Nav.Link onClick={() => setShowLogin(true)}>Login</Nav.Link>
			</Nav>
		);
	}

	function loggedIn() {
		return (
			<Nav id="logoutButton">
				<NavDropdown id="" title={username}>
					<NavDropdown.Item onSelect={() => setUsername('')}>
						Logout
					</NavDropdown.Item>
				</NavDropdown>
			</Nav>
		);
	}

	return (
		<>
			<Navbar bg="light" expand="md" className="py-3">
				<Container>
					<Navbar.Brand>
						<img
							src={chrisLogo}
							style={{ filter: 'brightness(1) invert(1)' }}
							height="50"
							className="d-inline-block"
						/>
						{` InfantFS UI`}
					</Navbar.Brand>
					<Navbar.Toggle />
					<Navbar.Collapse>
						<Nav className="navbar-nav me-auto">
							<LinkContainer to="/">
								<Nav.Link>Home</Nav.Link>
							</LinkContainer>
							<LinkContainer to="/results">
								<Nav.Link>Results</Nav.Link>
							</LinkContainer>
						</Nav>
						{username ? loggedIn() : loggedOut()}
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<LoginModal
				show={showLogin}
				onHide={() => setShowLogin(false)}
				setUsername={setUsername}
			/>
		</>
	);
}

export default Navigation;
