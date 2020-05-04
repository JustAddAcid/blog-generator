export default function LinkButton({ link, text }) {
    return (
        <a href={link} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow mt-2 inline-block">{text}</a>
    )
}