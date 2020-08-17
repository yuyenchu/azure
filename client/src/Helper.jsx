export const displayTPEVer = (twin) => {
    if (twin && twin["properties"] && twin["properties"]["reported"] 
        && twin["properties"]["reported"]["general"] 
        && twin["properties"]["reported"]["general"]["thingsproVersion"]) {
        return twin["properties"]["reported"]["general"]["thingsproVersion"];
    } else {
        return "-";
    }
}

export const displayName = (twin, id) => {
    if (twin && twin["properties"] && twin["properties"]["reported"] 
        && twin["properties"]["reported"]["Name"]) {
        return twin["properties"]["reported"]["Name"];
    } else {
        return id;
    }
}