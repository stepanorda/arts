<script lang="ts">
	import ModalWindow from '$lib/components/atoms/ModalWindow.svelte';
	import AuthPage from '../auth/AuthPage.svelte';

	import { showAuthModal } from '$lib/stores/auth';
</script>

<ModalWindow
	on:close={() => showAuthModal.set(false)}
	open={$showAuthModal}
	class="   sm:w-4/5 lg:w-2/3 xl:w-5/12 max-sm:h-full  xs:pb-12 dark:pb-0 sm:bg-zinc-50 rounded-md max-md:w-full  "
	dialogOverlayClass=" md:flex  md:items-center md:justify-center"
	closeButtonAddStyle="max-xs:bg-white xs:text-white max-xs:dark:bg-black"
>
	<AuthPage />
</ModalWindow>
