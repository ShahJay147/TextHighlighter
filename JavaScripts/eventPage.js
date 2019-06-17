var menuItem, chrome_tabs;

init();

function init() {
	chrome_tabs = chrome.tabs;

	menuItemForContextMenus();
	onClickOfContextMenus();

	messageListner();
}

function menuItemForContextMenus() {
	menuItem = {
		"id": "highlighter",
		"title": "Highlighter",
		"contexts": ["selection"]
	};
	chrome.contextMenus.create(menuItem);
}

function onClickOfContextMenus() {
	chrome.contextMenus.onClicked.addListener(function(clickData) {
		if(clickData.menuItemId == "highlighter" && clickData.selectionText) {
			createNewHighlight();
		}
	});
}

function messageListner() {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.todo == "showAllHighlights") {
			getTab().then(function(tab) {
				var tab_url = tab.url;
				createAllHighlights(tab_url);
			});
		}
		else if(request.todo == "removeAllHighlights") {
			getTab().then(function(tab) {
				var tab_url = tab.url;
				deleteAllHighlights(tab_url);
				clearPage(tab_url);
			});
		}
		else if(request.todo == "changeColor") {
			changeColor(request.color);
		}
	});
}

function createNewHighlight() {
	getColor().then(function(color) {
		getRange().then(function(response) {
			var pathRange = response.pathRange, id = response.id;
			getTab().then(function(tab) {
				var tab_url = tab.url;
				storeHighlight(tab_url, pathRange, id, color);
			})
			createHighlight(pathRange, color, id);
		})
	});
}

function getRange() {
	return sendMessage({todo: "getRange"});
}

function createHighlight(pathRange, color, id) {
	return sendMessage({todo: "createHighlightText", pathRange: pathRange, color: color, id: id});
}

function createAllHighlights(tab_url) {
	getAllHighligths(tab_url).then(function (highlights) {
		for (var i = 0; highlights && i < highlights.length; i++) {
			var current_highlight = highlights[i];
		    createHighlight(current_highlight.pathRange, current_highlight.color, current_highlight.id);
		}
	})
}

function deleteAllHighlights(tab_url) {
	getAllHighligths(tab_url).then(function (highlights) {
		for (var i = 0; highlights && i < highlights.length; i++) {
			var current_highlight = highlights[i];
		    deleteHighlight(current_highlight.id);
		}
	})
}

function deleteHighlight(id) {
	sendMessage({todo: 'removeHighlight', id: id});
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
	});
}

function getTab() {
	return new Promise((resolve, reject) => {
		chrome_tabs.query( {active:true, currentWindow: true}, function(tabs) {
			resolve(tabs[0]);
		})
	})
}