<script lang="ts">
	import { browser } from '$app/environment';
  import type { PageData } from './$types';
	import { onMount, createEventDispatcher } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle, Photo, Camera, Trash } from '@steeze-ui/heroicons';






	const data = [
		{ insert: 'Gandalf', attributes: { bold: true } },
		{ insert: ' the ' },
		{ insert: 'Grey', attributes: { color: '#cccccc' } },
		{ insert: 'The Two Towers' },
		{ insert: '\n', attributes: { header: 1 } },
		{ insert: 'Aragorn sped on up the hill.\n' }
	];

	let lastChange;
	let editor;
	let quill;
	let displayTypeButtons = false;
	let buttonPosition = { top: 0, left: 0 };

	const dispatch = createEventDispatcher();

	onMount(async () => {
		const { default: Quill } = await import('quill');
		quill = new Quill(editor, {
			modules: {
				toolbar: [
					[{ header: [2, false] }, 'bold', 'italic', 'link', 'blockquote', { list: 'ordered' }]
				]
			},
			placeholder: 'Tell your story...',
			theme: 'bubble'
		});

		if (data) {
			quill.setContents(data);
		}
		quill.on('text-change', (delta, oldDelta, source) => {
			dispatch('textChange', { delta, oldDelta, source });
			checkForEmptyLines();
		});

		quill.on('selection-change', (range, oldRange, source) => {
			if (range) {
				const [line, offset] = quill.getLine(range.index);
				if (line && line.domNode.textContent.trim() === '') {
					console.log(true);
					addMarginToEmptyLine(line);
				}
			}
		});

		quill.on('selection-change', (range, oldRange, source) => {
			if (range) {
				const [line, offset] = quill.getLine(range.index);
				if (line && line.domNode.textContent.trim() === '') {
					showButton(line);
				} else {
					hideButton();
				}
			} else {
				hideButton();
			}
		});

	});

	function checkForEmptyLines() {
		const lines = quill.getLines();
		lines.forEach((line) => {
			if (line.domNode.textContent.trim() === '') {
				console.log(true);
				addMarginToEmptyLine(line);
				showButton(line);
			}
		});
	}

	function addMarginToEmptyLine(line) {
		line.domNode.style.marginTop = '30px';
		line.domNode.style.marginBottom = '30px';
	}

	function handleTextChange(event) {
		lastChange = event.detail.delta;
	}

	function showButton(line) {
		const rect = line.domNode.getBoundingClientRect();
		buttonPosition = { top: rect.top, left: rect.left };
		displayTypeButtons = true;
	}

	function hideButton() {
		displayTypeButtons = false;
	}

	function toggleTypeButtons() {
		displayTypeButtons = !displayTypeButtons;
	}
</script>

<div class="ql-toolbar"></div>
<div class=" lg:mt-3 min-h-screen flex flex-col lg:mx-12 xl:ml-6 xl:mr-0">
	<div bind:this={editor} on:change={handleTextChange} />

	{#if displayTypeButtons}
		<button
			on:click={toggleTypeButtons}
			style="position: absolute; top: {buttonPosition.top}px; left: }px;"
		>
			<Icon src={PlusCircle} class="w-8 h-8 xs:w-10 xs:h-10 stroke-[0.7] mt-1" />
		</button>
	{/if}
</div>
