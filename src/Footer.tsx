import BgImage from "./bg.png";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";

function Footer(): JSX.Element {
  return (
    <div className="fixed-bottom">
      <Navbar bg="light" expand="sm">
        <Container>
          <Navbar.Collapse className="justify-content-end">
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
      </div>
    </div>
  );
}

export default Footer;
