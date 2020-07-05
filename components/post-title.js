export default function PostTitle({ titleEnabled, title }) {

  if (titleEnabled) {

    return (
      <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-left">
      {title}
      </h1>
    )
  } else {
    return (
      <h1 className="screenreader">{title}</h1>
    )
  }
}
