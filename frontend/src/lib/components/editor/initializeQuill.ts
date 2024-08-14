import Quill from 'quill';
import { getQuillInstance } from './quillInstance';
import { Caption, Figure, ImageBlot } from './CustomBlots';
import Break from 'quill/blots/break';



function enterHandler(range, context) {

	const quill = getQuillInstance();

	const [line] = quill.getLeaf(range.index);


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
