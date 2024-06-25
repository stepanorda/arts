<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle, Photo } from '@steeze-ui/heroicons';

	$: showFinalData = false;
	let delta;
	const data = {
		title: 'Hello! This is Title',
		ops: [
			{ insert: 'Gandalf' },
			{ insert: '\n' },
			{
				insert:
					' the Description: Editor.js is a block-styled editor designed for clean data output in JSON. It is highly modular and suitable for creating editors with a modern look and feel.Features: Block-based structure, clean JSON output, extendable via plugins, focused on simplicity and performance.'
			},
			{ insert: '\n' },
			{ insert: '\n' },
			{ insert: 'Grey' },
			{ insert: 'The Two Towers' },
			{ insert: 'Aragorn sped on up the hill.\n' }
		]
	};

	const toolbarOptions = [
		{ header: [2, false] },
		'bold',
		'italic',
		'link',
		'blockquote',
		{ list: 'ordered' }
	];

	let lastChange;
	let editor;
	let quill;
	$: displayPlus = false;
	$: displayTypeButtons = false;
	$: titleValue = 'Hello! This is Title ';
	let titleEl;
	let buttonPosition = { top: 0, left: 0 };

	onMount(async () => {
		const { default: Quill } = await import('quill');

		quill = new Quill(editor, {
			modules: {
				toolbar: toolbarOptions
			},
			placeholder: 'Tell your story...',
			theme: 'bubble'
		});

		if (data.ops) {
			quill.setContents(data.ops);
		}

		const addMarginTop = () => {
			const lines = quill.getLines();
			lines.forEach((line) => {
				const lineDom = line.domNode;
				lineDom.style.marginBottom = '21px';
			});
		};

		addMarginTop();

		quill.on('text-change', () => {
			displayPlus = false;
			buttonPosition = { top: 0, left: 0 };
			addMarginTop();
		});

		quill.on('selection-change', (range) => {
			displayPlus = false;
			buttonPosition = { top: 0, left: 0 };
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

		autoGrow(titleEl);

		const updateButtonPosition = () => {
			if (quill) {
				const range = quill.getSelection();
				if (range) {
					const [line, offset] = quill.getLine(range.index);
					if (line && line.domNode.textContent.trim() === '') {
						showButton(line);
					} else {
						hideButton();
					}
				}
			}
		};

		window.addEventListener('scroll', updateButtonPosition);
		window.addEventListener('resize', updateButtonPosition);

		return () => {
			window.removeEventListener('scroll', updateButtonPosition);
			window.removeEventListener('resize', updateButtonPosition);
		};
	});

	function titleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();

			const editorContent = quill.getContents();

			if (editorContent.length() === 1 && editorContent.ops[0].insert.trim() === '') {
				quill.focus();
			} else {
				quill.insertText(0, '\n');
				quill.setSelection(0);
				quill.focus();
			}
		}
	}



	function handleTextChange(event) {
		lastChange = event.detail.delta;
	}

	function showButton(line) {
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

	function hideButton() {
		displayPlus = false;
		displayTypeButtons = false;
	}

	function toggleTypeButtons() {
		displayTypeButtons = !displayTypeButtons;
	}

	function onKeydownEditor(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
			const range = quill.getSelection();
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
		}
	}

	function autoGrow(textArea) {
		textArea.style.height = '10px';
		textArea.style.height = `${textArea.scrollHeight}px`;
	}

	function getData() {
		delta = quill.getContents();
		console.log(delta);
		showFinalData = true;
	}

	function addImageTest(image) {
		const range = quill.getSelection();
		if (range) {
			const [selectedLine, offset] = quill.getLine(range.index);
			const lineIndex = quill.getIndex(selectedLine);
			quill.insertText(lineIndex, image);
		}
	}
</script>

<button type="button" class=" bg-green-100 text-center" on:click={getData}>Save </button>

{#if showFinalData}
	`
	<div>${JSON.stringify(delta.ops, null, 2)}</div>
	`
{/if}

<div class="  lg:mt-3 min-h-screen flex flex-col lg:mx-12 xl:ml-12 xl:mr-0">
	<div class="flex">
		<div class="w-0.5 bg-zinc-200"></div>
		<textarea
			on:keydown={titleKeyDown}
			on:input={() => autoGrow(titleEl)}
			class="border-0 p-3 focus:ring-0 text-xl sm:text-2xl lg:text-3xl w-full font-semibold font-serif placeholder:font-normal sm:max-xl:placeholder:text-center dark:bg-black dark:placeholder:text-zinc-400"
			name="title"
			placeholder="Title"
			bind:value={titleValue}
			bind:this={titleEl}
		/>
	</div>

	<div
		bind:this={editor}
		on:change={handleTextChange}
		on:keydown={onKeydownEditor}
		class="h-min text-xl font-serif bg-red-100 divide-x-2"
	/>

	{#if displayPlus}
		<div
			style="position: absolute; top: {buttonPosition.top}px; left: {buttonPosition.left}px;"
			class="flex gap-3"
		>
			<button class:rotate-45={displayTypeButtons} on:click={toggleTypeButtons}>
				<Icon src={PlusCircle} class="w-10 h-10  stroke-[0.5] " />
			</button>

			{#if displayTypeButtons}
				<button
					class="w-full bg-blue-200"
					on:click={() => addImageTest('Lets imagine this is Image')}
				>
					<Icon src={Photo} class="w-10 h-10 stroke-[0.5]  " />
				</button>
			{/if}
		</div>
	{/if}
</div>

<div class="ql-toolbar"></div>
