import React, { Component } from 'react';
import styles from './live-track-execute-component.module.scss';
import Prism from '@maji/react-prism';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import { executeCode } from '../../../../actions';
import { SUPPORTED_LANGUAGES } from '../../../../helpers';
import cx from 'classnames';
import { Row, Col, FormControl } from 'react-bootstrap';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-go';
import moment from 'moment';
import LiveTrackExperienceComponent from '../live-track-experience/live-track-experience';
import PropTypes from 'prop-types';

var entities = [5725851488354304, 5079829082800128, 5759180434571264, 5639574185312256, 5715921523965952];

export default class LiveTrackExecute extends Component {
  constructor(props) {
    super(props);

    this.state = {
      executingCode: false,
      executionResult: null,
      executionError: null,
      selectedLanguage: 'python',
      loadingLiveTrack: false,
      entityId: null,
      externalId: null,
      missingExternalIdError: false,
    };

    this.renderCode = this.renderCode.bind(this);
    this.renderLanguageSwitcher = this.renderLanguageSwitcher.bind(this);
    this.handleLanguageSwitcherChange = this.handleLanguageSwitcherChange.bind(this);
    this.handleCodeExecute = this.handleCodeExecute.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.renderLiveTrack = this.renderLiveTrack.bind(this);
    this.onExternalIdChanged = this.onExternalIdChanged.bind(this);
  }

  componentDidMount(){
    const externalId = Math.random().toString(36).substr(2, 10);
    this.setState({
      externalId
    });
  }

  renderLiveTrack() {
    this.setState({
      loadingLiveTrack: false
    });
  }

  handleCodeExecute(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.externalId) {
      this.setState({ missingExternalIdError: true });
      return;
    }
    this.setState({
      missingExternalIdError: false,
      executingCode: true,
      executionError: null,
      loadingLiveTrack: false
    });
    const content = this.props.data.content[this.state.selectedLanguage];
    let language = this.state.selectedLanguage;
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
      source_code = this.props.data.content[this.state.selectedLanguage];
    }
    const startDate = moment(new Date()).toISOString(true);
    const endDate = moment(new Date()).add(30, 'minutes').toISOString(true);
    const randomID = Math.floor(Math.random() * 4) + 1;
    source_code = source_code.replace('START_DATE', startDate);
    source_code = source_code.replace('END_DATE', endDate);
    source_code = source_code.replace('[ENTITY_IDS]', entities[randomID]);
    source_code = source_code.replace('EXTERNAL_ID', this.state.externalId);
    const assignedEntity = entities[randomID];
    executeCode({ language, source_code }).then((res) => {
      const executeResult = JSON.parse(res).result;
      this.setState({
        executingCode: false,
        executionResult: executeResult,
        executionError: null,
        loadingLiveTrack: true,
        entityId: assignedEntity
      }, () => { setTimeout(() => { this.renderLiveTrack(); }, 5000); });
    }).catch((err) => {
      console.log(err);
      const response = JSON.parse(err.responseText);
      this.setState({
        executionError: response.result,
        executingCode: false,
        loadingLiveTrack: false
      });
    });
  }

  onExternalIdChanged(e) {
    e.preventDefault();
    e.stopPropagation();
    const externalId = e.target.value;
    this.setState({ externalId });
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

  handleLanguageSwitcherChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    this.setState({
      selectedLanguage: value
    });
  }

  renderLanguageSwitcher() {
    const content = this.props.data.languages;
    const langOptions = content.map((lang) => {
      return (
        <option value={lang}>{lang}</option>
      );
    });
    return (
      <FormControl className={styles.customSelectEl} onChange={(e) => this.handleLanguageSwitcherChange(e)} defaultValue={this.state.selectedLanguage} componentClass="select">
        {langOptions}
      </FormControl>
    );
  }

  renderCode() {
    const content = this.props.data.content[this.state.selectedLanguage];
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
      cdSource = this.props.data.content[this.state.selectedLanguage];
    }
    return (
      <Prism key={Math.random().toString(36).substr(2, 16)} language={this.state.selectedLanguage}>
        {cdSource}
      </Prism>
    );
  }

  render() {
    let results = JSON.parse(this.state.executionResult);
    const message = (results && !results.url_safe_id)
      ? 'Task with same external_id already existed.'
      : '// Click Execute button above to run code';
    let externalIdErrorClass = '';
    if (this.state.missingExternalIdError === true) {
      externalIdErrorClass = styles.externalIdInputError;
    }

    return (
      <div id={this.props.data.id} className={styles.liveTrackExecuteContainer}>
        <div className={styles.contentContainer}>
          <div className={styles.subcontentContainer}>
            <Row>
              <Col md={6}>
                {this.props.data && this.props.data.title !== '' &&
                <h1>
                  {this.props.data.title}
                </h1>
                }
              </Col>
              <Col md={6} className="text-right">
                {this.renderLanguageSwitcher()}
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <div className={styles.placeholderCustom}></div>
              </Col>
            </Row>
            <Row>
              <Col md={12} className="text-right">
                <label>External ID: </label> <FormControl className={cx(styles.customInput, externalIdErrorClass)} onChange={(e) => this.onExternalIdChanged(e)} value={this.state.externalId} name="external_id" id="external_id" type="text" placeholder="External ID"/>
              </Col>
              {this.state.missingExternalIdError === true && <p className={cx(styles.externalIdErrorText, "text-right")}>
                Required Field
              </p>}
            </Row>
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
                  {(this.state.executionResult !== null && (results && results.url_safe_id && !results.description)) ? this.state.executionResult : <span>{message}</span>}
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
        </div>
        <div className={styles.liveTrackPageContainer}>
          <LiveTrackExperienceComponent
            data={this.props.data}
            loading={this.state.loadingLiveTrack}
            result={this.state.executionResult}
            entityId={this.state.entityId}
            externalId={this.state.externalId}
          />
        </div>
      </div>
    );
  }
}

LiveTrackExecute.propTypes = {
  data: PropTypes.object
};
