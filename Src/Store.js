// to store newly created highlight
function storeHighlight(tab_url, pathRange, id, color) {
	chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;

        if (!highlights[tab_url])
            highlights[tab_url] = [];

        highlights[tab_url].push({
        	pathRange: pathRange,
            color: color,
            id: id
        });
        chrome.storage.local.set({highlights});
    });
}

// gives all highlights of particular url
function getAllHighligths(tab_url) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get({highlights: {}}, function (result) {
	        highlights = result.highlights[tab_url];
	        resolve(highlights);
	    })
	});
}

// remove all highlights of particular url
function clearPage(tab_url) {
    chrome.storage.local.get({highlights: {}}, (result) => {
        var highlights = result.highlights;
        delete highlights[tab_url];
        chrome.storage.local.set({highlights});
    });
}

function changeColor(color) {
	chrome.storage.local.set({ color: color });
}

function getColor() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('color', function (result) {
			var color = result.color;
			if(color === undefined) {
				color = 'yellow';
				changeColor(color);
			}
			resolve(color);
	    })
	});
}