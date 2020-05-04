import Prism from 'prismjs'
import React from 'react'
import markdownStyles from './markdown-styles.module.css'

// export default function PostBody({ content }) {
//   return (
//     <div className="max-w-2xl mx-auto">
//       <div
//         className={markdownStyles['markdown']}
//         dangerouslySetInnerHTML={{ __html: content }}
//       />
//     </div>
//   )
// }

export default class PostBody extends React.Component {
  componentDidMount() {
    setTimeout(() => Prism.highlightAll(), 0);
  }
  render() {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className={markdownStyles['markdown']}
          dangerouslySetInnerHTML={{ __html: this.props.content }}
        />
      </div>
    )
  }
}