import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import TwinText from './TwinText.jsx'

function TwinBlock(props) {
    const [open, setOpen] = useState(false);

    return (
        <>
        <button className="btn btn-info ml-2 mb-2" 
            onClick={() => setOpen(!open)}
            aria-controls="collapse-text"
            aria-expanded={open}>
                full twin</button>
         
        <Collapse className="mb-2"in={open}>
            <div id="collapse-text">
                <TwinText data={props.data}/>
            </div>
        </Collapse>  
        </>
    );
}

export default TwinBlock;