<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import Block, { BlockEmbed } from 'quill/blots/block';
	import Container from 'quill/blots/container';

	export let editor, quill, body, onTextChange, onSelectionChange, addPadding;
	let Quill;
	let lastChange;
	

	const bindings = {
		tab: {
			key: 'Enter',
			handler: function (range, context) {
				const [line] = quill.getLine(range.index);

				let length = context.prefix + context.suffix;

				// Cursor is at the beginning or in the middle of the line
				if (line.domNode.dataset.caption === 'true') {
					if (length.length === context.offset) {
						console.log('hello');
						quill.insertEmbed(range.index + 1, '', null);
						quill.setSelection(range.index + 1, 0);
						return false;
					} else {
						return false;
					}
				} else {
					return true;
				}
			}
		}
	};

	class Figure extends Container {
		static blotName = 'figure-container';
		static tagName = 'figure';
	}

	class Caption extends Block {
		static blotName = 'caption';
		static tagName = 'figcaption';
		static className = '';

		



		static create(value: string) {
			console.log(value);
			const node = super.create() as HTMLElement;
			node.setAttribute('data-caption', 'true');
			
			let defaultValue = 'Type caption...'

			node.addEventListener('click', (e) => {
				e.stopImmediatePropagation();
				console.log('click');
			});
			return node;
		}

		static value(node) {
			
			return {value: 'Hello'}
		}
	}

	class Image extends BlockEmbed {
		static blotName = 'image-l';
		static tagName = 'img';
		static className = '';

		static create(value: string) {
			const node = super.create() as HTMLElement;
			node.setAttribute('src', value.src);
			node.setAttribute('alt', value.alt);
			node.setAttribute('class', 'bg-green-500 hover:ring-2 hover:ring-blue-600');
			node.addEventListener('click', (e) => {
				e.stopImmediatePropagation();
				console.log('click');
			});
			return node;
		}

		static value(node) {
			return {
				src: node.getAttribute('src'),
				alt: node.getAttribute('alt')
			};
		}
	}

	Figure.allowedChildren = [Caption, Image];
	Image.requiredContainer = Figure;
	Caption.requiredContainer = Figure;

	const dispatch = createEventDispatcher();

	const toolbarOptions = [
		{ header: [2, false] },
		'bold',
		'italic',
		'link',
		'blockquote',
		{ list: 'ordered' }
	];

	onMount(async () => {
		Quill = (await import('quill')).default;
		Quill.register(Figure);
		Quill.register(Image);
		Quill.register(Caption);

		quill = new Quill(editor, {
			modules: {
				toolbar: toolbarOptions,
				keyboard: {
					bindings: bindings
				}
			},
			placeholder: 'Tell your story...',
			theme: 'bubble'
		});

		if (body.ops) {
			quill.setContents(body.ops);
		}

		addPaddingpOnMount();
		quill.on('text-change', onTextChange);
		quill.on('selection-change', onSelectionChange);

		const updateButtonPosition = () => {
			const range = quill.getSelection();
			dispatch('buttonPlusHandler', range);
		};

		window.addEventListener('scroll', updateButtonPosition);
		window.addEventListener('resize', updateButtonPosition);

		return () => {
			window.removeEventListener('scroll', updateButtonPosition);
			window.removeEventListener('resize', updateButtonPosition);
		};
	});

	function onKeydownEditor(e: KeyboardEvent) {
		if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
			const range = quill.getSelection();
			dispatch('buttonPlusHandler', range);
		}

		if (e.key === 'ArrowUp') {
			const range = quill.getSelection();
			if (range && range.index === 0) {
				e.preventDefault();
				dispatch('handleTitleFocus');
			}
		}

		if (['Backspace', 'Delete'].includes(e.key)) {
			const range = quill.getSelection();
			if (range && range.index === 0) {
				e.preventDefault();
				const [line] = quill.getLine(range.index);
				if (line && line.domNode.textContent.trim() === '') {
					editor.addEventListener('keydown', onBackspaceAtFirstLine);
				} else {
					editor.removeEventListener('keydown', onBackspaceAtFirstLine);
				}
			}
		}
	}

	function onBackspaceAtFirstLine(e: KeyboardEvent) {
		if (e.key === 'Backspace') {
			e.preventDefault();
			quill.deleteText(0, 1);
			dispatch('handleTitleFocus');
			editor.removeEventListener('keydown', onBackspaceAtFirstLine);
		}
	}

	const addPaddingpOnMount = () => {
		const lines = quill.getLines();

		lines.forEach((line: { domNode: HTMLBodyElement }) => {
			const blot = Quill.find(line.domNode);
			const blotName = blot?.constructor?.blotName;
			if (blotName === 'block') {
				addPadding(line);
			}
		});
	};

	function handleTextChange(e) {
		lastChange = e.detail.delta;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={editor}
	on:change={handleTextChange}
	on:keydown={onKeydownEditor}
	class="h-min text-xl font-serif margin-0"
/>
