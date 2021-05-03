import "./App.css";
import logo from "./chris-logo2.png";
import React, { useState } from "react";
import BgImage from "./bg.png";
import BrainImage from "./brain.svg";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Log into ChRIS
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row} controlId="formHorizontalEmail">
            <Form.Label column sm={3}>
              Username
            </Form.Label>
            <Col sm={9}>
              <Form.Control type="text" placeholder="chris" />
            </Col>
          </Form.Group>
          <br />
          <Form.Group as={Row} controlId="formHorizontalPassword">
            <Form.Label column sm={3}>
              Password
            </Form.Label>
            <Col sm={9}>
              <Form.Control type="password" placeholder="chris1234" />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={props.onHide}>
          Close
        </Button>
        <Button variant="success" onClick={props.onHide}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function App() {
  const [modalShow, setModalShow] = React.useState(false);

  return (
    <>
      <Navbar bg="light" expand="lg" className="py-3">
        <Container>
          <Navbar.Brand>
            <img
              alt=""
              src={logo}
              style={{ filter: "brightness(1) invert(1)" }}
              height="50"
              className="d-inline-block"
            />{" "}
            InfantFS UI
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="navbar-nav me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#results">Results</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="#login" onClick={() => setModalShow(true)}>
                Login
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      <br />
      <br />
      <Container
        className="my-auto d-flex align-middle align-content-middle justify-content-center align-content-center"
        style={{ display: "flex" }}
      >
        <Row>
          <Col xs={7}>
            <h2>Background</h2>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
            <br />
            <br />
            <h2>Usage</h2>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Col>
          <Col>
            <Container>
              <Alert variant="primary" className="text-center">
                <br />
                <h5>
                  <b>Current file:</b> None
                </h5>
                <br />
                <img
                  style={{ filter: "brightness(0) invert(1)" }}
                  src={BrainImage}
                  width="50%"
                />
                <br />
                <br />
                <br />
                <Button variant="primary" size="lg" block>
                  Upload a <b>.NII</b> or <b>.DCM</b> dataset
                </Button>
                <br />
                <br />
                <hr />
                <div className="d-flex justify-content-center">
                  <Button variant="success" style={{ width: "100%" }} block>
                    Continue
                  </Button>
                </div>
              </Alert>
            </Container>
          </Col>
        </Row>
      </Container>
      <div className="fixed-bottom">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Collapse
              id="basic-navbar-nav"
              className="justify-content-end"
            >
              <Nav>
                <Nav.Link href="https://github.com/CS-410/pl-fshack-infant/">
                  GitHub
                </Nav.Link>
                <Nav.Link href="https://chrisproject.org/">
                  ChRIS Project
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <div
          style={{
            background: `url(${BgImage}) no-repeat`,
            backgroundSize: "cover",
          }}
        >
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      </div>
    </>
  );
}

export default App;
