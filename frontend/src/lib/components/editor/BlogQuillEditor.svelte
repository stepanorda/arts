<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { getQuillInstance } from './quillInstance';
	import Block, { BlockEmbed } from 'quill/blots/block';

	export let editor, quill, body, onTextChange, onSelectionChange;
	let Quill;
	let lastChange;

	const dispatch = createEventDispatcher();

	function onKeydownEditor(e: KeyboardEvent) {
		if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
			const quill = getQuillInstance()
			const range = quill.getSelection();
			dispatch('buttonPlusHandler', range);
		}

		if (e.key === 'ArrowUp') {
			const quill = getQuillInstance()
			const range = quill.getSelection();
			if (range && range.index === 0) {
				e.preventDefault();
				dispatch('handleTitleFocus');
			}
		}

		if (['Backspace', 'Delete'].includes(e.key)) {
			const quill = getQuillInstance()
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

	

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={editor}
	on:keydown={onKeydownEditor}
	class="h-min text-xl font-serif margin-0"
/>
