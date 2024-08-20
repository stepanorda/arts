<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle } from '@steeze-ui/heroicons';
	import AddImageButtton from './AddImageButtton.svelte';
	import { getQuillInstance } from '$lib/components/editor/quillInstance';
	import { buttonPosition, displayPlus, displayTypeButtons } from '$lib/stores/plusButtonEditor';

	onMount(async () => {
		addImageTest('#image-button', () => {
			const imageContainerData = {
				src: 'https://picsum.photos/id/237/600/400',
				alt: 'Quill Cloud',
				selected: true
			};

			const quill = getQuillInstance();

			const range = quill.getSelection();
			quill.insertEmbed(range.index, 'image', imageContainerData);
			quill.setSelection(range.index + 1);

			quill.format('caption', { visible: true });
			quill.setSelection(range.index);

			quill.insertText(range.index + 3, '', 'silent');
		});
	});

	const addImageTest = (selector, callback) => {
		document.querySelector(selector).addEventListener('click', callback);
	};

	function toggleTypeButtons() {
		displayTypeButtons.set(!$displayTypeButtons);
	}
</script>

<div
	style="position: absolute; top: {$buttonPosition.top}px; left: {$buttonPosition.left}px;"
	class="gap-3 {$displayPlus ? 'flex' : 'hidden'}"
>
	<button class:rotate-45={$displayTypeButtons} on:click={toggleTypeButtons}>
		<Icon src={PlusCircle} class="w-10 h-10 stroke-[0.5]" />
	</button>

	<AddImageButtton bind:displayTypeButtons={$displayTypeButtons} on:addImage />
</div>
