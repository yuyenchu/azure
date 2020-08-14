function displayName(ftwin, id) {
    twin = ftwin["device"];
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["Name"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}

function displayTPEVer(ftwin) {
    twin = ftwin["device"];
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["general"] 
        && twin["properties"]["reported"]["general"]["thingsproVersion"]) {
        return twin["properties"]["reported"]["general"]["thingsproVersion"];
    } else {
        return "-";
    }
}

function isDict(v) {
    return typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date);
}