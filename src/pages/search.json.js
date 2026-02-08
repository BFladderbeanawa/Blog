// src/pages/search.json.js
import { getCollection } from 'astro:content';

export async function GET({}) {
	const posts = await getCollection('blog');
	const body = JSON.stringify(
		posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			slug: post.slug,
            tags: post.data.tags
		}))
	);
	return new Response(body, {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
