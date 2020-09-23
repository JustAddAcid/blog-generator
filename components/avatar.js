export default function Avatar({ name, picture, href }) {
  return (
    <a className="flex items-center" href={href ? href : "#"}>
      <img src={picture} className="w-12 h-12 rounded-full mr-4" alt={name} />
      <div className="text-xl font-bold">{name}</div>
    </a>
  )
}
