// JSON SCHEMA FOR MESSAGES
// {
//     "clientID": 0,    <--  -1 means sent by server
//     "type": "this_point_in_the_game",  <-- unique ID for what the msg represents
//     "body": ...    <--  can be a json sub-tree, or a simple msg
// }

function receiveMsgFromServer(msg_raw){
    let msg = JSON.parse(msg_raw);

    console.log("Message received");
    console.log(`From ${msg["clientID"]}`);

    if (msg["type"] === "assign_client_id") {assignClientID(msg)}
    else if (msg["type"])

}

function assignClientID(msg){
    // Expects msg to be structured as follows:
    //{
    //   "clientID": clientIDToBeAssigned,
    //   "type": "assign_client_id",
    //   "body": {
    //           "username": "someUsername"
    //           }
    // }

    let id = parseInt(msg["clientID"]);
    let myUsername = sessionStorage.getItem("username");

    if (msg["body"]["username"] === myUsername)
    {
        sessionStorage.setItem("clientID", parseInt(msg["clientID"]));
        console.log(`ClientID set to ${id}`);
    }
}

function requestClientIDFromServer(msg){
    
}