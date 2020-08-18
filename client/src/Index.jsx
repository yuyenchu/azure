import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import webSocket from 'socket.io-client'
import './App.css';
import './page.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header.jsx';
import ControlPanel from './ControlPanel.jsx';
import ConnBadge from './ConnBadge.jsx';
import TwinBlock from './TwinBlock.jsx';
import InvokeAll from './InvokeAll.jsx';
import {displayTPEVer, displayName} from './Helper.jsx';

function Index() {
    const [name, setName] = useState('');
    const [twins, setTwins] = useState({});
    const [devices, setDevices] = useState({});
    const [ws,setWs] = useState(webSocket('http://localhost:3000'));
    
    const updateAll = () => {
        axios.get("http://localhost:3000/initialize")
        .then(function(response) {
            // console.log(typeof(response.data.twins));
            // console.log(JSON.stringify(response.data.twins));
            setName(response.data.user);
            setDevices(response.data.devices);
            setTwins(response.data.twins);
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    useEffect(() => { 
        if (Object.keys(devices).length === 0) {
            updateAll();
            // ws.on(name, message => {
            //     console.log(message)
            // })
        }
    });

    return (
    <>
      <Header userName={name}/>
      <div className="container-fluid content mb-3">
        <h3 style={{"text-align":"center"}}>
            <b>Registered Devices</b>
        </h3>
        
        <br/>
        <hr/>
        <div id="devices">
            {
                Object.keys(devices).map(key => {
                    return (<div className="p-3 mb-2 bg-light">
                                <p className="mt-3 d-inline-block">{displayName(twins[key],key)}</p>
                                <ConnBadge data={devices[key]["state"]}/>
                            </div>);
                })
            }
        </div>

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
        <div id="modalHolder">
            <ControlPanel displayName="app"/>
        </div>
    </div>
     
    <p>
        {JSON.stringify(twins)}
    </p>
    <TwinBlock data={twins}/>
    <button type='button' className='btn btn-outline-secondary m-2' onClick={() => setTwins({...twins, "B":{3:4}})}> Add b </button>
    </>
  );
}

export default Index;
