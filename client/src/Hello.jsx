import React, { useState } from 'react';
import Header from './Header.jsx';
import ControlPanel from './ControlPanel.jsx';
import GraphicController from './GraphicController.jsx';

function Hello(){
    const [name, setName] = useState('A');
    const [twins, setTwins] = useState({"a":{"enable":true}});

    return (

        <div>
            <Header userName="hello"/>
            <p>HelloWorld</p>
            <p>{name}</p>
            <p>{JSON.stringify(twins)}</p>
            <button type='button' className='btn btn-outline-secondary m-2' onClick={() => setTwins({...twins, "B":{3:4}})}> Add b </button>
            <GraphicController deviceId="simulate2"/>
            <ControlPanel displayName="app"/>
        </div>

    );
}

export default Hello;