<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle, Photo } from '@steeze-ui/heroicons';
	import BlogEditTitle from '$lib/components/input/BlogEditTitle.svelte';

	$: showFinalData = false;
	let delta;
	const data = {
		title: 'Hello!Description: Editor.data output in JSON. It is highly modular and suitable for creating editors with a modtendable via plugins, focused on simplicity and performance.',
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
	$: titleValue = data.title;
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

		addMarginTopOnMount();

		quill.on('text-change', () => {
			displayPlus = false;
			buttonPosition = { top: 0, left: 0 };

			const range = quill.getSelection();
			if (range) {
				const [line] = quill.getLine(range.index);
				addMargin(line);
			}
		});

    
		quill.on('selection-change', (range) => {
			displayPlus = false;
			buttonPosition = { top: 0, left: 0 };
			buttonPlusHandler(range);
		});

		const updateButtonPosition = () => {
			const range = quill.getSelection();
			buttonPlusHandler(range);
		};

		window.addEventListener('scroll', updateButtonPosition);
		window.addEventListener('resize', updateButtonPosition);

		return () => {
			window.removeEventListener('scroll', updateButtonPosition);
			window.removeEventListener('resize', updateButtonPosition);
		};
	});

	const addMarginTopOnMount = () => {
		const lines = quill.getLines();
		lines.forEach((line) => {
			addMargin(line);
		});
	};

	function addMargin(line) {
		const lineDom = line.domNode;
		lineDom.style.paddingTop = '10px';
    lineDom.style.paddingBottom = '10px';
	}

	function buttonPlusHandler(range) {
		if (range) {
			const [line] = quill.getLine(range.index);
			if (line && line.domNode.textContent.trim() === '') {
				showButton(line);
			} else {
				hideButton();
			}
		}
	}

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
		if (['Enter', 'Backspace', 'Delete'].includes(e.key)) {
			const range = quill.getSelection();
			buttonPlusHandler(range);
		}
	}

	function getData() {
		delta = quill.getContents();
		console.log(delta);
		showFinalData = true;
	}

	function addImageTest(image) {
		const range = quill.getSelection();
		if (range) {
			const [selectedLine] = quill.getLine(range.index);
			const lineIndex = quill.getIndex(selectedLine);
			quill.insertText(lineIndex, image);
		}
	}
</script>

<button type="button" class="  text-center" on:click={getData}>Save </button>

{#if showFinalData}
	`
	<div>${JSON.stringify(delta.ops, null, 2)}</div>
	`
{/if}

<div class="  lg:mt-3 min-h-screen flex flex-col lg:mx-12 xl:ml-12 xl:mr-0">

	<BlogEditTitle bind:titleValue on:keydown={titleKeyDown} />

	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={editor}
		on:change={handleTextChange}
		on:keydown={onKeydownEditor}
		class="h-min text-xl font-serif  margin-0 "
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
					class="w-full "
					on:click={() => addImageTest('Lets imagine this is Image')}
				>
					<Icon src={Photo} class="w-10 h-10 stroke-[0.5]  " />
				</button>
			{/if}
		</div>
	{/if}
</div>

<div class="ql-toolbar"></div>


