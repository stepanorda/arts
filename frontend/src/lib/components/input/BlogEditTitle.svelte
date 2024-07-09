<script lang="ts">
	import { onMount } from 'svelte';

	export let titleValue: string, titleEl: HTMLInputElement, quill;

	function autoGrow(textArea) {
		textArea.style.height = '10px';
		textArea.style.height = `${textArea.scrollHeight}px`;
	}

	onMount(() => {
		autoGrow(titleEl);
		titleEl.focus();
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
</script>

<div class="  xl:w-2/3 xl:mx-auto">
	<div class="w-[1px] bg-zinc-300"></div>
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
