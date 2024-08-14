import Quill from 'quill';
import { getQuillInstance } from './quillInstance';
import { Caption, Figure, ImageBlot } from './CustomBlots';





const bindings = {
	enter: {
		key: 'Enter',
		handler: function (range, context) {
			const quill = getQuillInstance();
			const [line] = quill.getLeaf(range.index);
			if (line.parent instanceof Caption) {
				if (line.text.length === context.offset) {
					quill.setSelection(range.index + 1, 0);
					quill.insertText(range.index + 2, '');
					return false;
				} else {
					return false;
				}
			} else {
				return true;
			}
		}
	},
	delete: {
		key: 'Backspace',
		handler: function (range, context) {
			const quill = getQuillInstance();

			// if (context.empty && context.line instanceof ImageBlot) {

			// }

			if (context.empty && context.line instanceof ImageBlot) {
				const [line] = quill.getLeaf(range.index + 1);
				console.log(line);
				if (line.text) {
					quill.deleteText(range.index, line.text.length + 2);
					return false;
				} else {
                 
                    quill.deleteText(range.index, 2);
                    return false;
                }

			}

			// if (context.empty && context.line instanceof Caption) {
			// 	quill.setSelection(range.index - 1);
			// } else {
			// 	return true;
			// }

			if (context.empty && context.line.prev instanceof Figure) {
				context.line.prev.children.head.select();
				quill.setSelection(range.index - 1);
				return false;
			} else {
				return true;
			}
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
