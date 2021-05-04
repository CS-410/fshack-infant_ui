import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import BrainImage from "./brain.svg";
import FormLabel from "react-bootstrap/FormLabel";
import React, { Component } from "react";

class UploadButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
    };
  }

  onFileUpload = () => {
    /*let client = new Client(bruhUrl, { token: authToken });
      client.uploadFile({
        "upload_path": `cube/uploads/fsi/test.txt`
      }, {
        "fname": selectedFile
      })*/
  };

  onFileChange = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  render() {
    return (
      <Col>
        <Container>
          <Alert variant="primary" className="text-center">
            <br />
            {this.state.selectedFile && (
              <h5>
                <b>Selected file:</b> {this.state.selectedFile.name}
              </h5>
            )}
            <br />
            <img
              style={{ filter: "brightness(0) invert(1)" }}
              src={BrainImage}
              width="50%"
            />
            <br />
            <br />
            <br />
            <FormLabel className="btn btn-lg btn-primary">
              <input
                type="file"
                onChange={this.onFileChange}
                className="d-none"
              />
              Upload <b>.NII</b> or <b>.DCM</b> dataset
            </FormLabel>
            <br />
            <br />
            {this.state.selectedFile && (
              <>
                <hr />
                <div className="d-flex justify-content-center">
                  <Button
                    variant="success"
                    onClick={this.onFileUpload}
                    style={{ width: "100%" }}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}
          </Alert>
        </Container>
      </Col>
    );
  }
}
export default UploadButton;
