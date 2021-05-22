import React, { useState } from "react";
import { State, useSharedState } from "../shared/state";
import { ModalProps } from "../shared/interfaces";
import Client from "@fnndsc/chrisapi";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import "../css/Navigation.css";

export default function LoginModal(props: ModalProps): JSX.Element {
	const [state, setState] = useSharedState();
	const [invalidLogin, setInvalidLogin] = useState(false);

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
			setState((prev: State) => {
				return {
					...prev,
					username: username,
				};
			});
			setInvalidLogin(false);
			props.onHide();
		} catch (error) {
			setInvalidLogin(true);
			console.log(error);
		}
	}

	const labelColSize = 3;
	const fieldColSize = 9;
	const usernameRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
	const passwordRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();

	return (
		<Modal show={props.show} onHide={props.onHide} centered>
			<Modal.Header>
				<Modal.Title>Log into ChRIS</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{invalidLogin && (
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
				<Button variant="outline-danger" onClick={props.onHide}>
					Close
				</Button>
				<Button variant="success" onClick={onLogin}>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
