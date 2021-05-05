import logo from "./chris-logo2.png";
import React, { useState } from "react";
import { LinkContainer } from "react-router-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import NavDropdown from "react-bootstrap/NavDropdown";
import Client from "@fnndsc/chrisapi";
import "./Navigation.css";

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

function LoginModal(props: LoginModalProps): JSX.Element {
  const { show, onHide, setUsername } = props;
  const usernameRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
  const passwordRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
  const [loginFailed, setLoginFailed] = useState(false);

  const labelColSize = 3;
  const fieldColSize = 9;

  async function handleLogin(): Promise<void> {
    try {
      const authUrl = process.env.REACT_APP_API_URL + "auth-token/";
      var username = "";
      var password = "";
      if (usernameRef !== null && usernameRef.current) {
        username = usernameRef.current.value;
      }
      if (passwordRef !== null && passwordRef.current) {
        password = passwordRef.current.value;
      }

      debugger;
      const authToken = await Client.getAuthToken(authUrl, username, password);
      window.sessionStorage.setItem("username", username);
      window.sessionStorage.setItem("authToken", authToken);

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
          <Form.Group as={Row} controlId="username">
            <Form.Label column sm={labelColSize}>
              Username
            </Form.Label>
            <Col sm={fieldColSize}>
              <Form.Control ref={usernameRef} type="text" placeholder="chris" />
            </Col>
          </Form.Group>
          <br />
          <Form.Group as={Row} controlId="password">
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
        <Button variant="success" onClick={handleLogin}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Navigation(): JSX.Element {
  const [loginModalVisibility, setloginModalVisibility] = useState(false);
  const [username, setUsername] = useState("");

  function Login(): JSX.Element {
    return (
      <Nav>
        <Nav.Link onClick={() => setloginModalVisibility(true)}>Login</Nav.Link>
      </Nav>
    );
  }

  function Logout() {
    return (
      <Nav id="logoutButton">
        <NavDropdown id="logoutDropdown" title={username}>
          <NavDropdown.Item onSelect={() => setUsername("")}>
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
              src={logo}
              style={{ filter: "brightness(1) invert(1)" }}
              height="50"
              className="d-inline-block"
            />
            {` InfantFS UI`}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            <Nav className="navbar-nav me-auto">
              <LinkContainer to="/">
                <Nav.Link>Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/results">
                <Nav.Link>Results</Nav.Link>
              </LinkContainer>
            </Nav>
            {username ? Logout() : Login()}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <LoginModal
        show={loginModalVisibility}
        onHide={() => {
          setloginModalVisibility(false);
        }}
        setUsername={setUsername}
      />
    </>
  );
}

export default Navigation;
