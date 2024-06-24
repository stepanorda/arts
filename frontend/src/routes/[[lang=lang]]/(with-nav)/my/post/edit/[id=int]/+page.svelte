<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle, Photo } from '@steeze-ui/heroicons';

	const data = {
		title: 'Hello! This is Title',
		ops: [
			{ insert: 'Gandalf' },
			{ insert: '\n' },
			{
				insert:
					' the Description: Editor.js is a block-styled editor designed for clean data output in JSON. It is highly modular and suitable for creating editors with a modern look and feel.Features: Block-based structure, clean JSON output, extendable via plugins, focused on simplicity and performance.'
			},
			{ insert: 'Grey' },
			{ insert: 'The Two Towers' },
			{ insert: 'Aragorn sped on up the hill.\n' }
		]
	};
	let lastChange;
	let editor;
	let quill;
	$: displayPlus = false;
	$: displayTypeButtons = false;
	$: title = 'Hello! This is Title ';
	let titleTextArea;
	let buttonPosition = { top: 0, left: 0 };

	const dispatch = createEventDispatcher();

	function autoGrow(textArea) {
		textArea.style.height = '10px';
		textArea.style.height = `${textArea.scrollHeight}px`;
	}

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

		if (data.ops) {
			quill.setContents(data.ops);
		}

		const lines = quill.getLines();
		lines.forEach((line, index) => {
			if (data.ops[index] && data.ops[index].insert === '\n') {
				addMarginToEmptyLine(line);
			}
		});

		quill.on('text-change', (delta, oldDelta, source) => {
			displayPlus = false;
			displayTypeButtons = false;
			dispatch('textChange', { delta, oldDelta, source });
			checkForEmptyLines();
		});

		quill.on('selection-change', (range, oldRange, source) => {
			displayPlus = false;
			displayTypeButtons = false;
			if (range) {
				const [line, offset] = quill.getLine(range.index);
				if (line && line.domNode.textContent.trim() === '') {
					showButton(line);
				} else {
					hideButton();
				}
			}
		});

		autoGrow(titleTextArea);
	});

	function titleKeyDown(e: KeyboardEvent) {
		// if ( e.key === 'ArrowDown') {
		//   e.preventDefault();

		//   // Get the current cursor position in the title input
		//   const cursorPosition = (e.target as HTMLInputElement).selectionStart;

		//   // Focus the Quill editor
		//   quill.focus();

		//   // Get the first line of the editor
		//   const firstLine = quill.getLine(0);

		//   // Calculate the position to set the cursor in the editor
		//   let targetPosition = cursorPosition || 0;
		//   if (firstLine && firstLine[0].domNode.textContent.length < targetPosition) {
		//     targetPosition = firstLine[0].domNode.textContent.length;
		//   }

		//   // Set the cursor position in the editor
		//   quill.setSelection(targetPosition);

		// }

		// if (e.key === 'Enter') {
		//     e.preventDefault();

		//     const editorContent = quill.getContents();

		//     if (editorContent.length() === 1 && editorContent.ops[0].insert.trim() === '') {
		//         // The editor is empty, just focus the editor
		//         quill.focus();
		//     } else {
		//         // The editor has content, insert a new empty line at the beginning
		//         quill.insertText(0, '\n');
		//         quill.setSelection(0);
		//         quill.focus();
		//     }
		// }

		if (e.key === 'Enter') {
			e.preventDefault();

			const editorContent = quill.getContents();

			if (editorContent.length() === 1 && editorContent.ops[0].insert.trim() === '') {
				quill.focus();
			} else {
				// The editor has content, insert a new empty line at the beginning
				quill.insertText(0, '\n');

				// Move the cursor to the beginning of the editor
				quill.setSelection(0);
				quill.focus();
				// Focus the editor
			}
		}
	}

	function checkForEmptyLines() {
		const lines = quill.getLines();
		console.log('lines', lines);
		lines.forEach((line) => {
			if (line.domNode.textContent.trim() === '') {
				showButton(line);
				addMarginToEmptyLine(line);
			}
		});
	}

	// function checkForEmptyLines() {

	// 	const lines = quill.getLines();

	// 	lines.forEach((line, index) => {
	// 		if (line.domNode.textContent.trim() === '' && index !== 0) {
	// 			addMarginToEmptyLine(line);
	// 			console.log(line, index);
	// 		}
	// 	});
	// }

	function addMarginToEmptyLine(line) {
		console.log('addMarginToEmptyLine', line);
		line.domNode.style.marginTop = '21px';
	}

	function handleTextChange(event) {
		lastChange = event.detail.delta;
	}

	function showButton(line) {
		const rect = line.domNode.getBoundingClientRect();
		buttonPosition = { top: rect.top - 10, left: rect.left - 60 };
		displayPlus = true;
	}

	function hideButton() {
		displayPlus = false;
	}

	function toggleTypeButtons() {
		displayTypeButtons = !displayTypeButtons;
	}
</script>

<div class="  lg:mt-3 min-h-screen flex flex-col lg:mx-12 xl:ml-12 xl:mr-0">
	<div class="flex">
		<div class="w-0.5 bg-zinc-200"></div>
		<textarea
			on:keydown={titleKeyDown}
			on:input={() => autoGrow(titleTextArea)}
			class="border-0 p-3 focus:ring-0 text-xl sm:text-2xl lg:text-3xl w-full font-semibold font-serif placeholder:font-normal sm:max-xl:placeholder:text-center dark:bg-black dark:placeholder:text-zinc-400"
			name="title"
			placeholder="Title"
			bind:value={title}
			bind:this={titleTextArea}
		/>
	</div>

	<div bind:this={editor} on:change={handleTextChange} class="h-min text-xl font-serif" />

	{#if displayPlus}
		<div
			style="position: absolute; top: {buttonPosition.top}px; left: {buttonPosition.left}px;"
			class="flex gap-3"
		>
			<button class:rotate-45={displayTypeButtons} on:click={toggleTypeButtons}>
				<Icon src={PlusCircle} class="w-10 h-10  stroke-[0.5] " />
			</button>

			{#if displayTypeButtons}
				<button>
					<Icon src={Photo} class="w-10 h-10 stroke-[0.5]  " />
				</button>
			{/if}
		</div>
	{/if}
</div>

<div class="ql-toolbar"></div>
