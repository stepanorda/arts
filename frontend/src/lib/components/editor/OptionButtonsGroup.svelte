<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle } from '@steeze-ui/heroicons';
	import AddImageButtton from './AddImageButtton.svelte';

	export let buttonPosition, displayPlus, displayTypeButtons: boolean, quill;

	onMount(async () => {
		addImageTest('#image-button', () => {
			const range = quill.getSelection(true);
			quill.insertText(range.index, '\n');
			quill.insertEmbed(range.index + 1, 'image', {
				alt: 'Quill Cloud',
				url: 'https://picsum.photos/id/237/600/400'
			});
			quill.setSelection(range.index + 2);
		});
	});

	const addImageTest = (selector, callback) => {
		document.querySelector(selector).addEventListener('click', callback);
	};

	function toggleTypeButtons() {
		displayTypeButtons = !displayTypeButtons;
	}
</script>

<div
	style="position: absolute; top: {buttonPosition.top}px; left: {buttonPosition.left}px;"
	class=" gap-3 {displayPlus ? 'flex' : 'hidden'}"
>
	<button class:rotate-45={displayTypeButtons} on:click={toggleTypeButtons}>
		<Icon src={PlusCircle} class="w-10 h-10  stroke-[0.5] " />
	</button>

	<AddImageButtton bind:displayTypeButtons on:addImage />
</div>
