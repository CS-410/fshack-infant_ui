import "./App.css";

import UploadButton from "./UploadButton";
import Overview from "./Overview";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

function Home(): JSX.Element {
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
