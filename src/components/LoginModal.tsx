import React, { useState } from "react";
import Client from "@fnndsc/chrisapi";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import "../css/Navigation.css";

interface LoginProps {
	show: boolean;
	onHide: () => void;
	setLocalUsername: React.Dispatch<React.SetStateAction<string>>;
}

function LoginModal(props: LoginProps): JSX.Element {
	const labelColSize = 3;
	const fieldColSize = 9;

	const { show, onHide, setLocalUsername } = props;
	const [loginFailed, setLoginFailed] = useState(false);
	const usernameRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
	const passwordRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();

	async function onLogin(): Promise<void> {
		try {
			const authUrl = process.env.REACT_APP_API_URL + "auth-token/";
			const username = usernameRef.current.value;
			const password = passwordRef.current.value;
			const authToken = await Client.getAuthToken(
				authUrl,
				username,
				password
			);
			window.localStorage.setItem("username", username);
			window.localStorage.setItem("authToken", authToken);
			setLocalUsername(username);
			setLoginFailed(false);
			onHide();
		} catch (error) {
			setLoginFailed(true);
			console.log(error);
		}
	}

	const usernameComponent = (
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
	);

	const passwordComponent = (
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
	);

	const modalHeader = (
		<Modal.Header>
			<Modal.Title>Log into ChRIS</Modal.Title>
		</Modal.Header>
	);

	const modalBody = (
		<Modal.Body>
			{loginFailed && (
				<Alert variant="danger">
					Invalid login credentials! Please try again.
				</Alert>
			)}
			<Form>
				{usernameComponent}
				{passwordComponent}
			</Form>
		</Modal.Body>
	);

	const modalFooter = (
		<Modal.Footer>
			<Button variant="outline-danger" onClick={onHide}>
				Close
			</Button>
			<Button variant="success" onClick={onLogin}>
				Continue
			</Button>
		</Modal.Footer>
	);

	return (
		<Modal show={show} onHide={onHide} centered>
			{modalHeader}
			{modalBody}
			{modalFooter}
		</Modal>
	);
}

export default LoginModal;
