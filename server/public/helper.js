function displayName(twin, id) {
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["Name"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}

function displayTPEVer(twin) {
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["general"] 
        && twin["properties"]["reported"]["general"]["thingsproVersion"]) {
        return twin["properties"]["reported"]["general"]["thingsproVersion"];
    } else {
        return "-";
    }
}