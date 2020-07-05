import Avatar from '../components/avatar'
import DateFormater from '../components/date-formater'
import CoverImage from '../components/cover-image'
import Link from 'next/link'

export default function HeroPost({
  title,
  titleEnabled,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}) {
  const twoColumnsClasses = "md:grid md:grid-cols-2 md:col-gap-16 lg:col-gap-8 mb-20 md:mb-28"
  const oneColumnClasses = "md:col-gap-16 lg:col-gap-8 mb-20 md:mb-28"

  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage title={title} src={coverImage} slug={slug} />
      </div>
      <div className={titleEnabled ? twoColumnsClasses : oneColumnClasses}>
        <div>
          <h3 className={titleEnabled ? "mb-4 text-4xl lg:text-6xl leading-tight": "screenreader"}>
            <Link as={`/posts/${slug}`} href="/posts/[slug]">
              <a className="hover:underline">{title}</a>
            </Link>
          </h3>
          <div className="mb-4 md:mb-0 text-lg">
            <DateFormater dateString={date} />
          </div>
        </div>
        <div>
          <p className="text-lg leading-relaxed mb-4">{excerpt}</p>
          <Avatar name={author.name} picture={author.picture} />
        </div>
      </div>
    </section>
  )
}
