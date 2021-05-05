import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import BrainImage from "./brain.svg";
import FormLabel from "react-bootstrap/FormLabel";
import React, { Component, useState } from "react";

function UploadButton(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function onFileUpload(): void {
    /*let client = new Client(bruhUrl, { token: authToken });
      client.uploadFile({
        "upload_path": `cube/uploads/fsi/test.txt`
      }, {
        "fname": selectedFile
      })*/
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (event.target && event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
    }
  }

  return (
    <Col>
      <Container>
        <Alert variant="primary" className="text-center">
          <br />
          {selectedFile && (
            <h5>
              <b>Selected file:</b> {selectedFile.name}
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
            <input type="file" onChange={onFileChange} className="d-none" />
            Upload <b>.NII</b> or <b>.DCM</b> dataset
          </FormLabel>
          <br />
          <br />
          {selectedFile && (
            <>
              <hr />
              <div className="d-flex justify-content-center">
                <Button
                  variant="success"
                  onClick={onFileUpload}
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

export default UploadButton;
