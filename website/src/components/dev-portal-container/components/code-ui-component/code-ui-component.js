import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './code-ui-component.module.scss';

export default class CodeUIComponent extends Component {
  constructor(props) {
    super(props);

    this.renderIframe = this.renderIframe.bind(this);
  }

  renderIframe() {
    if (typeof this.props.data === 'undefined' || this.props.data.content === '') {
      return;
    } else {
      const unparsedContent = this.props.data.content;
      const renderedFrame = (<div dangerouslySetInnerHTML={ { __html: unparsedContent } }></div>);
      return renderedFrame;
    }
  }

  render() {
    return (
      <div id={this.props.data.id} className={styles.codeUiComponentContainer}>
        <div className={styles.contentContainer}>
          {this.props.data && this.props.data.title !== '' &&
          <h1>
            {this.props.data.title}
          </h1>
          }
          {this.renderIframe()}
        </div>
      </div>
    );
  }
}

CodeUIComponent.propTypes = {
  data: PropTypes.object
};
