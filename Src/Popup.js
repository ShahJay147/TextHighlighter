$(function(){
	init();
});

function init() {
	removeHighlights();
	getAndSetCurrentColor();
	changeColor('yellow');
	changeColor('cyan');
	changeColor('lime');
	changeColor('magenta');
}

// when someone preses clear all button all highlights would be remove of that page
function removeHighlights() {
	$('#remove-highlights').click(function(){
		sendMessageToBackground({todo: "removeAllHighlights"});
	});
}

// useful when popup initializes current color of highlighter would be shown
function getAndSetCurrentColor() {
	chrome.storage.local.get('color', function (result) {
		var color = result.color;
		if(color === undefined) {
			color = 'yellow';
			chrome.storage.local.set({ color: color });
		}
		setCurrentColor(color);
    });
}

// to change color of highlighter
function changeColor(color) {
	$('#'+color+'-color').click(function() {
		sendMessageToBackground({todo: "changeColor", color: color});
		setCurrentColor(color);
	});
}

function setCurrentColor(color) {
	$('#color').html('<p>Current Color : </p><span class="rectangle '+color+'-highlighter"><span id="current-color">'+color+'</span>');
}

// useful to commumicate with background script
function sendMessageToBackground(message) {
		chrome.runtime.sendMessage(message);
}