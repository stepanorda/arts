<script>
	import SideMenu from '$lib/components/nav/side/SideMenu.svelte';
	import SideNav from '$lib/components/nav/side/SideNav.svelte';
	import AvatarEditLink from '$lib/components/user/AvatarEditLink.svelte';
	import MyProfileLinksGroup from '$lib/components/nav/MyProfileLinksGroup.svelte';
	import { user } from '$lib/stores/auth';
	import Hint from '$lib/components/atoms/Hint.svelte';
	import { localePath } from '$lib/translations';
	import ResendEmailVerification from '$lib/components/my/ResendEmailVerification.svelte';
	import { page } from '$app/stores';

	export let data;

	const t = data.t;
	const locale = data.locale;

</script>

{#if $user}
{#if !$page.url.pathname.includes('post/edit/')}
	<SideMenu style="hidden xl:block ">
		{#if !$user.email_verified_at}
			<Hint type="warning">{$t('my.hint.email')} <ResendEmailVerification /></Hint>
		{/if}
		{#if !$user.approved_at}
			<Hint type="danger">{$t('my.hint.approved')}</Hint>
		{/if}
		<slot />

		<div slot="nav" class="text-sm">
			<div class="bg-zinc-700 dark:bg-zinc-800 h-20 w-full rounded-t-sm shadow-lg" />
			<div
				class="text-center -mt-10 pb-3 border-b dark:border-b dark:border-zinc-800 flex flex-col justify-center items-center gap-3"
			>
				<AvatarEditLink user={$user} />
				<a
					href={localePath($locale, `/${$user.username}`)}
					class=" inline-flex items-center gap-2 hover:underline flex-1 font-semibold text-base text-black dark:text-white hover:text-gray-700 dark:hover:text-zinc-300"
				>
					{$user.name}
				</a>
			</div>

			<SideNav>
				<MyProfileLinksGroup />
			</SideNav>
		</div>
	</SideMenu>
	{:else}

	<div class="container mx-auto px-3 pb-12 ">
		<div class="flex flex-col gap-3 mx-auto pt-3 xl:w-2/3 px-3 md:px-0">
			<slot />
		</div>
	</div>
	{/if}
{/if}
