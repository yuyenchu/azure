import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalTitle from 'react-bootstrap/ModalTitle'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

function ControlPanel(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);  

    return (
        <>
        <Button onClick={handleShow}>
            Launch demo modal
        </Button>

        {/* <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal> */}

        <Modal show={show} onHide={handleClose} size="lg" dialogClassName="modal-xl modal-dialog-centered"
        id="modal+element+" className="bd-example-modal-lg" tabindex="-1" role="dialog" aria-modal="true">
        <ModalHeader>
            <ModalTitle className="modal-title" id="mT+element+">Device Name: {props.displayName}</ModalTitle>
            <label className="d-inline ml-4" id="tr+element+" style={{"font-size": "6px"}}></label>
            <Button variant="white"  onClick={handleClose}>
                <span aria-hidden="true">×</span>
            </Button>
        </ModalHeader>
        <ModalBody>
            <Container fluid>
                <Row>
                    <Col>
                        <Row className="chart-container">
                            Monitor
                            <canvas id="smchart+element+" className="m-1" style={{"max-height": "300px"}}></canvas>     
                        </Row>
                        <Row>Telemetry
                            <textarea readonly="" className="form-control" id="tele+element+" rows="5" style={{"margin-top": "0px", "margin-bottom": "0px", "max-height": "250px", "min-height": "40px"}} placeholder="result: {}"></textarea>
                        </Row>
                    </Col>
                    <Col xs={8}>
                        <Row className="overflow-auto" style={{"height": "300px"}}>
                            <div id="t+element+" className="mt-3 ml-3"></div>
                        </Row>
                        <hr/>
                        <Row className="mb-2">
                            <div className="col form-check form-check-inline justify-content-end">
                                <input type="checkbox" data-toggle="toggle" id="check+element+" data-size="xs"/>
                                <label className="ml-2 form-check-label">Text Mode</label>
                            </div>
                        </Row>
                        <div className="row overflow-auto" style={{"min-height": "250px", "display": "none"}} id="gctl+element+">
                            <div className="col">
                                <div className="row mb-2 container-fluid">
                                    <div className="col m-1">
                                        <input type="checkbox" checked data-toggle="toggle" id="check1+element+" data-style="ios"/>
                                        <label className="ml-1 form-check-label">sth1</label>
                                    </div>
                                    <div className="col m-1">
                                        <input type="checkbox" checked data-toggle="toggle" id="check2+element+" data-style="ios"/>
                                        <label className="ml-1 form-check-label">sth2</label>
                                    </div>
                                    <div className="col m-1">
                                        <input type="checkbox" checked data-toggle="toggle" id="check3+element+" data-style="ios"/>
                                        <label className="ml-1 form-check-label">sth3</label>
                                    </div>
                                </div>
                                <div className="row mb-2 container-fluid">
                                    <div className="col m-1">
                                        <button type="button" className="btn btn-primary" id="check4+element+">sth4</button>
                                    </div>
                                    <div className="col m-1">
                                        <button type="button" className="btn btn-primary" id="check5+element+">sth5</button>
                                    </div>
                                    <div className="col m-1">
                                        <button type="button" className="btn btn-primary" id="check6+element+">sth6</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row overflow-auto" style={{"height": "250px"}} id="tctl+element+">
                            <div className="form-group col">
                                <label for="input">Method Name</label>
                                <input className="form-control" id="m+element+" placeholder="Reboot"/>
                                <label for="textarea">Payload</label>
                                <textarea readonly className="form-control readonly" id="p+element+" placeholder="Payload" rows="5" style={{"max-height": "200px", "min-height": "40px"}}></textarea>
                                <button type="button" id="dmb+element+" className="btn btn-primary mt-3" onclick="invoke('+element+')">submit</button>
                                <button type="button" id="clr+element+" className="btn btn-primary mt-3 ml-3">clear</button>
                            </div>
                            <textarea readonly="" className="form-control mr-2 ml-2" id="r+element+" rows="2" style={{"margin-top": "0px", "margin-bottom": "0px", "max-height": "150px", "min-height": "40px;"}} placeholder="result: {}"></textarea>
                        </div>
                    </Col>
                </Row>
            </Container>
        </ModalBody>
        <ModalFooter>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
        </ModalFooter>
    </Modal>
    </>
    );
};
export default ControlPanel;