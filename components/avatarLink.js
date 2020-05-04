export default function AvatarLink({ picture, link }) {
    return (
      <a href={link} className="mx-auto md:mx-0 md:mr-6">
        <img src={picture} className="w-12 h-12 rounded-full" alt={name} />
      </a>
    )
  }
  