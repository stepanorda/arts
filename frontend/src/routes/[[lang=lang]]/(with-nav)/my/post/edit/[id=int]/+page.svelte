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
	import BlogQuillEditor from '$lib/components/editor/BlogQuillEditor.svelte';
	import OptionButtonsGroup from '$lib/components/editor/OptionButtonsGroup.svelte';

	export let data;

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
	let editor: any;
	let quill: any;
	$: displayPlus = false;
	$: displayTypeButtons = false;
	let titleEl: HTMLInputElement;
	let buttonPosition = { top: 0, left: 0 };
	let uploadImage: number | undefined;
	let onPublish = false;
	let delta;
	let selectedImage = null;
	let imageOptionsVisible = false;
	let imageOptionsPosition = { top: 0, left: 0 };

	function onTextChange() {
		displayPlus = false;
		buttonPosition = { top: 0, left: 0 };

		const range = quill.getSelection();
		if (range) {
			const [line] = quill.getLine(range.index);
			addPadding(line);
		}
	}

	function onSelectionChange(range: { index: number }) {
		displayPlus = false;
		buttonPosition = { top: 0, left: 0 };
		buttonPlusHandler(range);

		if (range) {
			const [line] = quill.getLine(range.index);
			if (line && line.domNode.querySelector('img')) {
				showImageOptions(line.domNode.querySelector('img'));
			} else {
				imageOptionsVisible = false;
			}
		}
	}

	function showImageOptions(image) {
		selectedImage = image;
		const rect = image.getBoundingClientRect();
		imageOptionsPosition = { top: rect.top - 30, left: rect.left };
		imageOptionsVisible = true;
	}

	function resizeImage(width) {
		if (selectedImage) {
			selectedImage.style.width = width;
			selectedImage.style.margin = '0 auto';
		}
		imageOptionsVisible = false;
	}

	function handleTitleFocus() {
		titleEl.focus();
		titleEl.setSelectionRange(titleEl.value.length, titleEl.value.length);
	}

	function addPadding(line: { domNode: HTMLBodyElement }) {
		const lineDom = line.domNode;
		lineDom.style.paddingTop = '10px';
		lineDom.style.paddingBottom = '10px';
	}

	function buttonPlusHandler(range) {
		if (range) {
			if (range.type === 'buttonPlusHandler') {
				range = range.detail;
			}

			const [line] = quill.getLine(range?.index);
			if (line && line.domNode.textContent.trim() === '') {
				showButton(line);
			} else {
				hideButton();
			}
		}
	}

	function showButton(line: { domNode: HTMLBodyElement }) {
		displayTypeButtons = false;
		const rect = line.domNode.getBoundingClientRect();
		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

		buttonPosition = {
			top: rect.top + scrollTop,
			left: rect.left + scrollLeft - 60
		};
		displayPlus = true;
	}

	function hideButton() {
		displayPlus = false;
		displayTypeButtons = false;
	}

	function getDelta() {
		console.log('GetData');
		body = quill.getContents();
		showFinalData = true;
	}

	async function save() {
		console.log('saving');
		getDelta();
		const json = await magicFetch('PUT', localePath($locale, `/api/post/${data.post.id}`), {
			title,
			body,
			published_at,
			language,
			image_id: image?.id || undefined // It will have id only for newly uploaded
		});
		errors = json?.errors;
	}
</script>

<button type="button" class="  text-center" on:click={getDelta}>Save </button>

{#if showFinalData && body}
	`
	<div>${JSON.stringify(body, null, 2)}</div>
	`
{/if}

<div class="  lg:mt-3 min-h-screen flex flex-col lg:mx-12 xl:ml-12 xl:mr-0 mb-12">
	<BlogEditTitle bind:title bind:titleEl {quill} />
	<BlogQuillEditor
		bind:editor
		bind:quill
		bind:body={data.body}
		on:handleTitleFocus={handleTitleFocus}
		on:buttonPlusHandler={buttonPlusHandler}
		{onTextChange}
		{onSelectionChange}
		{addPadding}
	/>

	<OptionButtonsGroup bind:quill bind:buttonPosition bind:displayPlus bind:displayTypeButtons />

	{#if imageOptionsVisible}
		<div
			class="absolute"
			style="top: {imageOptionsPosition.top}px; left: {imageOptionsPosition.left}px;"
		>
			<button on:click={() => resizeImage('100%')}>Full Width</button>
			<button on:click={() => resizeImage('80%')}>80%</button>
			<button on:click={() => resizeImage('50%')}>50%</button>
		</div>
	{/if}
</div>
<div class=" fixed bottom-0 right-0 space-x-2.5 pr-6 text-sm pb-3 bg-white max-xl:w-full text-end">
	<button class="px-2.5 py-0.5 border" on:click={save}> Save </button>
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
	on:close={() => (onPublish = !onPublish)}
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
