import {defineField, defineType} from 'sanity'
/**
 * title: "Donem el tret de sortida al Grup d’Interiorització"
date: 2023-09-01T14:54:42.607Z
description: Des de la Comissió del Grup de Reflexió ens mou poder generar espais de trobada intencionals i conscients entre les persones
tag: pray
image: /images/covers/REFLEXIO.jpg
draft: false
 */
export const newsType = defineType({
  name: 'news',
  title: 'Noticia',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'date',
      type: 'datetime',
    }),
    defineField({
        name: 'description',
        type: 'string',
    }),
    defineField({
        name: 'tag',
        type: 'string',
    }),
    defineField({
        name: 'image',
        type: 'image',
    }),
    defineField({
        name: 'slug',
        type: 'string',
    }),
    defineField({
        name: 'body',
        type: 'array',
        of: [{type: 'block'}]
    })
  ],
})
