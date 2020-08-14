import React, { useState }  from 'react';
import './App.css';
import './page.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import TestComponent from './test_component.jsx';
import Header from './Header.jsx';
import ControlPanel from './ControlPanel.jsx';

function Index() {
    const [name, setName] = useState('App');
    const [twins, setTwins] = useState({"A":{1:2}});
    const [devices, setDevices] = useState({"simulate2":{"state":"Disconnected"}});


  return (
    <>
      <Header userName="root"/>
      <div className="container-fluid content mb-3">
        <h3 style={{"text-align":"center"}}>
          <a data-toggle="collapse" href="#controlall" className="text-dark nav-link">
            <b>Registered Devices</b>
          </a>
        </h3>
        <div id="controlall" className="collapse">
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
        </div>
        <br/>
        <hr/>
        <div id="messages"></div>
        <div id="devices"></div>

        <div id="carousel" className="carousel slide p-5 border" data-interval="false">
          <ol id="indicator" className="carousel-indicators bg-dark">
          </ol>
          <div id="inner" className="carousel-inner">
          </div>
          <a className="carousel-control-prev mr-5" href="#carousel" role="button" data-slide="prev">
            <span className="carousel-control-prev-icon mr-5 bg-dark rounded" aria-hidden="true"></span>
            <span className="sr-only mr-5">Previous</span>
          </a>
          <a className="carousel-control-next ml-5" href="#carousel" role="button" data-slide="next">
            <span className="carousel-control-next-icon ml-5 bg-dark rounded" aria-hidden="true"></span>
            <span className="sr-only ml-5">Next</span>
          </a>
        </div>
        <div id="modalHolder"></div>
      </div>
      <ControlPanel displayName="app"/>
      <p>
          {JSON.stringify(twins)}
        </p>
      <button onClick={() => setTwins(twins.map((key,result)=>key))}> Add b </button>
    <script src="https://unpkg.com/react/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-bootstrap@next/dist/react-bootstrap.min.js" crossorigin></script>


    
    {/* <div className="App body">
      <header className="App-header">
        
        <img src={logo} alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <TestComponent name={name}/>
        <Button onClick={() => setName(name+"p")}> Add p </Button>
      </header>
    </div> */}
    </>
  );
}

export default Index;
