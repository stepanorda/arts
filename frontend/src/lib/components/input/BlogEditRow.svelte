<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { PlusCircle, Photo,} from '@steeze-ui/heroicons';
	import BlogEditText from '$lib/components/input/BlogEditText.svelte';
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Picture } from '$lib/interfaces/Picture';
	const dispatch = createEventDispatcher();

	export let row;

	export let tabindex: number, focus: number | undefined;

	let t = getContext('t');
	let displayTypeButtons = false;

	$: displayPlus = row.type === 'text' && ['<br>', ''].includes(row.text);
	$: isFocused = tabindex === focus;


	function toggleTypeButtons() {
		displayTypeButtons = !displayTypeButtons;
	}



	
</script>

<div class="flex group {isFocused ? ' ring-0 ring-transparent' : 'ring-transparent'}">
	<div class="md:w-16 w-9 relative">
		{#if displayPlus}
			<button class:rotate-45={displayTypeButtons} on:click={toggleTypeButtons}>
				<Icon src={PlusCircle} class="w-8 h-8 xs:w-10 xs:h-10 stroke-[0.7] mt-1" />
			</button>

		{/if}
		
	</div>
	<div class="w-full">
		{#if displayTypeButtons}
			<button >
				<Icon src={Photo} class="w-10 h-10 inline-block stroke-1 mt-1" />
				{$t('my.post.image')}
			</button>
			
		{:else}
			{#if row.type === 'text'}
				<BlogEditText
					on:addBlock
					on:splitBlock
					on:removeBlock
					on:moveUp
					on:moveDown
					bind:value={row.text}
					bind:focus
					{tabindex}
				/>
			{/if}
	
	
		{/if}
	</div>
</div>
