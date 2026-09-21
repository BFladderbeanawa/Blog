import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog")
  const body = JSON.stringify(
    posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      slug: post.id,
      id: post.id,
      tags: post.data.tags,
    })),
  )
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
