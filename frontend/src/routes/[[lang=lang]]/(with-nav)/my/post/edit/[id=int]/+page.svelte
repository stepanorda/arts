<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle, Photo, Heart, ChatBubbleOvalLeft } from '@steeze-ui/heroicons';
	import BlogEditTitle from '$lib/components/input/BlogEditTitle.svelte';
	import ModalWindow from '$lib/components/atoms/ModalWindow.svelte';
	import FileUploader from '$lib/components/input/FileUploader.svelte';
	import type { PageData } from './$types';
	import BlogEditRow from '$lib/components/input/BlogEditRow.svelte';
	import { magicFetch } from '$lib/helpers/fetchData';
	import ActionButton from '$lib/components/forms/ActionButton.svelte';
	import InputGroup from '$lib/components/input/InputGroup.svelte';
	import { afterNavigate } from '$app/navigation';
	import type { Picture as PictureType } from '$lib/interfaces/Picture';
	import DateInput from '$lib/components/input/DateInput.svelte';
	import { getContext } from 'svelte';
	import { availableLocales, localePath } from '$lib/translations';
	import FormGroup from '$lib/components/input/FormGroup.svelte';
	import LanguageSelect from '$lib/components/input/LanguageSelect.svelte';
	import { imageEditorOptions } from '$lib/helpers/transloadit';
	import Picture from '$lib/components/atoms/Picture.svelte';
	import ArticlePreview from '$lib/components/post/ArticlePreview.svelte';
	import AvatarLink from '$lib/components/atoms/AvatarLink.svelte';
	import LocaleDate from '$lib/components/atoms/LocaleDate.svelte';

	export let data;

	data = {
		...data,

		body: [
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
			{
				insert: { image: 'https://picsum.photos/id/237/600/400',  },
				attributes: { alt: 'Funny Dog' }
			},
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

	let t = getContext('t');
	let locale = getContext('locale');
	const maxDate = new Date(Date.now() + 60 * 60 * 24 * 60 * 1000).toISOString().split('T')[0];

	let body = [],
		title: string,
		published_at: Date,
		language: availableLocales,
		image: PictureType | null;

	({ body, title, published_at, language, image } = data.post);
	published_at = published_at?.toISOString().split('T')[0];
	afterNavigate(() => {
		({ body, title, published_at, language, image } = data.post);
		published_at = published_at?.toISOString().split('T')[0];
	});

	let showFinalData = false;
	let lastChange;
	let editor: any;
	let quill: any;
	$: displayPlus = false;
	$: displayTypeButtons = false;
	let titleValue = data.title;
	let titleEl: HTMLInputElement;
	let buttonPosition = { top: 0, left: 0 };
	let uploadImage: number | undefined;
	let onPublish = false;
	let errors;

	onMount(async () => {
		const { default: Quill } = await import('quill');

		quill = new Quill(editor, {
			modules: {
				toolbar: toolbarOptions,
			
			},
			placeholder: 'Tell your story...',
			theme: 'bubble'
		});

		if (data.body) {
			quill.setContents(data.body);
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

		quill.on('selection-change', (range: { index: number }) => {
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
	function toggleTypeButtons() {
		displayTypeButtons = !displayTypeButtons;
	}

	const addMarginTopOnMount = () => {
		const lines = quill.getLines();
		lines.forEach((line: { domNode: HTMLBodyElement }) => {
			addMargin(line);
		});
	};

	function addMargin(line: { domNode: HTMLBodyElement }) {
		const lineDom = line.domNode;
		lineDom.style.paddingTop = '10px';
		lineDom.style.paddingBottom = '10px';
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
		if (e.key === 'ArrowDown') {
			const titleElement = e.target as HTMLInputElement;
			const isLastLine = titleElement.selectionStart === titleElement.value.length;

			if (isLastLine) {
				e.preventDefault();
				quill.setSelection(0);
				quill.focus();
			}
		}
	}

	function handleTextChange(e: KeyboardEvent) {
		lastChange = e.detail.delta;
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

	function hideButton() {
		displayPlus = false;
		displayTypeButtons = false;
	}

	function getData() {
		delta = quill.getContents();
		console.log(delta);
		showFinalData = true;
	}

	async function addImageTest() {
		// const image = `temp/${detail[0].file}`;

		// const result = await magicFetch('POST', '/api/image', {
		// 	imageable_id: "70",
		// 	imageable_type: 'post',
		// 	folder: 'posts',
		// 	images: [image]
		// });
		const url = 'https://picsum.photos/id/237/200/300';

		const range = quill.getSelection();
		if (range) {
			const [selectedLine] = quill.getLine(range.index);
			const lineIndex = quill.getIndex(selectedLine);
			quill.insertEmbed(lineIndex, 'image', url);
		}

		// uploadImage = undefined;
		// body[uploadImage] = {
		// 	type: 'image',
		// 	image_id: result[0].id
		// };}
		// const range = quill.getSelection();
		// if (range) {
		// 	const [selectedLine] = quill.getLine(range.index);
		// 	const lineIndex = quill.getIndex(selectedLine);
		// 	quill.insertText(lineIndex, image);
		// }
	}

	async function save() {
		console.log('sending data');
	}
</script>

<!-- <button type="button" class="  text-center" on:click={getData}>Save </button>

{#if showFinalData}
	`
	<div>${JSON.stringify(delta.ops, null, 2)}</div>
	`
{/if} -->

<div class="  lg:mt-3 min-h-screen flex flex-col lg:mx-12 xl:ml-12 xl:mr-0 mb-12">
	<BlogEditTitle bind:titleValue on:keydown={titleKeyDown} bind:titleEl />

	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={editor}
		on:change={handleTextChange}
		on:keydown={onKeydownEditor}
		class="h-min text-xl font-serif margin-0"
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
				<button class="w-full" on:click={() => addImageTest()}>
					<Icon src={Photo} class="w-10 h-10 stroke-[0.5]  " />
				</button>
			{/if}
		</div>
	{/if}
</div>
<div class=" fixed bottom-0 right-0 space-x-2.5 pr-6 text-sm pb-3 bg-white max-xl:w-full text-end">
	<button class="px-2.5 py-0.5 border"> Save </button>
	<button class="px-2.5 py-0.5 bg-emerald-600 text-white" on:click={() => (onPublish = true)}
		>Publish</button
	>
</div>

<!-- <div class="ql-toolbar"></div> -->

<ModalWindow
	open={uploadImage !== undefined}
	on:close={() => (uploadImage = undefined)}
	class="w-auto"
>
	<FileUploader {...data.transloadit} maxNumberOfFiles={1} on:complete={uploadComplete} />
</ModalWindow>

<ModalWindow
	open={onPublish}
	on:close={() => (uploadImage = undefined)}
	class="w-3/4  bg-zinc-50   my-12"
>
	<div class="flex flex-col items-center gap-12 p-12">
		<div class=" ">
			<div class="text-xl font-bold text-start pb-6 rounded-sm mb-9 border-b">Story preview</div>
			<div class="py-6 border-b">
				<div class="flex items-center gap-3 mb-4 text-sm">
					<AvatarLink user={data.post.owner} withName size={'w-6 h-6'} nameStyles="font-medium" />

					<div class="flex items-center gap-2 text-zinc-500 dark:text-zinc-100 text-xs">
						<div class="h-0.5 w-0.5 bg-gray-400 rounded-full" />
						<LocaleDate date={data.post?.published_at} />
					</div>
				</div>
				<div>
					<a
						href={localePath($locale, `/post/${data.post.id}`)}
						class="flex overflow-hidden items-start justify-between gap-3 sm:gap-6 md:gap-12"
					>
						<div>
							<div class="line-clamp-3 sm:line-clamp-5">
								<h3 class="text-xl font-semibold leading-6">
									<!-- {data.post.title} -->
									How to Sell Art Like the Galleries Directly to collectors. How to Sell Art Like the
									Galleries Directly to collectors.
								</h3>
								<!-- eslint-disable svelte/no-at-html-tags -->
								<p class=" mt-2 xl:mt-3 text-sm leading-6 text-gray-600 dark:text-zinc-300">
									<!-- {@html data.body} -->
									Hello, you have reached your teenager’s customer help line. If you know your party’s
									extension, please dial it now. “You don’t have an extension.
								</p>
							</div>
							<div class="flex items-center justify-between mt-6">
								<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-white">
									<div class="flex items-center gap-1">
										<Icon src={Heart} class="h-4 w-4 stroke-1" />
										<span>1</span>
									</div>
									<div class="flex items-center gap-1">
										<Icon src={ChatBubbleOvalLeft} class="h-4 w-4 stroke-1" />
										<span>1</span>
									</div>
								</div>
							</div>
						</div>

						<div class="w-20 h-20 sm:w-24 sm:h-32 md:w-56 aspect-1 shrink-0 bg-zinc-100">
							{#if data.post.image}
								<Picture
									alt={data.post.title}
									class="object-cover aspect-1"
									photo={data.post.image}
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center p-6">
									Include a high-quality image in your story to make it more inviting to readers.
								</div>
							{/if}
						</div>
					</a>

					<!-- <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-white">
				<Icon src={Bookmark} class="xl:h-5 xl:w-5 w-6 h-6  " />
				<Icon src={EllipsisHorizontalCircle} class="w-6 h-6 xl:h-5 xl:w-5" />
			</div> -->
				</div>
			</div>
		</div>

		<div class="mt-auto w-full">
			<div class=" max-sm:space-y-6 max-md:flex max-md:flex-col md:columns-3">
				<!-- <DateInput bind:value={published_at} min={published_at} max={maxDate} name="published_at" /> -->
				<button
					class="block w-full border border-zinc-600 text-black rounded-sm px-3 py-2 text-sm font-semibold shadow-sm"
				>
					Запланувати
				</button>
				<LanguageSelect bind:value={language} />

				<ActionButton class="block w-full bg-blue-600 hover:bg-blue-500" on:click={save}>
					{$t('global.buttons.save')}
				</ActionButton>
			</div>
		</div>
	</div>
</ModalWindow>
