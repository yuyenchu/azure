import React from 'react';

function ConnBadge(props){
    const component = ()=>{
        console.log(props.data);
        if (props.data === "Disconnected") {
            return (<span className="m-2 badge badge-danger">{props.data}</span>);
        } else {
            return (<span className="m-2 badge badge-success">{props.data}</span>);
        }
    }

    return(component());
}

export default ConnBadge;