import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './code-component.module.scss';
import Prism from '@maji/react-prism';

export default class CodeComponent extends Component {
  constructor(props) {
    super(props);

    this.renderCode = this.renderCode.bind(this);
  }

  renderCode() {
    const content = this.props.data.content;
    let cdSource = null;
    if (content.indexOf('/docs/') !== -1) {
      const rawFile = new XMLHttpRequest();
      rawFile.open('GET', content, false);
      rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
          if (rawFile.status === 200 || rawFile.status === 0) {
            cdSource = rawFile.responseText;
          }
        }
      };
      rawFile.send(null);
    } else {
      cdSource = this.props.data.content;
    }
    return (
      <Prism language="python">
        {cdSource}
      </Prism>
    );
  }

  render() {
    return (
      <section id={this.props.data.id} className={styles.codeComponentContainer}>
        {this.renderCode()}
      </section>
    );
  }
}

CodeComponent.propTypes = {
  data: PropTypes.object
};
