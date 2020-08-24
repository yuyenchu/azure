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
import { Line } from 'react-chartjs-2';
import TextController from './TextController.jsx';
import GraphicController from './GraphicController.jsx';
import AntSwitch from './AntSwitch.jsx';
import TwinTab from './TwinTab.jsx';

function ControlPanel(props) {
    const [show, setShow] = useState(false);
    const [gui, setGui] = useState(true);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);  

    const displayTwin = () => {
        if (props.twin && props.twin["module"]){
            return props.twin["module"];
        } else {
            return props.twin;
        }
    }

    return (
        <>
        <Button className="ml-2 mb-2" onClick={handleShow}>
            Control Panel
        </Button>

        <Modal show={show}  onHide={handleClose} size="lg" dialogClassName="modal-xl modal-dialog-centered"
                            className="bd-example-modal-lg" tabindex="-1" role="dialog" aria-modal="true">
        <ModalHeader>
            <ModalTitle className="modal-title">Device Name: {props.displayName}</ModalTitle>
            <label className="d-inline ml-4" style={{"fontSize": "6px"}}></label>
            <Button variant="white"  onClick={handleClose}>
                <span aria-hidden="true">×</span>
            </Button>
        </ModalHeader>
        <ModalBody>
            <Container fluid>
                <Row>
                    <Col xs={4}>
                        <Row className="chart-container pb-4 pr-2" style={{"height": "300px"}}>
                            Monitor
                            <Line data={props.data} options={{
                                    maintainAspectRatio: false,
									scales: {
										yAxes : [{
											ticks : {
												max : 100,    
												min : 0,
											}
										}],
										xAxes : [{
                                            type: "time",
											time: {
												displayFormats: {
													millisecond: "h:mm:ss a",
													second: "h:mm:ss a"
												}
											},
											ticks : {
												callback: function(tick, index, array) {
														return (index % 3) ? "" : tick;
												}
											}
										}]
									}}}/>
                        </Row>
                        <Row>Telemetry
                            <textarea readOnly={true} className="form-control" rows="5" style={{"marginTop": "0px", "marginBottom": "0px", "maxHeight": "250px", "minHeight": "40px"}} placeholder="result: {}"></textarea>
                        </Row>
                    </Col>
                    <Col xs={8}>
                        <Row className="overflow-auto" style={{"height": "300px"}}>
                            <TwinTab data={displayTwin()}/>
                        </Row>
                        <hr/>
                        <Row className="mb-2">
                            <div className="col form-check form-check-inline justify-content-end">
                                <label className="mr-2 form-check-label">Text</label>
                                <AntSwitch checked={gui} onChange={(e)=>setGui(e.target.checked)}/>
                                <label className="ml-2 form-check-label">GUI</label>
                            </div>
                        </Row>
                        <div className="row overflow-auto" style={{"minHeight": "250px", "display": gui? 'block' : 'none'}}>
                            <GraphicController deviceId={props.deviceId}/>
                        </div>
                        <div className="row overflow-auto" style={{"height": "250px", "display": gui? 'none' : 'block'}}>
                            <TextController deviceId={props.deviceId}/>
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