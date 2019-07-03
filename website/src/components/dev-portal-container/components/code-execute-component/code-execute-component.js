import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './code-execute-component.module.scss';
import Prism from '@maji/react-prism';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import { executeCode } from '../../../../actions';
import { SUPPORTED_LANGUAGES } from '../../../../helpers';
import cx from 'classnames';

export default class CodeExecComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      executingCode: false,
      executionResult: null,
      executionError: null
    };

    this.renderCode = this.renderCode.bind(this);
    this.handleCodeExecute = this.handleCodeExecute.bind(this);
    this.clearResults = this.clearResults.bind(this);
  }

  handleCodeExecute(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      executingCode: true,
      executionError: null
    });
    const content = this.props.data.content;
    let language = this.props.data.language;
    if (language.toUpperCase() in SUPPORTED_LANGUAGES) {
      language = SUPPORTED_LANGUAGES[language.toUpperCase()];
    }
    let source_code = null;
    if (content.indexOf('/docs/') !== -1) {
      const rawFile = new XMLHttpRequest();
      rawFile.open('GET', content, false);
      rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
          if (rawFile.status === 200 || rawFile.status === 0) {
            source_code = rawFile.responseText;
          }
        }
      };
      rawFile.send(null);
    } else {
      source_code = this.props.data.content;
    }
    executeCode({ language, source_code }).then((res) => {
      const executeResult = JSON.parse(res).result;
      this.setState({
        executingCode: false,
        executionResult: executeResult,
        executionError: null
      });
    }).catch((err) => {
      const response = JSON.parse(err.responseText);
      this.setState({
        executionError: response.result,
        executingCode: false
      });
    });
  }

  clearResults(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      executingCode: false,
      executionResult: null,
      executionError: null
    });
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
      <Prism language="javascript">
        {cdSource}
      </Prism>
    );
  }

  render() {
    return (
      <div id={this.props.data.id} className={styles.codeExecComponentContainer}>
        {this.props.data && this.props.data.title !== '' &&
          <h1>
            {this.props.data.title}
          </h1>
        }
        {this.renderCode()}
        <button className={styles.executeBtn} onClick={(e) => this.handleCodeExecute(e)}>
          {!this.state.executingCode
            ?
            <span>Execute</span>
            :
            <span><SavingSpinner color="#24ab95" title="" borderStyle="none" size={8} /> Executing</span>
          }
        </button>
        <div className={styles.resultBox}>
          <h3>
            Result
            <span className="pull-right">
              <button onClick={(e) => this.clearResults(e)} className={styles.transparentBtn}>Clear Results</button>
            </span>
          </h3>
          {this.state.executionError === null &&
          <div className={cx(styles.resultContainer, this.state.executionResult !== null && styles.show)}>
            <div className={styles.resultContainer}>
              {this.state.executionResult !== null ? this.state.executionResult : <span>// Click Execute button above to run code</span>}
            </div>
          </div>
          }
          {this.state.executionError !== null &&
            <div className={styles.executionErrorBox}>
              {this.state.executionError}
            </div>
          }
        </div>
      </div>
    );
  }
}

CodeExecComponent.propTypes = {
  data: PropTypes.object
};
