import "./App.css";

import UploadButton from "./UploadButton.js";
import Overview from "./Overview.js";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

function Home() {
  return (
    <Container>
      <Row>
        <Overview />
        <UploadButton />
      </Row>
    </Container>
  );
}

export default Home;
