import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

const postsDirectory = join(process.cwd(), '_posts')

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory).filter(path => /.*\.md/.test(path))
}

export function getAllTagsWithPosts() {
  const allPosts = getAllPosts([
    'title',
    'titleEnabled',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
    'issueId',
    'excerpt'
  ])

  const tags = {} // key = tag; value = array of posts
  
  allPosts.forEach(post => {
    const hashtagsWithoutColors = getHashtags(post.content)

    hashtagsWithoutColors.forEach(hashTag => {
      tags[hashTag] = tags[hashTag] ? tags[hashTag] : [];
      tags[hashTag].push(post)
    })
  })

  return tags 
}

export function getHashtags(content){
  const regexResult = [...content.matchAll(/(^|\s)(#[a-zA-zа-яА-Я\d-_]+)/g)]
  const hashtagsInPost = regexResult.map(result => result[2].replace(/#/g, ''))
  const hashtagsWithoutColors = hashtagsInPost.filter(el => !/^[\da-eA-E]*$/.test(el))  
  return hashtagsWithoutColors
}

export function getPostBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const items = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach(field => {
    if (field === 'slug') {
      items[field] = realSlug
    }
    if (field === 'content') {
      items[field] = content
    }

    if (data[field]) {
      items[field] = data[field]
    }
  })

  return items
}

export function getAllPosts(fields = []) {
  const slugs = getPostSlugs()
  return slugs.map(slug => getPostBySlug(slug, fields))
}
