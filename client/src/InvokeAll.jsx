import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';

function InvokeAll(){
    const [open, setOpen] = useState(false);


    return (
        <>
        <h3 style={{"text-align":"center"}} onClick={() => setOpen(!open)}>
            <a  className="text-dark nav-link">
                <b>Registered Devices</b>
            </a>
        </h3>
        <Collapse in={open} className="collapse">
            <hr className="double-line"/>
            <p style={{"text-align":"center"}}>Direct Method to All Devices</p>
            <div className="mt-3 d-flex justify-content-center">
                <input type="text" className="form-control" placeholder="Method Name" id="methodall" style={{"maxWidth": "200px"}}/>
            </div>
            <div className="mt-3 d-flex justify-content-center">
                <textarea className="form-control" id="txtarea" rows="5" style={{"marginTop": "0px", "marginBottom": "0px"}} placeholder="Payload"></textarea>
            </div>
            <div className="mt-3 d-flex justify-content-center">
                <button type="button" id="dmbuttonall" className="btn btn-danger" onclick="invokeall()">submit</button>
            </div>
            <label id="resultall" className="mt-4 ml-3"></label>
            <hr className="double-line"/>
            <p style={{"text-align":"center"}}>Twin Patch to All Devices</p>
            <textarea className="form-control mb-3" id="txtarea" rows="5" style={{"margin-top": "0px", "margin-bottom": "0px"}} placeholder="desired: {}"></textarea>
            <div className="mb-3 d-flex justify-content-center">
                <button type="button" id="tpbuttonall" className="btn btn-danger" onclick="invokeall()">submit</button>
            </div>
        </Collapse>
        </>
    );
}

export default InvokeAll;