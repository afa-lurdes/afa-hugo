import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_TOKEN, // Required for writes
})

// Helper function to convert HTML to blocks (simplified)
function htmlToBlocks(html) {
  if (!html) return []
  
  // Simple conversion - split by paragraphs and handle basic HTML
  const paragraphs = html.split('\n').filter(p => p.trim())
  
  return paragraphs.map(p => {
    const trimmed = p.trim()
    
    // Handle YouTube embeds
    if (trimmed.includes('youtube.com/embed/')) {
      const match = trimmed.match(/src="https:\/\/www\.youtube\.com\/embed\/([^"]+)"/)
      if (match) {
        const videoId = match[1].split('?')[0]
        return {
          _type: 'youtube',
          _key: Math.random().toString(36).substr(2, 9),
          url: `https://www.youtube.com/watch?v=${videoId}`
        }
      }
    }
    
    // Handle images
    if (trimmed.includes('<img')) {
      // For now, just create a placeholder - images would need to be uploaded to Sanity
      return {
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'normal',
        children: [{
          _type: 'span',
          text: '[Image: Please upload to Sanity and replace]',
          marks: ['strong']
        }]
      }
    }
    
    // Handle headings
    if (trimmed.startsWith('<h1>')) {
      return {
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'h1',
        children: [{
          _type: 'span',
          text: trimmed.replace(/<\/?h1>/g, ''),
          marks: []
        }]
      }
    }
    
    if (trimmed.startsWith('<h2>')) {
      return {
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'h2',
        children: [{
          _type: 'span',
          text: trimmed.replace(/<\/?h2>/g, ''),
          marks: []
        }]
      }
    }
    
    // Regular paragraphs
    return {
      _type: 'block',
      _key: Math.random().toString(36).substr(2, 9),
      style: 'normal',
      children: [{
        _type: 'span',
        text: trimmed.replace(/<\/?p>/g, ''),
        marks: []
      }]
    }
  }).filter(block => block.children && block.children[0].text.trim())
}

// Function to create slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Migrate blog posts
async function migrateBlogPosts() {
  const blogDir = path.join(process.cwd(), 'content', 'blog')
  
  if (!fs.existsSync(blogDir)) {
    console.log('No blog directory found')
    return
  }
  
  const files = fs.readdirSync(blogDir).filter(file => 
    file.endsWith('.md') && !file.startsWith('_')
  )
  
  console.log(`Found ${files.length} blog posts to migrate`)
  
  for (const file of files) {
    try {
      const filepath = path.join(blogDir, file)
      const fileContent = fs.readFileSync(filepath, 'utf8')
      const { data: frontmatter, content } = matter(fileContent)
      
      // Skip if already migrated (has sanity_id)
      if (frontmatter.sanity_id || frontmatter.source === 'sanity') {
        console.log(`Skipping ${file} - already from Sanity`)
        continue
      }
      
      const blogPost = {
        _type: 'blogPost',
        title: frontmatter.title || 'Untitled',
        slug: {
          _type: 'slug',
          current: frontmatter.slug || createSlug(frontmatter.title || file.replace('.md', ''))
        },
        description: frontmatter.description || '',
        publishedAt: frontmatter.date || new Date().toISOString(),
        tag: frontmatter.tag || 'general',
        content: htmlToBlocks(content),
        draft: frontmatter.draft || false,
        // Add metadata to track original source
        originalFile: file,
        migratedAt: new Date().toISOString()
      }
      
      const result = await client.create(blogPost)
      console.log(`✅ Migrated blog post: ${frontmatter.title} (ID: ${result._id})`)
      
      // Optionally, add sanity_id to original file to mark as migrated
      const updatedFrontmatter = {
        ...frontmatter,
        sanity_id: result._id,
        migrated_to_sanity: true
      }
      
      const updatedContent = matter.stringify(content, updatedFrontmatter)
      fs.writeFileSync(filepath, updatedContent)
      
    } catch (error) {
      console.error(`Error migrating ${file}:`, error)
    }
  }
}

// Migrate news posts (if they exist)
async function migrateNewsPosts() {
  const newsDir = path.join(process.cwd(), 'content', 'news')
  
  if (!fs.existsSync(newsDir)) {
    console.log('No news directory found - skipping news migration')
    return
  }
  
  const files = fs.readdirSync(newsDir).filter(file => 
    file.endsWith('.md') && !file.startsWith('_')
  )
  
  console.log(`Found ${files.length} news posts to migrate`)
  
  for (const file of files) {
    try {
      const filepath = path.join(newsDir, file)
      const fileContent = fs.readFileSync(filepath, 'utf8')
      const { data: frontmatter, content } = matter(fileContent)
      
      // Skip if already migrated
      if (frontmatter.sanity_id || frontmatter.source === 'sanity') {
        console.log(`Skipping ${file} - already from Sanity`)
        continue
      }
      
      const newsPost = {
        _type: 'newsPost',
        title: frontmatter.title || 'Untitled',
        slug: {
          _type: 'slug',
          current: frontmatter.slug || createSlug(frontmatter.title || file.replace('.md', ''))
        },
        description: frontmatter.description || '',
        publishedAt: frontmatter.date || new Date().toISOString(),
        category: frontmatter.category || 'general-news',
        content: htmlToBlocks(content),
        urgent: frontmatter.urgent || false,
        draft: frontmatter.draft || false,
        // Add metadata to track original source
        originalFile: file,
        migratedAt: new Date().toISOString()
      }
      
      const result = await client.create(newsPost)
      console.log(`✅ Migrated news post: ${frontmatter.title} (ID: ${result._id})`)
      
      // Mark original file as migrated
      const updatedFrontmatter = {
        ...frontmatter,
        sanity_id: result._id,
        migrated_to_sanity: true
      }
      
      const updatedContent = matter.stringify(content, updatedFrontmatter)
      fs.writeFileSync(filepath, updatedContent)
      
    } catch (error) {
      console.error(`Error migrating ${file}:`, error)
    }
  }
}

// Main function
async function main() {
  console.log('🔄 Starting migration to Sanity...')
  console.log('⚠️  Make sure you have:')
  console.log('   - Set SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, and SANITY_TOKEN in your .env')
  console.log('   - Created your Sanity project and schemas')
  console.log('   - Backed up your content directory')
  console.log('')
  
  if (!process.env.SANITY_TOKEN) {
    console.error('❌ SANITY_TOKEN is required for migration')
    process.exit(1)
  }
  
  await migrateBlogPosts()
  await migrateNewsPosts()
  
  console.log('')
  console.log('🎉 Migration complete!')
  console.log('📝 Next steps:')
  console.log('   1. Review migrated content in Sanity Studio')
  console.log('   2. Upload any referenced images to Sanity')
  console.log('   3. Update image references in content')
  console.log('   4. Test your site with both original and Sanity content')
}

main().catch(console.error)