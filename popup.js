document.addEventListener('DOMContentLoaded', function() {
    GrabLink(false);
    var prTemplateBox = document.getElementById("prTemplateBox");
    if (prTemplateBox){
        prTemplateBox.addEventListener("click", function(){
            GrabLink(true);
            ribbit();
        });
    }
    ribbit();
    var result = document.getElementById("result");
    result.innerText = "Link copied to clipboard";       
    });


function ribbit(){
    var myAudio = new Audio(chrome.runtime.getURL("Frog sound effect.mp3"));
    myAudio.play();
}
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

async function GrabLink(copyTemplate)
{
    var tab = await getCurrentTab();
    var activeTabUrl = tab.url; // or do whatever you need
    if (activeTabUrl.includes("atpdevelopment.visualstudio.com/AES%20ARTen")){
        if (activeTabUrl.includes("?workitem=")){
            var actualItem = activeTabUrl.split("?workitem=").pop();
            activeTabUrl = activeTabUrl.split("/edit/")[0] + "/edit/" + actualItem;
        }
        var onlyId = document.getElementById("prTemplate");
        onlyId.style.visibility = "visible";

    }
    const resp = await fetch(activeTabUrl);
    var text = await resp.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, 'text/html');
    var title = doc.querySelectorAll("title")[0];
    let identifier = title.innerText;
    if (copyTemplate){
        let prTemplate = `[${identifier}](${activeTabUrl})`;
        copyAsPrTemplate(prTemplate)
    }
    else {
        copyAsHyperlink(activeTabUrl, identifier);
    }
    
}

function copyAsHyperlink(url, title) {
    var div = document.createElement('div');
    var anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.innerHTML = title;
    anchor.style.fontFamily = 'Calibri  ';
    anchor.style.fontSize='11pt';
    anchor.style.backgroundColor = 'transparent';
    div.appendChild(anchor);
    document.body.appendChild(div);
    var range = document.createRange();
    range.selectNode(div);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(div);
}

function copyAsPrTemplate(prTemplate){
    var div = document.createElement('div');
    div.innerHTML = prTemplate;
    div.style.fontFamily = 'Calibri  ';
    div.style.fontSize='11pt';
    div.style.backgroundColor = 'transparent';
    document.body.appendChild(div);
    var range = document.createRange();
    range.selectNode(div);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(div);
}