import Block, { BlockEmbed } from 'quill/blots/block';
import Container from 'quill/blots/container';
import Quill from 'quill';
import { getQuillInstance } from './quillInstance';


class Figure extends Container {
	static blotName = 'parent';
	static tagName = 'figure';
	static className = 'parent';

	static create(value) {
		let node = super.create();
		node.setAttribute('data-selected', true);
		return node;
	}

	static value(node) {
		return node;
	}
}

class ImageBlot extends BlockEmbed {
	static blotName = 'image';
	static tagName = 'img';

	constructor(domNode, value) {
		super(domNode, value);
		this._selected = false;
		this.domNode.addEventListener('click', this.select.bind(this));
	}

	static create(value) {
		let node = super.create();
		node.setAttribute('src', value.src);
		node.setAttribute('class', 'hover:ring-2 hover:ring-red-500');
		return node;
	}

	static value(node) {
		return {
			src: node.getAttribute('src')
		};
	}

	get selected() {
		return this._selected;
	}

	set selected(value) {
		console.log('new selected', value);
		this._selected = value;
		console.log('trigered');
		this.updateSelection();
	}

	select() {
		const quillInstance = getQuillInstance();

		const index = this.offset(this.scroll);
		quillInstance.setSelection(index, 0, Quill.sources.USER);

		this.selected = true;
		this.next?.domNode.classList.remove('hidden');
	}

	updateSelection() {
		if (!this.selected && this.next?.domNode.textContent.trim() === '') {
			this.next?.domNode.classList.add('hidden');
		}
	}
}

class Caption extends Block {
	static blotName = 'caption';
	static tagName = 'figcaption';

	constructor(domNode, value) {
		super(domNode, value);
		this.checkForEmpty();
		this.addClassList();
	}

	static create(value) {
		let node = super.create();
		node.setAttribute('contenteditable', 'true');
		node.setAttribute('placeholder', 'Type Something...');
		node.setAttribute('data-selected', value.selected || false);

		return node;
	}

	// static value(node) {
	// 	return node.textContent;
	// }

	addClassList() {
		let selected = this.domNode.dataset.selected === 'true';

		if (this.domNode.textContent.trim() != '' || selected) {
			this.domNode.classList.remove('hidden');
		} else {
			this.domNode.classList.add('hidden');
		}
	}

	checkForEmpty() {
		if (this.domNode.textContent.trim() === '') {
			this.domNode.classList.add('empty');
		} else {
			this.domNode.classList.remove('empty');
		}
	}

	update(mutations, context) {
		super.update(mutations, context);
		this.checkForEmpty();
		// this.addClassList();
	}

	insertAt(index, value, def) {
		super.insertAt(index, value, def);
		this.checkForEmpty();
		this.addClassList();
	}

	deleteAt(index, length) {
		super.deleteAt(index, length);
		this.checkForEmpty();
		// this.addClassList();
	}

	formatAt(index, length, format, value) {
		super.formatAt(index, length, format, value);
		this.checkForEmpty();
		// this.addClassList();
	}

	static formats(node) {
		return true;
	}
}

Figure.allowedChildren = [ImageBlot, Caption];
ImageBlot.requiredContainer = Figure;
Caption.requiredContainer = Figure;

export { Figure, ImageBlot, Caption };
