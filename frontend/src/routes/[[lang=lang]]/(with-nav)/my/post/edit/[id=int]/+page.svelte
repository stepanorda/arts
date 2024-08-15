<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Heart, ChatBubbleOvalLeft } from '@steeze-ui/heroicons';
	import BlogEditTitle from '$lib/components/input/BlogEditTitle.svelte';
	import ModalWindow from '$lib/components/atoms/ModalWindow.svelte';
	import FileUploader from '$lib/components/input/FileUploader.svelte';
	import { magicFetch } from '$lib/helpers/fetchData';
	import ActionButton from '$lib/components/forms/ActionButton.svelte';
	import { afterNavigate } from '$app/navigation';
	import type { Picture as PictureType } from '$lib/interfaces/Picture';
	import DateInput from '$lib/components/input/DateInput.svelte';
	import { getContext } from 'svelte';
	import { availableLocales, localePath } from '$lib/translations';
	import LanguageSelect from '$lib/components/input/LanguageSelect.svelte';
	import Picture from '$lib/components/atoms/Picture.svelte';
	import AvatarLink from '$lib/components/atoms/AvatarLink.svelte';
	import LocaleDate from '$lib/components/atoms/LocaleDate.svelte';
	import BlogQuillEditor from '$lib/components/editor/BlogQuillEditor.svelte';
	import OptionButtonsGroup from '$lib/components/editor/OptionButtonsGroup.svelte';
	import { getQuillInstance } from '$lib/components/editor/quillInstance';
	import { createEventDispatcher } from 'svelte';
	import { setQuillInstance } from '$lib/components/editor/quillInstance';

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
	let titleEl: HTMLInputElement;
	let uploadImage: number | undefined;
	let onPublish = false;

	const dispatch = createEventDispatcher();

	onMount(async () => {
		const Quill = (await import('quill')).default;
		const { Figure, ImageBlot, Caption } = await import('$lib/components/editor/CustomBlots');
		const { onSelectionChange, onTextChange } = await import(
			'$lib/components/editor/quillHandlers'
		);
		const { initializeQuill } = await import('$lib/components/editor/initializeQuill');

		Quill.register(Figure, true);
		Quill.register(ImageBlot, true);
		Quill.register(Caption, true);

		quill = initializeQuill(editor);
		setQuillInstance(quill);

		if (body.ops) {
			quill.setContents(body.ops);
		}

		quill.on('text-change', onTextChange);
		quill.on('selection-change', onSelectionChange);

		const updateButtonPosition = () => {
			const range = quill.getSelection();
			dispatch('buttonPlusHandler', range);
		};

		window.addEventListener('scroll', updateButtonPosition);
		window.addEventListener('resize', updateButtonPosition);

		return () => {
			window.removeEventListener('scroll', updateButtonPosition);
			window.removeEventListener('resize', updateButtonPosition);
		};
	});

	function handleTitleFocus() {
		titleEl.focus();
		titleEl.setSelectionRange(titleEl.value.length, titleEl.value.length);
	}

	function getDelta() {
		const quill = getQuillInstance();
		body = quill.getContents();
		showFinalData = true;
	}

	async function save() {
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
	<BlogQuillEditor bind:editor bind:body on:handleTitleFocus={handleTitleFocus} {quill}  />

	<OptionButtonsGroup />
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

<!-- <script lang="ts">
	import { onMount } from 'svelte';
  
	let editor;
  
	onMount(async () => {
	  const Quill = (await import('quill')).default;
  
	  class InputModule {
		constructor(quill, options) {
		  this.quill = quill;
		  this.container = null;
		  this.input = null;
		  this.init();
		}
  
		init() {
		  this.quill.root.addEventListener('keydown', this.handleKeydown.bind(this));
		}
  
		handleKeydown(event) {
		  if (event.key === '1' && !this.container) {
			this.showInputField();
		  } else if (event.key === 'Enter' && this.container) {
			event.preventDefault();
			this.insertText();
		  }
		}
  
		showInputField() {
		  const range = this.quill.getSelection();
		  if (range) {
			this.container = document.createElement('div');
			this.container.className = 'ql-input-container';
			this.input = document.createElement('div');
			this.input.contentEditable = 'true';
			this.input.className = 'ql-input-div';
			this.input.setAttribute('placeholder', 'Type something...');
			this.container.appendChild(this.input);
			this.quill.container.appendChild(this.container);
  
			this.input.focus();
		  }
		}
  
		insertText() {
		  const value = this.input.innerText.trim();
		  if (value) {
			const range = this.quill.getSelection();
			if (range) {
			  this.quill.insertText(range.index, value, 'user');
			  this.quill.setSelection(range.index + value.length);
			  this.clearInputField();
			}
		  }
		}
  
		clearInputField() {
		  this.input.innerText = '';
		  this.quill.container.removeChild(this.container);
		  this.container = null;
		  this.input = null;
		}
	  }
  
	  Quill.register('modules/input', InputModule);
  
	  const quill = new Quill(editor, {
		theme: 'bubble',
		modules: {
		  toolbar: [
			[{ header: [1, 2, false] }],
			['bold', 'italic', 'underline'],
			['image', 'code-block'],
			[{ list: 'ordered' }, { list: 'bullet' }],
			['input']
		  ],
		  input: {}
		}
	  });
	});
  </script>
  
  <div bind:this={editor} class="editor-container"></div>
  
  <style>
	.ql-input-container {
	  margin-top: 10px;
	  display: flex;
	  gap: 10px;
	}
	.ql-input-div {
	  flex: 1;
	  padding: 5px;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  min-height: 30px;
	  outline: none;
	}
	.ql-input-div[placeholder]:empty:before {
	  content: attr(placeholder);
	  color: #999;
	}
  </style> -->
