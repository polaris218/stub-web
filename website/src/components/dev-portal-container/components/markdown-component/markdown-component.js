import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './markdown-component.module.scss';
import ReactMarkdown from 'react-markdown';

export default class MarkdownComponent extends Component {
  constructor(props) {
    super(props);
    this.renderMarkdown = this.renderMarkdown.bind(this);
  }

  renderMarkdown() {
    const content = this.props.data.content;
    let mdSource = null;
    if ((content.indexOf('/docs/') !== -1) || (content.indexOf('/api_reference_docs/') !== -1)){
      const rawFile = new XMLHttpRequest();
      rawFile.open('GET', content, false);
      rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
          if (rawFile.status === 200 || rawFile.status === 0) {
            mdSource = rawFile.responseText;
          }
        }
      };
      rawFile.send(null);
    } else {
      mdSource = this.props.data.content;
    }
    return (
      <ReactMarkdown
        source={mdSource}
        escapeHtml={false}
      />
    );
  }

  render() {
    return (
      <section id={this.props.data.id} className={styles.markdownComponentContainer}>
        {this.props.data &&
          <div className={styles.markdownComponent}>
            {this.props.data.title && this.props.data.title !== '' &&
              <h1>{this.props.data.title}</h1>
            }
            {this.renderMarkdown()}
          </div>
        }
      </section>
    );
  }
}

MarkdownComponent.propTypes = {
  data: PropTypes.object
};
