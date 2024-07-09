<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	export let editor, quill, body, onTextChange, onSelectionChange, addPadding;

	let lastChange;
	let Quill;

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

		quill = new Quill(editor, {
			modules: {
				toolbar: toolbarOptions
			},
			placeholder: 'Tell your story...',
			theme: 'bubble'
		});

		const BlockEmbed = Quill.import('blots/block/embed');

		// Fixes the error "Overwriting formats/image"
		if (Quill.imports['formats/image']) {
			delete Quill.imports['formats/image'];
		}

		class ImageBlot extends BlockEmbed {
			static blotName = 'image';
			static tagName = 'img';

			static create(value) {
				let node = super.create();
				node.setAttribute('alt', value.alt);
				node.setAttribute('src', value.url);
				node.setAttribute(
					'class',
					' xl:w-2/3 mx-auto w-full hover:ring-4 hover:ring-green-500 p-0'
				);

				node.addEventListener('click', () => {
					console.log('Image clicked!');
				});
				return node;
			}

			static value(node) {
				return {
					alt: node.getAttribute('alt'),
					url: node.getAttribute('src'),
					class: node.getAttribute('class')
				};
			}
		}

		Quill.register(ImageBlot);

		if (body) {
			quill.setContents(body);
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
		console.log(lines);
		lines.forEach((line: { domNode: HTMLBodyElement }) => {
			const blot = Quill.find(line.domNode);
			const blotName = blot?.constructor?.blotName;
			console.log(blotName);
			if (blotName === 'block') {
				addPadding(line);
			} else {
				console.log('it is not BLOCK');
				// const lineDom = line.domNode;
				// lineDom.style.marginTop = '10px';
				// lineDom.style.marginBottom = '10px';
				// lineDom.removeAttribute("style")
			}
		});
	};

	function handleTextChange() {
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
