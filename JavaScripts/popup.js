$(function(){
	init();
});

function init() {
	removeHighlights();
	getAndSetColor();
	changeColor('yellow');
	changeColor('cyan');
	changeColor('lime');
	changeColor('magenta');
}

function removeHighlights() {
	$('#remove-highlights').click(function(){
		sendMessageToBackground({todo: "removeAllHighlights"});
	});
}

function getAndSetColor() {
	chrome.storage.local.get('color', function (result) {
		var color = result.color;
		if(color === undefined) {
			color = 'yellow';
			chrome.storage.local.set({ color: color });
		}
		setCurrentColor(color);
    });
}

function changeColor(color) {
	$('#'+color+'-color').click(function() {
		sendMessageToBackground({todo: "changeColor", color: color});
		console.log(color);
		setCurrentColor(color);
	});
}

function setCurrentColor(color) {
	$('#color').html('<p>Current Color : </p><span class="rectangle '+color+'-highlighter"><span id="current-color">'+color+'</span>');
}

function sendMessageToBackground(message) {
		chrome.runtime.sendMessage(message);
}