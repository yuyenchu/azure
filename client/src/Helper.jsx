export const displayName = (twin, id) => {
    if (twin && twin["properties"] && twin["properties"]["reported"] 
        && twin["properties"]["reported"]["Name"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}

// export const displayTPEVer = (ftwin) => {
//     if (twin && twin["properties"] && twin["properties"]["reported"] 
//         && twin["properties"]["reported"]["general"] 
//         && twin["properties"]["reported"]["general"]["thingsproVersion"]) {
//         return twin["properties"]["reported"]["general"]["thingsproVersion"];
//     } else {
//         return "-";
//     }
// }

export const displayTPEVer = (ftwin) => {
    console.log(JSON.stringify(ftwin))
    var device = ftwin["device"];
    var module = ftwin["module"];
    if (device && hasTPEVer(device)) {
        return device["properties"]["reported"]["general"]["thingsproVersion"];
    } else if (module && module["thingspro-agent"] && hasTPEVer(module["thingspro-agent"])) {
        return module["thingspro-agent"]["properties"]["reported"]["general"]["thingsproVersion"];
    } else{
        return "-";
    }
}

export const hasTPEVer = (twin) => {
    return (twin["properties"]["reported"] && twin["properties"]["reported"]["general"] 
        && twin["properties"]["reported"]["general"]["thingsproVersion"]);
}

export const isDict = (v) => {
    return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}