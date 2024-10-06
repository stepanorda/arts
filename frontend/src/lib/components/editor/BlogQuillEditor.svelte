<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { getQuillInstance } from './quillInstance';
	// import {buttonPlusHandler} from '$lib/components/editor/quillHandlers'
	import { displayPlus, displayTypeButtons } from '$lib/stores/plusButtonEditor';

	export let editor, body;

	const dispatch = createEventDispatcher();

	function onKeydownEditor(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') {
			const quill = getQuillInstance();
			const range = quill.getSelection();
			if (range && range.index === 0) {
				e.preventDefault();
				dispatch('handleTitleFocus');
				displayPlus.set(false);
				displayTypeButtons.set(false);
			}
		}

		if (['Backspace', 'Delete'].includes(e.key)) {
			const quill = getQuillInstance();
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
			const quill = getQuillInstance();
			quill.deleteText(0, 1);
			dispatch('handleTitleFocus');
			editor.removeEventListener('keydown', onBackspaceAtFirstLine);
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div bind:this={editor} on:keydown={onKeydownEditor} class="h-min text-xl font-serif margin-0" />
