import 'dotenv/config'
import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
})

// Helper function to convert Sanity blocks to HTML
function blocksToHtml(blocks) {
  if (!blocks) return ''
  
  return blocks.map(block => {
    if (block._type === 'block') {
      const text = block.children?.map(child => child.text).join('') || ''
      const style = block.style || 'normal'
      
      switch (style) {
        case 'h1': return `<h1>${text}</h1>`
        case 'h2': return `<h2>${text}</h2>`
        case 'h3': return `<h3>${text}</h3>`
        case 'h4': return `<h4>${text}</h4>`
        default: return `<p>${text}</p>`
      }
    } else if (block._type === 'image') {
      const imageUrl = client.config().useCdn 
        ? `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${block.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}`
        : ''
      return `<img src="${imageUrl}" alt="${block.alt || ''}" />`
    } else if (block._type === 'youtube') {
      const videoId = block.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      if (videoId) {
        return `<div class="player-container">
        <iframe width="760" height="515" src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>`
      }
    }
    return ''
  }).join('\n')
}

// Helper function to get image URL from Sanity
function getImageUrl(image) {
  if (!image?.asset?._ref) return ''
  
  const ref = image.asset._ref
  const [, id, dimensions, format] = ref.match(/image-([a-f\d]+)-(\d+x\d+)-(\w+)$/)
  
  return `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${id}-${dimensions}.${format}`
}

// Fetch blog posts from Sanity
async function fetchBlogPosts() {
  try {
    const query = `*[_type == "blogPost" && !draft] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      publishedAt,
      tag,
      image,
      content,
      draft
    }`
    
    const posts = await client.fetch(query)
    
    // Ensure content/blog directory exists
    const blogDir = path.join(process.cwd(), 'content', 'blog')
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true })
    }

    // Create a subdirectory for Sanity content to avoid conflicts
    const sanityBlogDir = path.join(blogDir, 'sanity')
    if (!fs.existsSync(sanityBlogDir)) {
      fs.mkdirSync(sanityBlogDir, { recursive: true })
    }
    
    for (const post of posts) {
      const filename = `${post.slug.current}.md`
      const filepath = path.join(sanityBlogDir, filename)
      
      const imageUrl = post.image ? getImageUrl(post.image) : ''
      const content = blocksToHtml(post.content)
      
      const frontmatter = `---
title: "${post.title}"
date: ${post.publishedAt}
description: ${post.description || ''}
tag: ${post.tag || 'general'}
image: ${imageUrl}
draft: ${post.draft || false}
sanity_id: "${post._id}"
source: "sanity"
---

${content}`

      fs.writeFileSync(filepath, frontmatter)
      console.log(`Created: sanity/${filename}`)
    }
    
    console.log(`✅ Fetched ${posts.length} blog posts from Sanity`)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
  }
}

// Fetch news posts from Sanity
async function fetchNewsPosts() {
  try {
    const query = `*[_type == "newsPost" && !draft] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      publishedAt,
      category,
      image,
      content,
      urgent,
      draft
    }`
    
    const posts = await client.fetch(query)
    
    // Ensure content/news directory exists
    const newsDir = path.join(process.cwd(), 'content', 'news')
    if (!fs.existsSync(newsDir)) {
      fs.mkdirSync(newsDir, { recursive: true })
    }

    // Create a subdirectory for Sanity content to avoid conflicts
    const sanityNewsDir = path.join(newsDir, 'sanity')
    if (!fs.existsSync(sanityNewsDir)) {
      fs.mkdirSync(sanityNewsDir, { recursive: true })
    }
    
    for (const post of posts) {
      const filename = `${post.slug.current}.md`
      const filepath = path.join(sanityNewsDir, filename)
      
      const imageUrl = post.image ? getImageUrl(post.image) : ''
      const content = blocksToHtml(post.content)
      
      const frontmatter = `---
title: "${post.title}"
date: ${post.publishedAt}
description: ${post.description || ''}
category: ${post.category || 'general-news'}
image: ${imageUrl}
urgent: ${post.urgent || false}
draft: ${post.draft || false}
sanity_id: "${post._id}"
source: "sanity"
---

${content}`

      fs.writeFileSync(filepath, frontmatter)
      console.log(`Created: sanity/${filename}`)
    }
    
    console.log(`✅ Fetched ${posts.length} news posts from Sanity`)
  } catch (error) {
    console.error('Error fetching news posts:', error)
  }
}

// Main function
async function main() {
  console.log('🔄 Fetching content from Sanity...')
  await fetchBlogPosts()
  await fetchNewsPosts()
  console.log('🎉 Content sync complete!')
}

main().catch(console.error)