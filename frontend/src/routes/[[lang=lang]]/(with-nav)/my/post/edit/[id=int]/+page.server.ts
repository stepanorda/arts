import type { PageServerLoad } from './$types';
import { get } from '$lib/server/repositories/post';
import { error } from '@sveltejs/kit';
import { postMap } from '$lib/server/mappers/post';

export const load = (async ({ params, parent }) => {
	const { user } = await parent();
	const postRaw = await get(params.id);
	if (!postRaw) {
		error(404);
	}
	if (postRaw?.owner?.id != user.id) {
		error(403, {
			message: 'Unauthorized'
		});
	}
	return {
		post: postMap(postRaw),
	};
}) satisfies PageServerLoad;
