import React from 'react';

function TwinBlock(props) {
    const unwrap = (data, indent)=>{
        console.log(Object.keys(data)+" "+indent)
        if (data== null || ['string', 'number', 'boolean'].indexOf(typeof(data)) >= 0){
            return data == null ? "null" : data;
        } else {
            return (
                Object.keys(data).map(element => {
                    var ele = typeof(element)=="string" ? element.replace("$","") : element;
                    if (ele != "metadata") {
                        return( <p style={{"textIndent":(indent*20)+"px","marginTop":"-5px"}}>
                                    {ele+": "}{unwrap(data[element], indent+1)}</p>);
                    }
                    return (<></>);
                })
            );
        }
    }

    return (
        Object.keys(props.data).map(element => {
            return( <p>{element+": "}{unwrap(props.data[element], 1)}</p>);
        })
    );
}

export default TwinBlock;