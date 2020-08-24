import React from 'react';
import Switch from '@material-ui/core/Switch';

function MsgController(props){
    const handleChange = (event) => {
        props.switchMsgGroup(event.target.checked, props.data["outputTopic"]);
    }

    return (<div className="col m-1">
                <Switch color="primary" checked={props.data["enable"]} onChange={handleChange}/>
                <label className="ml-1 form-check-label">{props.data["outputTopic"]}</label>
            </div>);
}

export default MsgController;