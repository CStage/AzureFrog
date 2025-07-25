document.addEventListener('DOMContentLoaded', function() {
    GrabLink(false, false);
    let prTemplateBox = document.getElementById("prTemplateBox");
    if (prTemplateBox){
        prTemplateBox.addEventListener("click", function(){
            GrabLink(true, false);
            ribbit();
        });
    }
    let statusBox = document.getElementById("statusLinkBox");
    if (statusBox){
        statusBox.addEventListener("click", function(){
            GrabLink(false, true);
            ribbit();
        })
    }
    ribbit();
    let result = document.getElementById("result");
    result.innerText = "Link copied to clipboard";       
    });


function ribbit(){
    let myAudio = new Audio(chrome.runtime.getURL("Frog sound effect.mp3"));
    myAudio.play();
}
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

async function GrabLink(copyTemplate, copyForStatus)
{
    let tab = await getCurrentTab();
    let activeTabUrl = tab.url; // or do whatever you need
    if (activeTabUrl.includes("atpdevelopment.visualstudio.com/AES%20ARTen")){
        if (activeTabUrl.includes("?workitem=")){
            let actualItem = activeTabUrl.split("?workitem=").pop();
            activeTabUrl = activeTabUrl.split("/edit/")[0] + "/edit/" + actualItem;
        }
        let onlyId = document.getElementById("prTemplate");
        onlyId.style.visibility = "visible";
    }
    if (activeTabUrl.includes("atpdevelopment.visualstudio.com")){
        let statusLinkBox = document.getElementById("statusLink");
        statusLinkBox.style.visibility = "visible";
    }

    
    const resp = await fetch(activeTabUrl);
    let text = await resp.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(text, 'text/html');
    let title = doc.querySelectorAll("title")[0];
    let identifier = title.innerText;
    console.log("title: " + title);
    console.log("identifier: " + identifier);
    if (activeTabUrl.includes("atpdevelopment.visualstudio.com") && copyForStatus){
        copyAsStatusLink(activeTabUrl, identifier);
    }
    else if (activeTabUrl.includes("goto.netcompany.com") && activeTabUrl.includes("Lists") && activeTabUrl.includes("ID")){
        let breadCrumbContainingTitle = doc.getElementsByClassName("ms-breadcrumbCurrentNode")[0];
        let itemType = activeTabUrl.split("/Lists/")[1].split("/")[0];
        let trimmedUrl = activeTabUrl.split("&")[0];
        let itemId = trimmedUrl.split("ID=")[1];
        if (itemType === 'Tasks'){
            itemType = 'Case';
        }
        else if (itemType === 'Fejlrapporter'){
            itemType = 'Bug Report';
        }
        identifier = `${itemType} ${itemId}: ${breadCrumbContainingTitle.innerText}`;


        let prTemplate = `[${identifier}](${trimmedUrl})`;
        copyAsPrTemplate(prTemplate)
    }
    else if (copyTemplate){
        let prTemplate = `[${identifier}](${activeTabUrl})`;
        copyAsPrTemplate(prTemplate)
    }
    else {
        copyAsHyperlink(activeTabUrl, identifier);
    }
    
}

function copyAsStatusLink(url, title) {
    let div = document.createElement('div');
    let anchor = document.createElement('a');
    let beginningParagraph = document.createElement("span");
    let startP = document.createElement("span");
    let endP = document.createElement("span");

    // Feature 161940: Azure Frog
    let titleArray = title.split(":")[0].split(" ");
    console.log("Title: " + titleArray);
    let workItemPrefix = "";
    for (const s of titleArray.slice(0, -1)){
        workItemPrefix += Array.from(s)[0];
    }
    let id = titleArray.pop();
    console.log(title.split(":"));
    let featureName = title.split(":").slice(1).join(":")
    beginningParagraph.innerHTML = `<b>${workItemPrefix}${id}</b> `;
    startP.innerHTML = "(";
    endP.innerHTML = ")";
    anchor.setAttribute('href', url);
    anchor.innerHTML = featureName;
    
    div.appendChild(beginningParagraph);
    div.appendChild(startP);
    div.appendChild(anchor);
    div.appendChild(endP);
    
    div.style.fontFamily = 'Arial';
    div.style.fontSize = '9pt';
    div.style.backgroundColor = 'transparent';
    
    document.body.appendChild(div);
    
    let range = document.createRange();
    range.selectNodeContents(div);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    console.log(div)
    
    try {
        document.execCommand('copy');
        console.log('Copied: ', div.innerHTML);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
    
    selection.removeAllRanges();
    document.body.removeChild(div);
}

function copyAsReviewRequest(url, title) {
    let div = document.createElement('div');
    let anchor = document.createElement('a');
    let beginningParagraph = document.createElement("span");
    let endingParagraph = document.createElement("span");
    
    beginningParagraph.innerHTML = "@PR I have a ";
    endingParagraph.innerHTML = " ready for review.";
    anchor.setAttribute('href', url);
    anchor.innerHTML = title;
    
    div.appendChild(beginningParagraph);
    div.appendChild(anchor);
    div.appendChild(endingParagraph);
    
    div.style.fontFamily = 'Calibri';
    div.style.fontSize = '11pt';
    div.style.backgroundColor = 'transparent';
    
    document.body.appendChild(div);
    
    let range = document.createRange();
    range.selectNodeContents(div);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
        document.execCommand('copy');
        console.log('Copied: ', div.innerHTML);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
    
    selection.removeAllRanges();
    document.body.removeChild(div);
}

function copyAsHyperlink(url, title) {
    let div = document.createElement('div');
    let anchor = document.createElement('a');
    anchor.setAttribute('href', url);
    anchor.innerHTML = title;
    anchor.style.fontFamily = 'Calibri  ';
    anchor.style.fontSize='11pt';
    anchor.style.backgroundColor = 'transparent';
    div.appendChild(anchor);
    document.body.appendChild(div);
    let range = document.createRange();
    range.selectNode(div);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(div);
}

function copyAsPrTemplate(prTemplate){
    let div = document.createElement('div');
    div.innerHTML = prTemplate;
    div.style.fontFamily = 'Calibri  ';
    div.style.fontSize='11pt';
    div.style.backgroundColor = 'transparent';
    document.body.appendChild(div);
    let range = document.createRange();
    range.selectNode(div);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(div);
}