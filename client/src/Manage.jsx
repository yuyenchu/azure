import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import './page.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalTitle from 'react-bootstrap/ModalTitle'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import Header from './Header.jsx';
import {displayTPEVer, displayName} from './Helper.jsx';

function Manage() {
    const [name, setName] = useState('');
    const [devices, setDevices] = useState({});
    const [twins, setTwins] = useState({});

    // axios.get("http://andrew-vm.westus2.cloudapp.azure.com/initialize/user:3000")
    useEffect(() => { 
        if (Object.keys(devices).length === 0) {
            updateAll();
        }
    });

    function updateAll() {
        fetch("/initialize")
        .then(function(response) {
            // console.log(JSON.stringify(response.data));
            // console.log(JSON.stringify(response.data.twins));
            setName(response.data.user);
            setDevices(response.data.devices);
            setTwins(response.data.twins);
            setCheckedList(Object.keys(response.data.devices).map(ele => {return{"id": "item"+ele, "isChecked": false}}));
            setCheckAll(false);
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    const [checkAll, setCheckAll] = useState(false); 
    const [checkedList, setCheckedList] = useState(Object.keys(devices).map(ele => {return{"id": "item"+ele, "isChecked": false}})); 
    const [showView, setShowView] = useState(false);
    const [showDevice, setShowDevice] = useState(false);
    const [inputView, setInputView] = useState('');
    const [inputDevice, setInputDevice] = useState('');
    const [resultView, setResultView] = useState('');
    const [resultDevice, setResultDevice] = useState('');
    const [resultDelete, setResultDelete] = useState('');
    const [isEdge, setIsEdge] = useState(false);

    const handleInputView = (e) => setInputView(e.target.value);
    const handleInputDevice = (e) => setInputDevice(e.target.value);

    const addView = () => {
        // console.log(inputView);
        // axios.post("http://localhost:3000/view/"+inputView.trim())
        axios.post("/view/"+inputView.trim())
        .then(function(response) {
            // console.log(response.data);
            setResultView(response.data);
            updateAll();
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    const deleView = () => {
        Object.entries(checkedList).forEach(([key, value]) => {
            if (value.isChecked) {
                console.log(key+" "+value.id.substring(4));
                // axios.delete("http://localhost:3000/view/"+value.id.substring(4))
                axios.delete("/view/"+value.id.substring(4))
                .then(function(response) {
                    // console.log(response.data);
                    setResultDelete(response.data);
                    updateAll();
                })
                .catch(function(error) {
                    console.log(error);
                });
            }
        });
        
    }

    const addDevice = () => {
        console.log(inputDevice.trim()+"/"+isEdge)
        // axios.post("http://localhost:3000/device/"+inputDevice.trim()+"/"+isEdge)
        axios.post("/device/"+inputDevice.trim()+"/"+isEdge)
        .then(function(response) {
            // console.log(response.data);
            setResultDevice(response.data);
            if (response.data["connectionString"]) {
                updateAll();
            }
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    const handleChange = (e) => {
        let itemID = e.target.id;
        let checked = e.target.checked;
        if (itemID === "select-all") {
            setCheckAll(checked);
            setCheckedList(checkedList.map(item => ({ ...item, isChecked: checked })));
        } else {
            setCheckedList(checkedList.map(item =>
                item.id === itemID ? { ...item, isChecked: checked } : item
            ));
            setCheckAll(checkedList.every(item => {
                if(item.id === itemID){
                    return checked;
                } else {
                    return item.isChecked;
                }
            }));
        }
    };

    const handleViewClose = () => setShowView(false);
    const handleViewShow = () => setShowView(true);  

    const handleDeviceClose = () => setShowDevice(false);
    const handleDeviceShow = () => setShowDevice(true);  
    const handleEdgeChange = (e) => setIsEdge(e.target.checked);

    return (
    <>
      <Header userName={name}/>
      <div className="container-fluid content mb-3">
        <h3 style={{"textAlign": "center"}}>
            <b>Device List</b>
        </h3>
        <button type="button" className="btn btn-outline-primary m-2" onClick={handleDeviceShow}>add Device</button>
        <button type="button" className="btn btn-outline-primary m-2" onClick={handleViewShow}>add view</button>
        <button type="button" className="btn btn-outline-primary m-2" onClick={deleView}>delete view</button>
        <div className="d-flex justify-content-center">
            <label>{resultDelete}</label>
        </div>
        <div className="container">
            <div className="row">
              <div className="col-12">
                <table className="table table-striped ">
                    <thead>
                        <tr>
                            <th scope="col">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" id="select-all" className="form-check-input" checked={checkAll} onChange={handleChange}/>
                                </div>
                            </th>
                            <th scope="col">Name</th>
                            <th scope="col">Device Id</th>
                            <th scope="col">Status</th>
                            <th scope="col">ThingsPro ver.</th>
                        </tr>
                        {
                            checkedList.map(item => {
                                return (<tr key={item.id}>
                                            <td>
                                                <div className="custom-control custom-checkbox">
                                                    <input type="checkbox" id={item.id} className="select-item form-check-input" checked={item.isChecked} onChange={handleChange}/>
                                                </div>
                                            </td>
                                            <td>{displayName(twins[item.id.substring(4)], item.id.substring(4))}</td>
                                            <td>{item.id.substring(4)}</td>
                                            <td>{devices[item.id.substring(4)].state}</td>
                                            <td>{displayTPEVer(twins[item.id.substring(4)])}</td>
                                        </tr>);
                          })
                        }
                    </thead>
                    <tbody id="tbody">
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <Modal show={showView} onHide={handleViewClose} dialogClassName="modal-dialog-centered" aria-labelledby="addViewModalTitle">
        <ModalHeader>
            <ModalTitle id="addViewModalTitle">Add view</ModalTitle>
            <button type="button" className="btn" variant="white" onClick={handleViewClose}>
                <span aria-hidden="true">×</span>
            </button>
        </ModalHeader>
        <ModalBody>
            <div className="form-group">
                <label htmlFor="idInput">Device Id</label>
                <input type="deviceId" className="form-control" id="idInput" onChange={handleInputView}/>
            </div>
            <div className="d-flex justify-content-center">
                <label>{resultView}</label>
            </div>
        </ModalBody>
        <ModalFooter>
            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleInputView}>Close</button>
            <button type="button" className="btn btn-primary" onClick={addView}>Add</button>
        </ModalFooter>
    </Modal>
    <Modal show={showDevice} onHide={handleDeviceClose} dialogClassName="modal-dialog-centered" aria-labelledby="addDeviceModalTitle">
        <ModalHeader>
            <ModalTitle id="addDeviceModalTitle">Add Device</ModalTitle>
            <button type="button" className="btn" variant="white" onClick={handleDeviceClose}>
                <span aria-hidden="true">×</span>
            </button>
        </ModalHeader>
        <ModalBody>
            <div className="form-group">
                <label htmlFor="idInput2">Device Id</label>
                <input type="deviceId" className="form-control" id="idInput2" onChange={handleInputDevice}/>
                <div className="mt-1 custom-control custom-checkbox">
                    <input type="checkbox" className="select-all form-check-input" onChange={handleEdgeChange}/>
                    Activate IoT Edge
                </div>
            </div>
            <div className="d-flex justify-content-center">
                <textarea readOnly className="form-control mr-2 ml-2" id="addDeviceResult" rows="2" style={{"marginTop": "0px", "marginBottom": "0px", "maxHeight": "150px", "minHeight": "40px"}} placeholder="result:{}" value={resultDevice}></textarea>
            </div>
        </ModalBody>
        <ModalFooter>
            <button type="button" className="btn btn-secondary" onClick={handleDeviceClose}>Close</button>
            <button type="button" className="btn btn-primary" onClick={addDevice}>Add</button>
        </ModalFooter>
    </Modal>
    </>
  );
}

export default Manage;
