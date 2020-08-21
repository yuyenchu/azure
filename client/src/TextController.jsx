import React, { useState } from 'react';
import axios from 'axios';

function TextController(props){
    const [method, setMethod] = useState('');
    const [payload, setPayload] = useState('');
    const [result, setResult] = useState('');

    const handleMethod = (event)=>{setMethod(event.target.value)}
    const handlePayload = (event)=>{setPayload(event.target.value)}

    const clear = () => {
        setMethod('');
        setPayload('');
    };

    const invoke = () => {
        console.log("method:\n"+method.trim())
        console.log("payload:\n"+payload.trim())
        axios({
            method: 'POST',
            url: "http://localhost:3000/method/"+props.deviceId+"/"+method.trim(),
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            },
            data: payload.trim(),
        }).then((response) => { 
            setResult(typeof(response.data)==="string"?response.data:JSON.stringify(response.data));
        });
    };

    return (<>
                <div className="form-group col">
                    <label for="input">Method Name</label>
                    <input  className="form-control" 
                            id="input" 
                            placeholder="Mathod" 
                            onChange={handleMethod}/>
                    <label for="textarea">Payload</label>
                    <textarea   className="form-control" 
                                id="textarea" 
                                placeholder="Payload" 
                                rows="5" 
                                style={{"max-height": "200px", "min-height": "40px"}}
                                onChange={handlePayload}></textarea>
                    <button type="button" className="btn btn-primary mt-3" onClick={invoke}>submit</button>
                    <button type="button" className="btn btn-primary mt-3 ml-3" onClick={clear}>clear</button>
                </div>
                <textarea   readonly="" 
                            className="form-control mr-2 ml-2" 
                            placeholder="result: {}"
                            rows="2" 
                            style={{"margin-top": "0px", 
                                    "margin-bottom": "0px", 
                                    "max-height": "150px", 
                                    "min-height": "40px;"}} 
                            value={result}></textarea>
            </>);
}

export default TextController;