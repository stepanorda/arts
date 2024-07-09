<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle, Photo } from '@steeze-ui/heroicons';

	export let quill, titleEl, editor: any, displayPlus: boolean;
	let buttonPosition = { top: 0, left: 0 };

	$: displayTypeButtons = false;

	let lastChange;

	function handleTextChange(e: KeyboardEvent) {
		lastChange = e.detail.delta;
	}

	function onKeydownEditor(e: KeyboardEvent) {
		if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
			const range = quill.getSelection();
			buttonPlusHandler(range);
		}

		if (e.key === 'ArrowUp') {
			const range = quill.getSelection();
			if (range && range.index === 0) {
				e.preventDefault();
				titleEl.focus();
				titleEl.setSelectionRange(titleEl.value.length, titleEl.value.length);
			}
		}

		if (['Backspace', 'Delete'].includes(e.key)) {
			const range = quill.getSelection();

			if (range && range.index === 0) {
				e.preventDefault();
				const [line, offset] = quill.getLine(range.index);
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
			titleEl.focus();
			titleEl.setSelectionRange(titleEl.value.length, titleEl.value.length);
			editor.removeEventListener('keydown', onBackspaceAtFirstLine);
		}
	}

	function buttonPlusHandler(range: { index: number }) {
		if (range) {
			const [line] = quill.getLine(range.index);
			if (line && line.domNode.textContent.trim() === '') {
				showButton(line);
			} else {
				hideButton();
			}
		}
	}

	function hideButton() {
		displayPlus = false;
		displayTypeButtons = false;
	}

	function showButton(line: { domNode: HTMLBodyElement }) {
		displayTypeButtons = false;
		const rect = line.domNode.getBoundingClientRect();
		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

		buttonPosition = {
			top: rect.top + scrollTop - 10,
			left: rect.left + scrollLeft - 60
		};
		displayPlus = true;
	}

	function toggleTypeButtons() {
		displayTypeButtons = !displayTypeButtons;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={editor}
	on:change={handleTextChange}
	on:keydown={onKeydownEditor}
	class="h-min text-xl font-serif margin-0"
/>

<div
	style="position: absolute; top: {buttonPosition.top}px; left: {buttonPosition.left}px;"
	class=" gap-3 {displayPlus ? 'flex' : 'hidden'}"
>
	<button class:rotate-45={displayTypeButtons} on:click={toggleTypeButtons}>
		<Icon src={PlusCircle} class="w-10 h-10  stroke-[0.5] " />
	</button>

	<button id="image-button" class="w-full {displayTypeButtons ? '' : 'hidden'}" on:addImage>
		<Icon src={Photo} class="w-10 h-10 stroke-[0.5]  " />
	</button>
</div>
