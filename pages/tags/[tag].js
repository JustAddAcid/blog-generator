import Container from '../../components/container'
import Layout from '../../components/layout'
import { getAllTagsWithPosts } from '../../lib/api'
import Head from 'next/head'
import MoreStories from '../../components/more-stories'
import HeroPost from '../../components/hero-post'
import Intro from '../../components/intro'

export default function Index({ allPosts, tag }) {
    const heroPost = allPosts[0]
    const morePosts = allPosts.slice(1)
    return (
        <>
            <Layout>
                <Head>
                    <title>Nosoff.info #{tag}</title>
                </Head>
                <Container >
                    <Intro tag={'#' + tag} />
                    {heroPost && (
                        <HeroPost
                            title={heroPost.title}
                            titleEnabled={heroPost.titleEnabled}
                            coverImage={heroPost.coverImage}
                            date={heroPost.date}
                            author={heroPost.author}
                            slug={heroPost.slug}
                            excerpt={heroPost.excerpt}
                        />
                    )}
                    {morePosts.length > 0 && <MoreStories posts={morePosts} />}
                </Container>
            </Layout>
        </>
    )
}

export async function getStaticProps({ params }) {
    const tagsMap = getAllTagsWithPosts()
    const posts = tagsMap[params.tag]
    posts.sort((a, b) => new Date(b.date) - new Date(a.date))

    return {
        props: { allPosts: posts, tag: params.tag },
    }
}

export async function getStaticPaths() {
    const tagsMap = getAllTagsWithPosts()
    const tags = Object.keys(tagsMap)
    console.log(tags)
    return {
        paths: tags.map(tag => {
            return {
                params: {
                    tag,
                },
            }
        }),
        fallback: false,
    }
}
