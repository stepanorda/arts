<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { setQuillInstance } from './quillInstance';
	import Block, { BlockEmbed } from 'quill/blots/block';

	export let editor, quill, body, onTextChange, onSelectionChange, addPadding;
	let Quill;
	let lastChange;

	const dispatch = createEventDispatcher();

	onMount(async () => {
		Quill = (await import('quill')).default;
		const { Figure, ImageBlot, Caption } = await import('./CustomBlots');
		Quill.register(Figure, true);
		Quill.register(ImageBlot, true);
		Quill.register(Caption, true);

		const { initializeQuill } = await import('./initializeQuill');

		quill = initializeQuill(editor);
		setQuillInstance(quill);

		if (body.ops) {
			quill.setContents(body.ops);
		}

		// addPaddingpOnMount();
		quill.on('text-change', onTextChange);
		quill.on('selection-change', onSelectionChange);

	

		quill.on('selection-change', (range, oldRange, source) => {
			if (range) {
				const [currentLine] = quill.getLine(range.index);
				const [oldLine] = quill.getLine(oldRange?.index);
				const isCaption = currentLine instanceof Caption;
				const toolbar = quill.getModule('toolbar');

				if (currentLine.parent instanceof Figure && !currentLine.parent.children.head.selected) {
					currentLine.parent.children.head.selected = true;
					// console.log('selected');
				}

				if (oldLine.parent instanceof Figure) {
					if (currentLine instanceof Caption) return;
					if (currentLine instanceof ImageBlot) return;
					oldLine.parent.children.head.selected = false;
					console.log('unselected', oldLine);
				}

				// if (currentLine.parent instanceof Figure) {
				// 	currentLine.parent.children.head.selected = true;
				// }

				// if (oldLine instanceof Caption && !isCaption) {
				// 	toolbar.controls.forEach((control) => {
				// 		const format = control[0];
				// 		const button = control[1];

				// 		if (['header', 'blockquote', 'list'].includes(format)) {
				// 			button.style.display = 'none';
				// 		}
				// 	});
				// }

				// if (currentLine instanceof Caption) {
				// 	if (range.length > 0) {
				// 		toolbar.controls.filter((control) => {
				// 			const format = control[0];
				// 			const button = control[1];

				// 			if (['header', 'blockquote', 'list'].includes(format)) {
				// 				button.style.display = 'none';
				// 			}
				// 		});
				// 	}
				// }

				// if (oldRange) {

				// 	const [oldLine] = quill.getLine(oldRange.index);

				// 	const isImageBlot = currentLine instanceof ImageBlot;
				// 	const isCaption = currentLine instanceof Caption;

				// 	const currentIndex = currentLine.parent.offset(currentLine.parent.scroll);
				// 	const oldLineIndex = oldLine.parent.offset(oldLine.parent.scroll);

				// 	// if (oldLine.parent instanceof Figure && currentIndex != oldLineIndex) {
				// 	// 	oldLine.parent.children.head.selected = false;

				// 	// 	toolbar.controls.forEach((control) => {
				// 	// 		const button = control[1];
				// 	// 		button.style.display = '';
				// 	// 	});
				// 	// }

				// 	// if (oldLine instanceof ImageBlot && !isCaption) {
				// 	// 	oldLine.selected = false;
				// 	// }

				// 	// if (
				// 	// 	oldLine instanceof Caption &&
				// 	// 	!isImageBlot &&
				// 	// 	!isCaption &&
				// 	// 	oldLine.domNode.textContent === ''
				// 	// ) {
				// 	// 	if (oldLine.prev instanceof ImageBlot) oldLine.prev.selected = false;
				// 	// }
				// }
			}
		});

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
		// lastChange = e.detail.delta;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={editor}
	on:change={handleTextChange}
	on:keydown={onKeydownEditor}
	class="h-min text-xl font-serif margin-0"
/>
