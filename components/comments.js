import Comment from "./comment"
import React from 'react'
import LinkButton from "./linkbutton"

export default class Comments extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: null,
            isLoading: true
        }
    }

    componentDidMount() {
        if (!this.state.data) {
            const githubUser = this.props.githubUser
            const githubRepo = this.props.githubRepo
            const issueId = this.props.issueId

            const that = this;
            window.fetch(`https://api.github.com/repos/${githubUser}/${githubRepo}/issues/${issueId}/comments`, {
                headers: {
                    Accept: 'application/vnd.github.v3.html+json'
                }
            })
                .then(response => response.json())
                .then(comments => that.setState({
                    data: comments,
                    isLoading: false
                }))
        }
        return null;
    }

    render() {
        const isLoading = this.state.isLoading
        const hasData = !!(this.state.data && this.state.data.length)
        const githubUser = this.props.githubUser
        const githubRepo = this.props.githubRepo
        const issueId = this.props.issueId
        return (
            <>
                <hr className="mb-5" />
                <h2 className="text-2xl md:text-2xl lg:text-2xl font-bold tracking-tighter leading-tight md:leading-none mb-12 text-center md:text-center">Комментарии</h2>
                
                {isLoading && (<div className="md:flex p-6">Loading...</div>)}
                
                {hasData && (
                    this.state.data.map(comment => (
                        <Comment
                            key={comment.id}
                            avatarUrl={comment.user.avatar_url}
                            userProfileUrl={comment.user.html_url}
                            userLogin={comment.user.login}
                            commentDate={comment.created_at}
                            commentBody={comment.body_html} />
                    ))
                )}
                
                <LinkButton text="Добавить комментарий" link={`https://github.com/${githubUser}/${githubRepo}/issues/${issueId}`} />
            </>
        )
    }
}
