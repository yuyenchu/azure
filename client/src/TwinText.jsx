import React from 'react';

function TwinText(props) {
    const unwrap = (data, indent)=>{
        // console.log(Object.keys(data)+" "+indent)
        if (data== null || ['string', 'number', 'boolean'].indexOf(typeof(data)) >= 0){
            return data == null ? "null" : data;
        } else {
            return (
                Object.keys(data).map(element => {
                    var ele = typeof(element)=="string" ? element.replace("$","") : element;
                    if (ele !== "metadata") {
                        return( <div key={ele} style={{"textIndent":(indent*20)+"px","marginTop":"-5px"}}>
                                    {ele+": "}{unwrap(data[element], indent+1)}</div>);
                    }
                    return (<></>);
                })
            );
        }
    }

    const generate = ()=>{
        if (props.data) {
         return (Object.keys(props.data).map(element => {
            // console.log("TWIN ELE "+element)
            return( <div key={element}>{element+": "}{unwrap(props.data[element], 1)}</div>);
        }));
        }
        return (<></>);
    }

    return (<>{generate()}</>);
}

export default TwinText;