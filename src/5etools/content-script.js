console.log("Beyond20: 5etools module loaded.");

//const chat = document.getElementById("textchat-input");
//const txt = chat.getElementsByTagName("ipt-roll")[0];
//const btn = chat.getElementsByTagName("btn")[0];
const btn = document.getElementById("reset");
//const speakingas = document.getElementById("speakingas");
//var settings = getDefaultSettings();


function injectSettingsButton() {
    const icon = chrome.extension.getURL("images/icons/icon32.png");
    let img = document.getElementById("beyond20-settings");
    if (img)
        img.remove();
    img = E.img({ id: "beyond20-settings", src: icon, style: "margin-left: 5px;" });
    btn.after(img);
    img.onclick = () => {
        console.log("About to send rendered roll");
        const req = {
            action: "rendered-roll",
            character: "bob",
            title: "some title",
            damage_rolls: [["some damage name", "damage roll"]],
            attack_rolls: [],
            attributes : {},
            total_damages: [],
        }
        req.request = {...req}
        chrome.runtime.sendMessage(req, (resp) => console.log("response: ", resp));}
}




function documentLoaded(settings) {
    /*var observeDOM = (function() {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        return function(obj, callback) {
            if (!obj || obj.nodeType !== 1) return;
            if (MutationObserver) {
                // define a new observer 
                var mutationObserver = new MutationObserver(callback)
                // have the observer observe foo for changes in children 
                mutationObserver.observe(obj, {
                    childList: true,
                    subtree: true
                }) return mutationObserver
            }
            // browser support fallback
            else if (window.addEventListener) {
                obj.addEventListener('DOMNodeInserted', callback, false) obj.addEventListener('DOMNodeRemoved', callback, false)
            }
        }
    }
    )()*/

}

function updateSettings(new_settings = null) {
    if (new_settings) {
        settings = new_settings;
        //roll_renderer.setSettings(settings);
    } else {
        getStoredSettings((saved_settings) => {
            updateSettings(saved_settings);
            documentLoaded(saved_settings);
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
