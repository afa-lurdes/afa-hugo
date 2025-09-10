# Sanity CMS Integration Setup

This document explains how to set up and use the Sanity CMS integration with the AFA Lurdes Hugo website.

## Overview

The integration allows content editors to manage blog posts and news through Sanity Studio, a user-friendly CMS interface. Content is automatically synchronized with the Hugo site.

## Setup Instructions

### 1. Create Sanity Project

1. Sign up for a free Sanity account at [sanity.io](https://sanity.io)
2. Create a new project:
   ```bash
   npx sanity init
   ```
   Or create via the Sanity dashboard
3. Note your Project ID and Dataset name

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Sanity credentials:
   ```env
   SANITY_STUDIO_PROJECT_ID=your-project-id-here
   SANITY_STUDIO_DATASET=production
   SANITY_TOKEN=your-sanity-token-here
   ```

3. Get a token:
   - Go to [sanity.io/manage](https://sanity.io/manage)
   - Select your project
   - Go to API → Tokens
   - Create a token with "Editor" permissions

### 3. Update Sanity Configuration

Update the `projectId` in `sanity.config.js` with your actual project ID.

### 4. Deploy Sanity Studio

Deploy your Sanity Studio:

```bash
npm run sanity:studio
```

Or deploy to Sanity hosting:

```bash
npx sanity deploy
```

### 5. Set up Automated Deployment

#### GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `SANITY_STUDIO_PROJECT_ID`: Your Sanity project ID
- `SANITY_STUDIO_DATASET`: Your Sanity dataset (usually 'production')  
- `SANITY_TOKEN`: Your Sanity API token
- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID`: Your Netlify site ID

#### Webhook Setup (Optional)

For real-time updates when content is published:

1. Deploy the webhook handler (`sanity-webhook.js`) to Netlify/Vercel
2. In Sanity Studio, go to API → Webhooks
3. Create a webhook pointing to your deployed handler
4. Set trigger on document changes

## Content Preservation Strategy

**Your existing Hugo content will NOT be replaced!** The integration is designed to preserve all current posts:

### How It Works
- **Existing posts**: Remain in `content/blog/` and `content/news/` unchanged
- **Sanity posts**: Saved in `content/blog/sanity/` and `content/news/sanity/`
- **Hugo renders both**: All content appears together on your site
- **Source tracking**: Sanity posts include `source: "sanity"` metadata

### Migration Options

**Option 1: Keep Both Systems (Recommended)**
- Leave existing posts as Hugo markdown files
- Create new posts via Sanity CMS
- Both appear together on your site

**Option 2: Migrate Existing Content to Sanity**
```bash
npm run sanity:migrate
```
This will:
- Copy existing posts to Sanity CMS
- Add `sanity_id` and `migrated_to_sanity` flags to original files
- Preserve original files as backup

## Usage

### Content Management

1. Access Sanity Studio at your deployed URL or run locally with `npm run sanity:studio`
2. Create new blog posts or news articles
3. Publish content by setting `draft: false`

### Content Types

#### Blog Posts
- **Title**: Post title
- **Slug**: URL-friendly identifier
- **Description**: Brief summary
- **Published Date**: When to publish
- **Tag**: Category (solidaria, esports, biblioteca, etc.)
- **Featured Image**: Main image
- **Content**: Rich text with images and YouTube embeds
- **Draft**: Toggle to publish/unpublish

#### News Posts  
- **Title**: News title
- **Slug**: URL-friendly identifier
- **Description**: Brief summary
- **Published Date**: When to publish
- **Category**: News type (announcements, events, etc.)
- **Featured Image**: Main image
- **Content**: Rich text with images
- **Urgent**: Mark as urgent/important
- **Draft**: Toggle to publish/unpublish

### Manual Content Sync

To manually sync content from Sanity:

```bash
npm run sanity:fetch
```

### Migration Commands

**Migrate existing posts to Sanity** (optional):
```bash
npm run sanity:migrate
```

**Check current content structure**:
```bash
# See all blog posts
find content/blog -name "*.md" | head -10

# See Sanity-managed posts only
find content/blog/sanity -name "*.md" 2>/dev/null | head -10
```

### Local Development

1. Start Sanity Studio:
   ```bash
   npm run sanity:studio
   ```

2. Fetch content and start Hugo:
   ```bash
   npm run sanity:fetch
   npm run dev
   ```

3. Or build for production:
   ```bash
   npm run build
   ```

## File Structure

```
├── sanity.config.js          # Sanity configuration
├── schemas/                  # Content schemas
│   ├── index.js             # Schema exports
│   ├── blogPost.js          # Blog post schema
│   └── newsPost.js          # News post schema
├── scripts/
│   └── fetch-sanity-content.js  # Content sync script
├── .github/workflows/
│   └── sanity-sync.yml      # Auto-deployment workflow
└── sanity-webhook.js        # Webhook handler
```

## Troubleshooting

### Content Not Syncing
- Check environment variables are correct
- Verify Sanity token has proper permissions
- Check GitHub Actions logs for errors

### Build Failures
- Ensure all required secrets are set in GitHub
- Check Hugo version compatibility
- Verify content structure matches schemas

### Studio Not Loading
- Check `sanity.config.js` project ID
- Ensure dependencies are installed
- Try clearing browser cache

## Support

For issues with:
- **Sanity CMS**: Check [Sanity documentation](https://sanity.io/docs)
- **Hugo**: Check [Hugo documentation](https://gohugo.io/documentation/)
- **Integration**: Review GitHub Actions logs and check environment variables