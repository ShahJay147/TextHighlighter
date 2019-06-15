var menuItem = {
	"id": "highlighter",
	"title": "Highlighter",
	"contexts": ["selection"]
}

chrome.contextMenus.create(menuItem);

chrome.contextMenus.onClicked.addListener(function(clickData){
	if(clickData.menuItemId == "highlighter" && clickData.selectionText){
		sendMessage({todo: "createHighlightText", text: clickData});
	}
});

function sendMessage(message) {
	chrome.tabs.query( {active:true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message);
	});
}