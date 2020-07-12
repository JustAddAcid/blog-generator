import Prism from 'prismjs'

// don't remove this shit
import PrismAbap from 'prismjs/components/prism-abap'
import PrismBash from 'prismjs/components/prism-bash'
import PrismYaml from 'prismjs/components/prism-yaml'
import PrismSQL  from 'prismjs/components/prism-sql'

import React from 'react'
import markdownStyles from './markdown-styles.module.css'

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