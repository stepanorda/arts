import Quill from 'quill';
import { getQuillInstance } from './quillInstance';
import { Caption, Figure, ImageBlot } from './CustomBlots';
import Break from 'quill/blots/break';
import { buttonPlusHandler } from '$lib/components/editor/quillHandlers';

function enterHandler(range, context) {
	const quill = getQuillInstance();

	const [line] = quill.getLeaf(range.index);

	if (context.empty || context.suffix === '') {
		quill.insertText(range.index + 1, '\n');
		quill.setSelection(range.index + 1, 0);
		buttonPlusHandler({ index: range.index + 1 });
		return false;
	}

	// ------- HANDLE IN FIGURE  -----
	if (line.parent instanceof Caption) {
		if (line?.text?.length === context.offset || line instanceof Break) {
			quill.setSelection(range.index + 1, 0);
			quill.insertText(range.index + 1, '');
		}
		return false;
	}

	return true;
}

function deleteHandler(range, context) {
	const quill = getQuillInstance();

	if (context.line instanceof Caption && context.empty) {
		quill.setSelection(range.index - 1, 0);
		context.line.domNode.classList.add('hidden');
		return false;
	}

	if (context.empty && context.line instanceof ImageBlot) {
		const [line] = quill.getLeaf(range.index + 1);
		if (line.text) {
			quill.deleteText(range.index, line.text.length + 2);
		} else {
			quill.deleteText(range.index, 2);
		}
		return false;
	}

	if (context.empty && context.line.prev instanceof Figure) {
		context.line.prev.children.head.select();
		quill.setSelection(range.index - 1);
		return false;
	} else {
		return true;
	}
}

const bindings = {
	enter: {
		key: 'Enter',
		handler: enterHandler
	},
	delete: {
		key: 'Backspace',
		handler: deleteHandler
	},
	custom: {
		key: 'ArrowUp',
		handler: function (range, context) {
			if (context.line instanceof Caption) {
				const quill = getQuillInstance();
				const imgIndex = quill.getIndex(context.line.prev);
				console.log(imgIndex);
				quill.setSelection(imgIndex, 0);
				return false;
			}

			// if(range.index === 0) {
			// 	const quill = getQuillInstance();
			// 	quill.blur();

			// }

			console.log(range, context);

			// const [line] = quill.getLine(range.index);

			return true;
		}
	},

	custom2: {
		key: 'ArrowRight',
		handler: function (range, context) {
			if (context.line instanceof ImageBlot) {
				const quill = getQuillInstance();
				const captionIndex = quill.getIndex(context.line.next);
				console.log(captionIndex);
				quill.setSelection(captionIndex, 0);
				return false;
			}

			return true;
		}
	},

	custom3: {
		key: 'ArrowLeft',
		handler: function (range, context) {
			if (context.line instanceof Caption && context.offset === 0) {
				const quill = getQuillInstance();
				const imgIndex = quill.getIndex(context.line.prev);
				console.log(imgIndex);
				quill.setSelection(imgIndex, 0);
				return false;
			}

			return true;
		}
	}
};

const toolbarOptions = [
	{ header: 1 },
	{ header: 2 },
	'bold',
	'italic',
	'link',
	'blockquote',
	{ list: 'ordered' }
];

export function initializeQuill(editor) {
	return new Quill(editor, {
		modules: {
			toolbar: toolbarOptions,
			keyboard: {
				bindings: bindings
			}
		},
		placeholder: 'Tell your story...',
		theme: 'bubble'
	});
}
