function displayName(twin, id) {
    if (twin["properties"]["reported"]["Name"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}

function displayTPEVer(twin, id) {
    if (twin["properties"]["reported"]["general"] && twin["reported"]["general"]["thingsproVersion"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}