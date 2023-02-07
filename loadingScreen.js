// Set up to receive messages from server

function init() {
    let server = sessionStorage.getItem("server")
    // serverID = '97f0-2601-602-9000-f940-6cb6-f0e6-ce03-79d7'
    // ws = new WebSocket(`wss://${serverID}.ngrok.io/deviceinfo`);
    ws = new WebSocket(server);
    ws.onopen = () => {
      console.log('Connection opened!');
    }
    ws.onmessage = ( event ) => {event.data.text().then((a) => {receiveMsgFromServer});};
    ws.onclose = function() {
      ws = null;
    }

    sessionStorage.setItem("ws", JSON.stringify(ws));

    let username = sessionStorage.getItem("username")
    const msg = {
        "clientID": "",
        "type": "request_clientID",
        "body": {
            "username": username
        }
    };
    console.log(JSON.stringify(msg));

      ws.send(JSON.stringify(msg));
  }


function startGameClick(){
    console.log("Starting game");

    location.href = "game.html";
}




init()
startGameButton = document.getElementById("startGameButton");
startGameButton.addEventListener("click", startGameClick);
