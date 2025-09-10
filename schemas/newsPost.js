export default {
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Anuncis', value: 'announcements'},
          {title: 'Esdeveniments', value: 'events'},
          {title: 'Notícies Generals', value: 'general-news'},
          {title: 'Activitats', value: 'activities'}
        ],
        layout: 'dropdown'
      }
    },
    {
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }
      ]
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string'
            }
          ]
        }
      ]
    },
    {
      name: 'urgent',
      title: 'Urgent',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'draft',
      title: 'Draft',
      type: 'boolean',
      initialValue: false
    }
  ],
  
  preview: {
    select: {
      title: 'title',
      media: 'image',
      subtitle: 'category'
    }
  }
}