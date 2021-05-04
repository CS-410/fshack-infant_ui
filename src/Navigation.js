import logo from "./chris-logo2.png";
import React, { Component } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Client from "@fnndsc/chrisapi";
import { render } from "@testing-library/react";

const labelColSize = 3;
const fieldColSize = 9;

class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameRef: React.createRef(),
      passwordRef: React.createRef(),
      failedLogin: false,
    };
  }

  handleLogin = async () => {
    try {
      const authUrl = process.env.REACT_APP_API_URL + "auth-token/";
      const username = this.state.usernameRef.current.value;
      const password = this.state.passwordRef.current.value;
      const authToken = await Client.getAuthToken(authUrl, username, password);
      window.sessionStorage.setItem("username", username);
      window.sessionStorage.setItem("authToken", authToken);
      this.setState({ failedLogin: false });
      this.props.onHide();
    } catch (error) {
      this.setState({ failedLogin: true });
      console.log(error);
    }
  };

  render() {
    return (
      <Modal {...this.props} size="md" centered>
        <Modal.Header>
          <Modal.Title>Log into ChRIS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.failedLogin && (
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
                <Form.Control
                  ref={this.state.usernameRef}
                  type="text"
                  placeholder="chris"
                />
              </Col>
            </Form.Group>
            <br />
            <Form.Group as={Row} controlId="password">
              <Form.Label column sm={labelColSize}>
                Password
              </Form.Label>
              <Col sm={fieldColSize}>
                <Form.Control
                  ref={this.state.passwordRef}
                  type="password"
                  placeholder="chris1234"
                />
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.props.onHide}>
            Close
          </Button>
          <Button variant="success" onClick={this.handleLogin}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  Login() {
    return (
      <Nav>
        <Nav.Link href="#login" onClick={() => this.setState({ show: true })}>
          Login
        </Nav.Link>
      </Nav>
    );
  };

  render() {
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
              />{" "}
              InfantFS UI
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse>
              <Nav className="navbar-nav me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#results">Results</Nav.Link>
              </Nav>
              {this.Login()}
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <LoginModal
          show={this.state.show}
          onHide={() => this.setState({ show: false })}
        />
      </>
    );
  }
}

export default Navigation;
