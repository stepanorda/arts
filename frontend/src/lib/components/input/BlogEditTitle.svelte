<script lang="ts">
	import { onMount } from 'svelte';

	export let titleValue: string, titleEl: HTMLInputElement;

	function autoGrow(textArea) {
		textArea.style.height = '10px';
		textArea.style.height = `${textArea.scrollHeight}px`;
	}

	onMount(() => {
		autoGrow(titleEl);
        titleEl.focus()
	});

    
</script>

<div class="flex">
	<div class="w-[1px] bg-zinc-300"></div>
	<textarea
		on:keydown
		on:input={() => autoGrow(titleEl)}
		class="border-0 p-3 focus:ring-0 text-xl sm:text-2xl lg:text-3xl w-full font-semibold font-serif placeholder:font-normal sm:max-xl:placeholder:text-center dark:bg-black dark:placeholder:text-zinc-400"
		name="title"
		placeholder="Title"
		bind:value={titleValue}
		bind:this={titleEl}
	/>
</div>
