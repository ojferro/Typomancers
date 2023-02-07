function checkValidServer(server){
    if (server.length === 0){return false;}

    return true;
}
function checkValidUsername(username){
    if (username.length === 0){ return false; }

    return true;
}

function checkValidCharacter(character){
    const numCharacterSprites = 3;
    if (character.length === 0) {return false;}
    let c = parseInt(character);
    if(c <= 0 || c >numCharacterSprites) {return false;}

    return true;

}

function mainMenuEnterClick(){
    let server = document.getElementById('serverInput');
    let username = document.getElementById('usernameInput');
    let character = document.getElementById('characterInput');

    let s = server.value;
    let u = username.value;
    let c = character.value;

    if (!checkValidServer(s))
    {
        server.style.borderColor = "#880000";
        return false;
    }else{
        server.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border');
    }
    if (!checkValidUsername(u))
    {
        username.style.borderColor = "#880000";
        return false;
    }else{
        username.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border');
    }
    if (!checkValidCharacter(c))
    {
        character.style.borderColor = "#880000";
        return false;
    }else{
        character.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border');
    }

    sessionStorage.setItem("server", s);
    sessionStorage.setItem("username", u);
    sessionStorage.setItem("character", c);

    console.log(s);
    console.log(u);
    console.log(c);

    location.href = "loadingScreen.html";
}

mainMenuButton = document.getElementById("mainMenuButton");
mainMenuButton.addEventListener("click", mainMenuEnterClick);
