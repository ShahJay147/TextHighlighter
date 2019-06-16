var menuItem;
var chrome_tabs;

init();

function init() {
	menuItem = {
		"id": "highlighter",
		"title": "Highlighter",
		"contexts": ["selection"]
	}

	chrome_tabs = chrome.tabs;

	chrome.contextMenus.create(menuItem);

	chrome.contextMenus.onClicked.addListener(function(clickData) {
		if(clickData.menuItemId == "highlighter" && clickData.selectionText) {
			createNewHighlight();
		}
	})

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.todo == "showALlHighlighters") {
			getTab().then(function(tab) {
				var tab_url = tab.url;
				createAllHighlights(tab_url);
			});	
		}
	})
}

function createNewHighlight() {
	getRange().then(function(pathRange) {
		getTab().then(function(tab) {
			var tab_url = tab.url;
			storeHighlight(tab_url, pathRange);
		})
		createHighlight(pathRange);
	});
}

function getRange() {
	return sendMessage({todo: "getRange"});
}

function createHighlight(pathRange) {
	return sendMessage({todo: "createHighlightText", pathRange: pathRange});
}

function createAllHighlights(tab_url) {
	getAllHighligths(tab_url).then(function (highlights) {
		for (var i = 0; highlights && i < highlights.length; i++) {
		    createHighlight(highlights[i].pathRange);
		}
	})
}

function sendMessage(message) {
	return new Promise((resolve, reject) => {
		getTab().then(function(tab) {
			var tab_id = tab.id;
			chrome_tabs.sendMessage(tab_id, message, function (response) {
	            if (typeof response === 'undefined') {
	                reject();
	                return
	            }
	            resolve(response);
			})
		})
	})
}

function getTab() {
	return new Promise((resolve, reject) => {
		chrome_tabs.query( {active:true, currentWindow: true}, function(tabs) {
			resolve(tabs[0]);
		})
	})
}