// Webhook handler for Sanity CMS updates
// Deploy this as a serverless function (Netlify/Vercel) or use GitHub webhooks

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { body } = req
  
  // Verify webhook (optional but recommended for security)
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
  if (webhookSecret && req.headers['sanity-webhook-signature']) {
    // Add signature verification logic here
  }
  
  try {
    // Trigger GitHub workflow
    const githubResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'sanity-update',
        client_payload: {
          documentType: body._type,
          documentId: body._id,
          operation: body._updatedAt ? 'update' : 'create'
        }
      })
    })
    
    if (!githubResponse.ok) {
      throw new Error(`GitHub API error: ${githubResponse.statusText}`)
    }
    
    res.status(200).json({ 
      message: 'Webhook received, build triggered',
      documentType: body._type,
      documentId: body._id
    })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}