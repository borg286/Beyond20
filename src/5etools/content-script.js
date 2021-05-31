console.log("Beyond20: 5etools module loaded.");

//const chat = document.getElementById("textchat-input");
//const txt = chat.getElementsByTagName("ipt-roll")[0];
//const btn = chat.getElementsByTagName("btn")[0];
//const speakingas = document.getElementById("speakingas");
var settings = getDefaultSettings();


function injectSettingsButton() {
    const icon = chrome.extension.getURL("images/icons/icon32.png");
    let img = document.getElementById("beyond20-settings");
    if (img)
        img.remove();
    img = E.img({ id: "beyond20-settings", src: icon, style: "margin-left: 5px;" });
    //btn.after(img);
    img.onclick = alertQuickSettings;
}



function updateSettings(new_settings = null) {
    if (new_settings) {
        settings = new_settings;
        roll_renderer.setSettings(settings);
    } else {
        getStoredSettings((saved_settings) => {
            updateSettings(saved_settings);
        });
    }
}




function handleMessage(request, sender, sendResponse) {
    console.log("Got message : ", request);
    if (request.action == "settings") {
        if (request.type == "general")
            updateSettings(request.settings);
    } else if (request.action == "open-options") {
        alertFullSettings();
    } else {

    }
}

chrome.runtime.onMessage.addListener(handleMessage);
updateSettings();
chrome.runtime.sendMessage({ "action": "activate-icon" });
sendCustomEvent("disconnect");
injectPageScript(chrome.runtime.getURL('dist/etools_script.js'));
injectSettingsButton();
