import "./App.css";
import React, { Component } from 'react';

import Navigation from "./Navigation.js";
import UploadButton from "./UploadButton.js";
import Footer from "./Footer.js";
import Overview from "./Overview.js";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Alert from "react-bootstrap/Alert";

class App extends Component {
  render() {
  return (
    <>
      <Navigation />
      <br />
      <br />
      <Container>
        <Row>
          <Overview />
          <UploadButton />
        </Row>
      </Container>
      <Footer />
    </>
  );
  }
}

export default App;
