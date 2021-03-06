import React, { useState, useEffect }  from 'react';
import axios from 'axios';
import moment from 'moment';
import webSocket from 'socket.io-client'
import './App.css';
import './page.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header.jsx';
import ControlPanel from './ControlPanel.jsx';
import ConnBadge from './ConnBadge.jsx';
import TwinBlock from './TwinBlock.jsx';
// import InvokeAll from './InvokeAll.jsx';
import {displayName, isDict} from './Helper.jsx';

function Index() {
    const [name, setName] = useState('');
    const [msgHolder, setMsgHolder] = useState({});
    const [teleHolder, setTeleHolder] = useState({});
    const [plotPt, setPlotPt] = useState({});
    const [twins, setTwins] = useState({});
    const [devices, setDevices] = useState({});
    // const [ws,setWs] = useState(webSocket('http://localhost:3000'));
    const [ws,setWs] = useState(webSocket('http://andrew-vm.westus2.cloudapp.azure.com:3000'));
    const [flag, setFlag] = useState(false);
    const MAX_PTS = 31;
    const COLORS = ["rgb(255, 159, 0)","rgb(0, 59, 174)","rgb(75, 192, 192)",
                    "rgb(254, 27, 28)","rgb(254, 255, 51)","rgb(178, 102, 255)",
                    "rgb(128, 255, 0)","rgb(102, 178, 255)","rgb(255, 102, 255)"]

    const updateAll = () => {
        // axios.get("http://localhost:3000/initialize")
        axios.get("/initialize")
        .then(function(response) {
            // console.log(typeof(response.data.twins));
            // console.log(JSON.stringify(response.data.twins));
            console.log("-----AJAX-----")
            setName(response.data.user);
            setDevices(response.data.devices);
            let dataHolder = {};
            Object.keys(response.data.devices).forEach((key)=>{
                dataHolder[key] = {"datasets":[]};
            });
            setPlotPt(dataHolder);
            setTwins(response.data.twins);
            setFlag(true);
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    useEffect(() => { 
        console.log(`USE EFFECT: key len=${Object.keys(devices).length} flag=${flag}`)
        if (Object.keys(devices).length === 0) {
            // console.log("Useeffect: "+Object.keys(devices).length)
            updateAll();
            // console.log("1 FLAG="+flag);
        } 
        if (flag){
            console.log("---socket on---")
            ws.on(name, msg => {
                setMsgHolder(msg);
                console.log("MSG \n"+JSON.stringify(msg));
            })
            // console.log("2 FLAG="+flag);
            setFlag(false);
        }
    },[flag]);

    useEffect(() => { 
        // console.log("twin \n"+JSON.stringify(twins));
        // console.log("devices \n"+JSON.stringify(devices));
        let type = Object.keys(msgHolder)[0];
        // if (msg[type].body)
        // var bodyKey = Object.keys(msg[type].body)[0];
        // console.log("data "+JSON.stringify(msg[type].body));
        switch (type) {
            case 'state':
                setDevices({...devices, ...msgHolder[type].body});
                console.log("receive device");
                break;
            case 'twin':
                setTwins({...twins, ...msgHolder[type].body});
                console.log("receive twin");
                break;
            case 'event':
                console.log("receive telemtry");
                // insertData(msgHolder[type].id,"label", msgHolder[type].body, new Date)
                drawChart(msgHolder[type].body.body, msgHolder[type].id, msgHolder[type].body.time);
                let temp = {};
                // var type = Object.keys(msgHolder)[0];
                temp[msgHolder[type].id] = msgHolder[type].body.body;
                setTeleHolder({...teleHolder, ...temp});
                console.log(`TEMP:\n${JSON.stringify(temp)}`)
                break;
            default:
                break;
        }
    },[msgHolder]);

    function insertData(id, lb, dat, time, chart) {
        var found = false;
        var holder = {};
        // console.log("A")
        var set = chart[id]["datasets"].map(dataset => {
            if (dataset["label"] === lb){
                let lastIdx = dataset["data"].length - 1;
                // console.log("DATASET\n"+dataset["data"][lastIdx].x)
                if(time > dataset["data"][lastIdx].x) {
                    dataset["data"] =  [
                        ...dataset["data"],
                        {x: time, y:Number(dat)}
                    ];
                    if (lastIdx >= MAX_PTS){
                        dataset["data"].shift();
                    }
                }
                found = true;
            } 
            return dataset;
        });
        if (!found) {
            set.push({  "label":lb,
                        "data":[{x: time, y:Number(dat)}],
                        "fill":false,
                        "borderColor":COLORS[chart[id]["datasets"].length%COLORS.length],
                        "lineTension":0.1
            })
        }
        holder[id] = {"datasets":set};
        // console.log("HOLDER\n"+JSON.stringify(holder))
        // setPlotPt({...plotPt, ...holder})
        // console.log("RETURN INSERT\n"+JSON.stringify({...chart, ...holder}))
        return({...chart, ...holder})
        // chart[id] = {"datasets":set};
    }

    function unwrapTele (id, preKey, data, chart, eqtime) {
        let holder = chart;
        Object.keys(data).forEach(key => {
            // console.log("key: "+key)
            if (key === "values" && Array.isArray(data[key])) {
                data[key].forEach(value => {
                    // console.log("CHART IN\n"+JSON.stringify(holder))
                    // console.log("VALUE\n"+JSON.stringify(value));
                    holder = insertData(id, preKey, value["value"], moment(value["updateTimeStamp"]), holder);
                    // console.log("CHART OUT\n"+JSON.stringify(holder))
                });
            } else if (isDict(data[key])) {		
                // console.log("IS DICT\n");	
                holder = unwrapTele(id, key, data[key], holder, eqtime);
            } else if (Number(data[key])) {
                // console.log("NUMBER\n"+Number(data[key]));
                holder = insertData(id, preKey, Number(key), moment(eqtime), holder);
            } 
            //else if (typeof(data[key])==='string') {
                // var temp = {};
                // var type = Object.keys(msgHolder)[0];
                // temp[msgHolder[type].id] = msgHolder[type].body.body;
                // setTeleHolder({...teleHolder, ...temp});
            // }
        });
        // console.log("RETURN UNWRAP\n"+JSON.stringify(holder))
        return holder;
    }

    function drawChart(msg, title, time){
        // console.log(moment(time)+" "+title);
        if (isDict(msg)) {
            // console.log("\naDraw\n"+JSON.stringify(plotPt))
            setPlotPt(unwrapTele(title, "body", msg, plotPt, time));
        } else {
            // console.log("bDraw\n"+JSON.stringify(plotPt))
            setPlotPt(insertData(title, "body", msg, time, plotPt));
        }
    }
    
    return (
    <>
      <Header userName={name}/>
      <div className="container-fluid content mb-3">
        <h3 style={{"textAlign":"center"}}>
            <b>Registered Devices</b>
        </h3>
        
        <br/>
        <hr/>
        <div id="devices">
            {
                Object.keys(devices).map(key => {
                    return (<div key={key}>
                                <div className="p-3 mb-2 bg-light">
                                    <p className="mt-3 d-inline-block">{displayName(twins[key],key)}</p>
                                    <ConnBadge data={devices[key]["state"]}/>
                                </div>
                                <ControlPanel   deviceId={key} displayName={displayName(twins[key],key)} 
                                                data={plotPt[key]} twin={twins[key]} result={teleHolder[key]}/>
                                <TwinBlock data={twins[key]}/>
                            </div>
                            );
                })
            }
        </div>

        {/* <div id="carousel" className="carousel slide p-5 border" data-interval="false">
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
        </div> */}
    </div>
     
    {/* <div id="modalHolder">
        <ControlPanel displayName="app" data=   {{"datasets":[{
                                                    "label":"label",
                                                    "data":plotPt
                                                }]}}/>
    </div> */}
    {/* <p>
        {JSON.stringify(twins)}
    </p> */}
    {/* <p>
        {JSON.stringify(devices)}
    </p> */}
    {/* <p>
        {JSON.stringify(plotPt)}
    </p> */}
    {/* <TwinBlock data={twins}/>
    <button type='button' className='btn btn-outline-secondary m-2' onClick={() => setTwins({...twins, "B":{3:4}})}> Add b </button> */}
    </>
  );
}

export default Index;
