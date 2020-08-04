function displayName(twin, id) {
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["Name"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}

function displayTPEVer(twin) {
    if (twin["properties"]["reported"] && twin["properties"]["reported"]["general"] && twin["reported"]["general"]["thingsproVersion"]) {
        return twin["properties"]["general"]["thingsproVersion"];
    } else {
        return "-";
    }
}