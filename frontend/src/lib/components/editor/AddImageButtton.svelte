<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Photo } from '@steeze-ui/heroicons';

	export let displayTypeButtons;
</script>

<button
	id="image-button"
	class="w-full hover:text-green-700 {displayTypeButtons ? '' : 'hidden'}"
	on:click
>
	<Icon src={Photo} class="w-10 h-10 stroke-[0.5]  " />
</button>
