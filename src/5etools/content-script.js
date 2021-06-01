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



// Copied from stackoverflow on how to inject an event listener.
var observeDOM = (function() {
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
            });
            return mutationObserver
        }
        // browser support fallback
        else if (window.addEventListener) {
            obj.addEventListener('DOMNodeInserted', callback, false)
            obj.addEventListener('DOMNodeRemoved', callback, false)
        }
    }
}
)()
console.log("Outter: ", document.getElementsByClassName("rollbox"))


function documentLoaded(settings) {
    window.setTimeout(() => {
        console.log("wait done, ", document.getElementsByClassName("rollbox")); 
        observeDOM(document.getElementsByClassName("rollbox")[0], 
            function(e){
                console.log(e);
                // e is the event containing the new elements added to the rollbox
                var elem = e.filter(m => m.target.className === "out-roll-wrp");
                console.log("length " + elem.length);
                console.log(elem);
                // Get at the specific roll which includes that kind of roll, the total, and the individual rolls
                var item = elem[0].addedNodes[1]
                var title = item.title
                console.log("title: ", title)
                var rolldetails = item.childNodes[1].innerText
                // Extract the parts
                // Constitution: 14 [11] + 3
                var titleAndRoll = rolldetails.split(":");
                // Pull out the type of dice used for the roll, the first one is like 1d20 or 8d6. We are throwing away the constant modifier as it gives away too much information.
                title = titleAndRoll[0] + " _(" + title.match(": ([0-9]+d[0-9]+)")[0].split(":")[1].trim() + " + ...)_"
                console.log("new title is, ", title)
                var totalAndRolls = titleAndRoll[1].split("[");
                console.log("rolldetails: ", rolldetails);
                // The monster doing the roll is hard to find in the event e, so we'll just find the most recently added out-roll-id which has the monster's name
                var actors = document.getElementsByClassName("out-roll")[0].getElementsByClassName("out-roll-id");
                var actor = actors[0].innerText
                const req = {
                    action: "rendered-roll",
                    character: actor,
                    title: title,
                    damage_rolls: [[totalAndRolls[0],""/* "_[" + totalAndRolls[1] + "_"*/]],
                    attack_rolls: [],
                    attributes : {},
                    total_damages: [],
                }
                req.request = {...req}
                chrome.runtime.sendMessage(req, (resp) => console.log("response: ", resp));
            }
            )}, 1000);
    
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
