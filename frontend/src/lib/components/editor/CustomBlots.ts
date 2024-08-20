import Block, { BlockEmbed } from 'quill/blots/block';
import Container from 'quill/blots/container';
import Quill from 'quill';
import { getQuillInstance } from './quillInstance';

class Figure extends Container {
	static blotName = 'parent';
	static tagName = 'figure';
	static className = 'parent';
}

class ImageBlot extends BlockEmbed {
	static blotName = 'image';
	static tagName = 'img';

	constructor(domNode, value) {
		super(domNode, value);
		this._selected;
		this.onMount();
		this.domNode.addEventListener('click', this.onClick.bind(this));
	}

	static create(value) {
		let node = super.create();
		node.setAttribute('src', value.src);
		node.setAttribute('class', ' w-full h-auto');
		node.value = value;
		return node;
	}

	onMount() {
		const value = this.domNode.value;
		this.selected = value.selected || false;
	}

	onClick() {
		if (this.selected) return;

		const quill = getQuillInstance();
		const index = this.offset(this.scroll);
		quill.setSelection(index, 0, Quill.sources.USER);
		this.selected = true;
	}

	get selected() {
		return this._selected;
	}

	set selected(isSelected) {
		this._selected = isSelected;

		if (this._selected) {
			this.select();
		} else {
			this.unselect();
		}
	}

	select() {
		this.next?.domNode.classList.remove('hidden');
		this.domNode.classList.add('ring-green-600');

		const toolbar = this.getToolbar();
		toolbar.controls.forEach(([format, button]) => {
			if (['header', 'blockquote', 'list'].includes(format)) {
				button.style.display = 'none';
			}
		});
	}

	unselect() {
		if (this.next?.domNode.textContent.trim() === '') {
			this.next?.domNode.classList.add('hidden');
		}

		this.domNode.classList.remove('ring-green-600');

		const toolbar = this.getToolbar();
		toolbar.controls.forEach(([, button]) => {
			button.style.display = '';
		});
	}

	getToolbar() {
		const quill = getQuillInstance();
		return quill.getModule('toolbar');
	}

	static value(node) {
		return {
			src: node.getAttribute('src')
		};
	}
}

class Caption extends Block {
	static blotName = 'caption';
	static tagName = 'figcaption';

	constructor(domNode, value) {
		super(domNode, value);
		this._empty = false;
		this._visible;
		this.checkForEmpty();
		this.handleVisabitity();
	}

	static create(value) {
		let node = super.create();
		node.setAttribute('contenteditable', 'true');
		node.setAttribute('placeholder', 'Type caption for image (optional)');
		node.value = value;

		return node;
	}

	handleVisabitity() {
		const value = this.domNode.value;
		this._visible = value.visible || false;

		if (!this._empty || this._visible) {
			this.domNode.classList.remove('hidden');
		} else {
			this.domNode.classList.add('hidden');
		}
	}

	checkForEmpty() {
		if (this.domNode.textContent.trim() === '') {
			this.domNode.classList.add('empty');
			this._empty = true;
		} else {
			this.domNode.classList.remove('empty');
			this._empty = false;
		}
	}

	update(mutations, context) {
		super.update(mutations, context);
		this.checkForEmpty();
	}

	insertAt(index, value, def) {
		super.insertAt(index, value, def);
		this.checkForEmpty();
		this.handleVisabitity();
	}

	deleteAt(index, length) {
		super.deleteAt(index, length);
		this.checkForEmpty();
	}

	formatAt(index, length, format, value) {
		super.formatAt(index, length, format, value);
		this.checkForEmpty();
	}

	static formats(node) {
		return true;
	}
}

Figure.allowedChildren = [ImageBlot, Caption];
ImageBlot.requiredContainer = Figure;
Caption.requiredContainer = Figure;

export { Figure, ImageBlot, Caption };
