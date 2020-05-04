import DateFormater from '../components/date-formater'
import AvatarLink from '../components/avatarLink'

export default function Comment({
    avatarUrl,
    userProfileUrl,
    userLogin,
    commentDate,
    commentBody
}) {
    return (
        <article className="md:flex bg-white rounded-lg p-6 shadow-small mb-2 comment-card">
            <AvatarLink picture={avatarUrl} link={userProfileUrl} />
            <div>
                <a className="text-xl font-bold hover:underline" href={userProfileUrl}>{userLogin}</a>
                <p className="text-lg leading-relaxed mb-4" 
                    dangerouslySetInnerHTML={{ __html: commentBody }} />
                <DateFormater className="text-gray-600" dateString={commentDate} />
            </div>
        </article>
    )
}