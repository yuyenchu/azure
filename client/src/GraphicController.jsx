import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MsgController from './MsgController.jsx';

function GraphicController(props){
    const [msgGroup, setMsgGroup] = useState({});

    useEffect(() => { 
        getMsgGroup();
    },[]);

    const getMsgGroup = () => {
        axios({
            url: "http://localhost:3000/method/"+props.deviceId+"/message-policy-get",
            method: 'POST',
            data: {},
        }).then((response) => { 
            console.log("Msg Group Controller: "+JSON.stringify(response.data));
            setMsgGroup(response.data);
        });
    }

    const switchMsgGroup = (check, topic) => {
        console.log("msgput " + check);
        var holder = (msgGroup["groups"].map(group=>{
            if(group["outputTopic"] === topic) {
                group["enable"] = check;
            }
            return group;
        }));
        axios({
            url: "http://localhost:3000/method/"+props.deviceId+"/message-policy-put",
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({"groups":holder}),
        }).then((response) => { 
            console.log("Msg Group put: "+JSON.stringify(response.data));
        });
        setMsgGroup({"groups":holder});
    }

    function generate(){
        // msgGroup[deviceId] = data.payload.data.groups;
        if (msgGroup["groups"]) {
            // console.log("LEN "+msgGroup["groups"].length)
            return (msgGroup["groups"].map((element,index) => {
                // console.log("MAP ("+index+") "+JSON.stringify(element))
                if (index%3==0) {
                    return( <div class="row mb-2 container-fluid">
                                {getMsgController(index)}
                                {getMsgController(index+1)}
                                {getMsgController(index+2)}
                            </div>);
                } 
            }));
        }
    }

    function getMsgController (idx) {
        if (idx < msgGroup["groups"].length) {
            // console.log("idx ("+idx+") "+JSON.stringify(msgGroup["groups"][idx]))
            return (<MsgController switchMsgGroup={switchMsgGroup} deviceId={props.deviceId} data={msgGroup["groups"][idx]}/>)
        }
    }

    return (<>{generate()}</>);
}

export default GraphicController;