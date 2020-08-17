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
    device = ftwin["device"];
    module = ftwin["module"];
    if (hasTPEVer(device)) {
        return device["properties"]["reported"]["general"]["thingsproVersion"];
    } else if (module && module["thingspro-agent"] && hasTPEVer(module["thingspro-agent"])) {
        return module["thingspro-agent"]["properties"]["reported"]["general"]["thingsproVersion"];
    } else{
        return "-";
    }
}

function hasTPEVer(twin) {
    return (twin["properties"]["reported"] && twin["properties"]["reported"]["general"] 
        && twin["properties"]["reported"]["general"]["thingsproVersion"]);
}

function isDict(v) {
    return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}