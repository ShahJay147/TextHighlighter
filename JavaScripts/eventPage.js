var menuItem = {
	"id": "highlighter",
	"title": "Highlighter",
	"contexts": ["selection"]
}

chrome.contextMenus.create(menuItem);

chrome.contextMenus.onClicked.addListener(function(clickData) {
	if(clickData.menuItemId == "highlighter" && clickData.selectionText) {
			getRange().then(function(response) {
				return createHighlight(response.pathRange);
			});
	}
});

function getRange() {
	return sendMessage({todo: "getRange"});
}

function createHighlight(pathRange) {
	return sendMessage({todo: "createHighlightText", pathRange: pathRange});
}

function sendMessage(message) {
	return new Promise((resolve, reject) => {
		chrome.tabs.query( {active:true, currentWindow: true}, function(tabs) {
			var tab_id = tabs[0].id
			chrome.tabs.sendMessage(tab_id, message, function (response) {
                if (typeof response === 'undefined') {
                    reject();
                    return
                }
                resolve(response);
			})
		})
	})
}