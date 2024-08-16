import { getQuillInstance } from './quillInstance';
import { Caption, Figure, ImageBlot } from './CustomBlots';
import { buttonPosition, displayPlus, displayTypeButtons } from '$lib/stores/plusButtonEditor';
import { get } from 'svelte/store';

export function onTextChange(delta, oldDelta, source) {
	const quill = getQuillInstance();
	const range = quill.getSelection();

	if (!range) return;
	buttonPlusHandler(range);

	const isNewlineInserted = delta?.ops?.[1]?.insert === '\n';

	if (isNewlineInserted) {
		buttonPlusHandler({ index: range.index + 1 });
	}
}

export function onSelectionChange(range, oldRange, source) {
	if (!range) return;
	buttonPlusHandler(range);

	handleFigureSelections(range, oldRange);
}

function handleFigureSelections(range, oldRange) {
	const quill = getQuillInstance();
	const [oldLine] = quill.getLine(oldRange?.index);
	const [currentLine] = quill.getLine(range.index);

	const currentImage = currentLine.parent.children.head;
	const oldImage = oldLine.parent.children.head;

	if (currentLine.parent instanceof Figure) {
		if (currentImage.selected) return;
		currentImage.selected = true;

		if (!oldRange) return;

		const currentFigureIndex = quill.getIndex(currentLine.parent);
		const oldFigureIndex = quill.getIndex(oldLine.parent);
		if (currentFigureIndex === oldFigureIndex) return;
		oldImage.selected = false;
	}

	if (oldLine.parent instanceof Figure) {
		if (currentLine instanceof ImageBlot) return;
		if (currentLine instanceof Caption) return;
		oldImage.selected = false;
	}
}

export function buttonPlusHandler(range) {
	if (range.type === 'buttonPlusHandler') {
		range = range.detail;
	}

	const quill = getQuillInstance();

	const [line] = quill.getLine(range?.index);

	if (line && line.domNode.textContent.trim() === '') {
		showButton(line);
	} else {
		hideButton();
	}
}

function showButton(line: { domNode: HTMLBodyElement }) {
	displayTypeButtons.set(false);

	const rect = line.domNode.getBoundingClientRect();
	const scrollTop = window.scrollY || document.documentElement.scrollTop;
	const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

	buttonPosition.set({
		top: rect.top + scrollTop,
		left: rect.left + scrollLeft - 60
	});
	displayPlus.set(true);
}

function hideButton() {
	displayPlus.set(false);
	displayTypeButtons.set(false);
}
