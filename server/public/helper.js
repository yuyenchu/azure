function displayName(twin, id) {
    // twin = ftwin["device"];
    // console.log(JSON.stringify(ftwin));
    console.log(JSON.stringify(twin));
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["Name"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}

function displayTPEVer(ftwin) {
    twin = ftwin["device"];
    module = ftwin["module"];
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["general"] 
        && twin["properties"]["reported"]["general"]["thingsproVersion"]) {
        return twin["properties"]["reported"]["general"]["thingsproVersion"];
    } else if (module && module["thingspro-agent"] && module["thingspro-agent"]["general"] 
        && module["thingspro-agent"]["general"]["thingsproVersion"]) {
        return module["thingspro-agent"]["general"]["thingsproVersion"];
    } else{
        return "-";
    }
}

function isDict(v) {
    return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}