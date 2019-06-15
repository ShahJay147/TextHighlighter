
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.todo == "createHighlightText") {
        var pathRange = request.pathRange;
	    var className = "yellow-highlighter";
		let range = createRangeFromPathRange(pathRange);
        let firstSpan = create(range, className);
        firstSpan.setAttribute("tabindex", "0");
        const closeElm = document.createElement("span");
        firstSpan.appendChild(closeElm);
        response = !!firstSpan;
	}
    else if(request.todo == "getRange") {
        var selection = window.getSelection();
        var selectedRange = selection.getRangeAt(0);
        var pathRange = {
            startContainerPath: getPath(selectedRange.startContainer),
            startOffset: selectedRange.startOffset,
            endContainerPath: getPath(selectedRange.endContainer),
            endOffset: selectedRange.endOffset,
            collapsed: selectedRange.collapsed
        };
        response = {pathRange: pathRange};
    }
    sendResponse(response);
});

	function getPath(node) {
        let tests = []
        for (;
            node && (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE);
            node = node.parentNode) {
            let predicates = []
            let test = (() => {
                switch (node.nodeType) {
                    case Node.ELEMENT_NODE:
                        return node.nodeName.toLowerCase()
                    case Node.TEXT_NODE:
                        return 'text()'
                    default:
                        console.error(`invalid node type: ${node.nodeType}`)
                }
            })()
            if (node.nodeType === Node.ELEMENT_NODE && node.id.length > 0) {
                if (node.ownerDocument.querySelectorAll(`#${node.id}`).length === 1) {
                    tests.unshift(`/${test}[@id="${node.id}"]`)
                    break
                }    
                if (node.parentElement && !Array.prototype.slice
                    .call(node.parentElement.children)
                    .some(sibling => sibling !== node && sibling.id === node.id)) {
                    predicates.push(`@id="${node.id}"`)
                }
            }
            if (predicates.length === 0) {
                let index = 1
                for (let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
                    if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE ||
                        node.nodeType !== sibling.nodeType ||
                        sibling.nodeName !== node.nodeName) {
                        continue
                    }
                    index++
                }
                if (index > 1) {
                    predicates.push(`${index}`)
                }
            }
            tests.unshift(test + predicates.map(p => `[${p}]`).join(''))
        }
        return tests.length === 0 ? "" : `/${tests.join('/')}`
    };

    function createRangeFromPathRange(pathRange) {
        var startContainer, endContainer, endOffset, evaluator = new XPathEvaluator();
        startContainer = evaluator.evaluate(pathRange.startContainerPath,
            document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        if (!startContainer.singleNodeValue) {
            return null;
        }

        if (pathRange.collapsed || !pathRange.endContainerPath) {
            endContainer = startContainer;
            endOffset = pathRange.startOffset;
        } else {
            endContainer = evaluator.evaluate(pathRange.endContainerPath,
                document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            if (!endContainer.singleNodeValue) {
                return null;
            }

            endOffset = pathRange.endOffset;
        }
        var range = document.createRange();
        range.setStart(startContainer.singleNodeValue, pathRange.startOffset);
        range.setEnd(endContainer.singleNodeValue, endOffset);

        return range;
    };

    function create(range, className) {
        var span = document.createElement("SPAN");
        span.className = className;
        var record = {
            firstSpan: null,
            lastSpan: null
        };

        doCreate(range, record, function () {
            var newSpan = span.cloneNode(false);
            if (!record.firstSpan) {
                record.firstSpan = newSpan;
            }
            if (record.lastSpan) {
                record.lastSpan.nextSpan = newSpan;
            }
            record.lastSpan = newSpan;
            newSpan.firstSpan = record.firstSpan;
            return newSpan;
        });
        return record.firstSpan;
    };

    function doCreate(range, record, createWrapper) {
        if (range.collapsed) {
            return;
        }

        var startSide = range.startContainer, endSide = range.endContainer,
            ancestor = range.commonAncestorContainer, dirIsLeaf = true;

        if (range.endOffset === 0) {
            while (!endSide.previousSibling && endSide.parentNode !== ancestor) {
                endSide = endSide.parentNode;
            }

            endSide = endSide.previousSibling;
        } 
        else if (endSide.nodeType === Node.TEXT_NODE) {
            if (range.endOffset < endSide.nodeValue.length) {
                endSide.splitText(range.endOffset);
            }
        } 
        else if (range.endOffset > 0) {
            endSide = endSide.childNodes.item(range.endOffset - 1);
        }

        if (startSide.nodeType === Node.TEXT_NODE) {
            if (range.startOffset === startSide.nodeValue.length) {
                dirIsLeaf = false;
            } 
            else if (range.startOffset > 0) {
                startSide = startSide.splitText(range.startOffset);

                if (endSide === startSide.previousSibling) {
                    endSide = startSide;
                }
            }
        }
        else if (range.startOffset < startSide.childNodes.length) {
            startSide = startSide.childNodes.item(range.startOffset);
        }
        else {
            dirIsLeaf = false;
        }

        range.setStart(range.startContainer, 0);
        range.setEnd(range.startContainer, 0);

        var done = false, node = startSide;
        do {
            if (dirIsLeaf && node.nodeType === Node.TEXT_NODE && !(node.parentNode instanceof HTMLTableElement) &&
                !(node.parentNode instanceof HTMLTableRowElement) && !(node.parentNode instanceof HTMLTableColElement) &&
                !(node.parentNode instanceof HTMLTableSectionElement)) {
                var wrap = node.previousSibling;
                if (!wrap || wrap !== record.lastSpan) {
                    wrap = createWrapper(node);
                    node.parentNode.insertBefore(wrap, node);
                }
                wrap.appendChild(node);
                node = wrap.lastChild;
                dirIsLeaf = false;
            }
            if (node === endSide && (!endSide.hasChildNodes() || !dirIsLeaf)) {
                done = true;
            }
            if (node instanceof HTMLScriptElement ||
                    node instanceof HTMLStyleElement ||
                    node instanceof HTMLSelectElement) {
                dirIsLeaf = false;
            }
            if (dirIsLeaf && node.hasChildNodes()) {
                node = node.firstChild;
            } else if (node.nextSibling !== null) {
                node = node.nextSibling;
                dirIsLeaf = true;
            } else if (node.nextSibling === null) {
                node = node.parentNode;
                dirIsLeaf = false;
            }
        } while (!done);
    }