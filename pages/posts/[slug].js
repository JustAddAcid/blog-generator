import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts, getHashtags } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
// import { CMS_NAME } from '../../lib/constants'
import markdownToHtml from '../../lib/markdownToHtml'
import Comments from '../../components/comments'

export default function Post({ post, morePosts, preview }) {
  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
            <>
              <article className="mb-32">
                <Head>
                  <title>{post.title}</title>
                  <meta property="og:image" content={post.ogImage.url} />
                </Head>
                <PostHeader
                  title={post.title}
                  titleEnabled={post.titleEnabled}
                  coverImage={post.coverImage}
                  date={post.date}
                  author={post.author}
                />
                <PostBody content={post.content} />
              </article>
              <article className="mb-32 max-w-2xl mx-auto">
                <Comments 
                  githubUser="JustAddAcid"
                  githubRepo="JustAddAcid.github.io"
                  issueId={post.issueId} />
              </article>
            </>
          )}
      </Container>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug, [
    'title',
    'titleEnabled',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
    'issueId'
  ])
  let markdownContent = post.content || ''
  const hashTags = getHashtags(markdownContent);
  
  hashTags.forEach(tag => {
    markdownContent = markdownContent.replace(`#${tag}`, `[#${tag}](/tags/${tag})`)
  })


  const content = await markdownToHtml(markdownContent)

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map(posts => {
      return {
        params: {
          slug: posts.slug,
        },
      }
    }),
    fallback: false,
  }
}
