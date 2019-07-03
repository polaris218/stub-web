import React, { Component } from 'react';
import styles from './live-track-experience.module.scss';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import LiveTrackV2 from '../../../../containers/livetrackv2/live-track-v2';
import { Row, Col } from 'react-bootstrap';
import { Accordion, AccordionItem, AccordionItemTitle, AccordionItemBody } from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import Prism from '@maji/react-prism';
import { executeCode } from '../../../../actions';
import moment from "moment/moment";
import PropTypes from 'prop-types';

const locationPoints = [
  { 'lat':47.704212 ,'lng':-122.175873 },
  { 'lat':47.708832 ,'lng':-122.176002 },
  { 'lat':47.710942 ,'lng':-122.182383 },
  { 'lat':47.714138 ,'lng':-122.184654 },
  { 'lat':47.716571 ,'lng':-122.186047 },
  { 'lat':47.725224 ,'lng':-122.189148 },
  { 'lat':47.734308 ,'lng':-122.187876 },
  { 'lat':47.746134 ,'lng':-122.183180 },
  { 'lat':47.746629 ,'lng':-122.183163 },
  { 'lat':47.746601 ,'lng':-122.182997 },
  { 'lat':47.74659949999999 ,'lng':-122.1829902 }
];

export default class LiveTrackExperienceComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      executingCode: false,
      executionResult: null,
      executionError: null,
      count: 0
    };

    this.renderSteps = this.renderSteps.bind(this);
    this.handleStatusCodeExecution = this.handleStatusCodeExecution.bind(this);
    this.startLocationReportingScript = this.startLocationReportingScript.bind(this);

  }

  startLocationReportingScript() {
    const locations = locationPoints;
    let cdSource = null;
    const rawFile = new XMLHttpRequest();
    rawFile.open('GET', '/docs/example-location-reporting.code', false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status === 0) {
          cdSource = rawFile.responseText;
        }
      }
    };
    rawFile.send(null);
    const time = moment(new Date()).toISOString(true);
    cdSource = cdSource.replace(new RegExp('TIME', 'g'), time);
    cdSource = cdSource.replace(new RegExp('ENTITY_ID', 'g'), this.props.entityId);
    cdSource = cdSource.replace(new RegExp('LAT', 'g'), locations[this.state.count].lat);
    cdSource = cdSource.replace(new RegExp('LNG', 'g'), locations[this.state.count].lng);
    const language = 0;
    const source_code = cdSource;
    let count = this.state.count;
    if (this.state.count < locationPoints.length) {
      count++;
    } else {
      count = 0;
    }
    executeCode({ language, source_code }).then((res) => {
      const executeResult = JSON.parse(res).result;
      this.setState({
        executingCode: false,
        executionResult: executeResult,
        executionError: null,
        count: count
      }, () => {
        this.liveTrack.fetchContent();
        if (this.state.count < locationPoints.length) {
          setTimeout(() => this.startLocationReportingScript(), 3000);
        }
      });
    }).catch((err) => {
      console.log(err);
      const response = JSON.parse(err.responseText);
      this.setState({
        executionError: response.result,
        executingCode: false
      });
    });
  }


  handleStatusCodeExecution(e, content, actionType) {
    e.stopPropagation();
    e.preventDefault();
    if (actionType === 'location') {
      this.startLocationReportingScript();
    } else {
      this.setState({
        executingCode: true
      });
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
      const time = moment(new Date()).toISOString(true);
      // let results = JSON.parse(this.props.result);
      // if (results) {
      //   results = results['Task Result'].response[0];
      // }
      cdSource = cdSource.replace(new RegExp('TIME', 'g'), time);
      cdSource = cdSource.replace(new RegExp('EXTERNAL_ID', 'g'), this.props.externalId);
      cdSource = cdSource.replace(new RegExp('ENTITY_ID', 'g'), this.props.entityId);
      const language = 0;
      const source_code = cdSource;
      executeCode({ language, source_code }).then((res) => {
        const executeResult = JSON.parse(res).result;
        this.setState({
          executingCode: false,
          executionResult: executeResult,
          executionError: null
        }, () => { this.liveTrack.fetchContent(); });
      }).catch((err) => {
        console.log(err);
        const response = JSON.parse(err.responseText);
        this.setState({
          executionError: response.result,
          executingCode: false
        });
      });
    }
  }

  renderSteps() {
    const steps = this.props.data.subcomponents;
    const stepsRendered = steps.map((step, index) => {
      let cdSource = null;
      const content = step.content;
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
        <AccordionItem>
          <AccordionItemTitle className={styles.accordialTitle}>
            <div className={styles.accordianTitleContainer}>
              <h3>{step.title}</h3>
              <button onClick={(e) => this.handleStatusCodeExecution(e, step.content, step.type) } className={styles.executeBtnSM}>
                Execute
              </button>
            </div>
          </AccordionItemTitle>
          <AccordionItemBody className={styles.accordianBody}>
            <div className={styles.accordianBodyContainer}>
              <p>
                {step.description}
              </p>
              <div className={styles.codeContainer}>
                <Prism language="javascript">
                  {cdSource}
                </Prism>
              </div>
              <button onClick={(e) => this.handleStatusCodeExecution(e, step.content, step.type) } className={styles.executeBtn}>
                {!this.state.executingCode
                  ?
                  <span>Execute</span>
                  :
                  <span><SavingSpinner color="#24ab95" title="" borderStyle="none" size={8} /> Executing</span>
                }
              </button>
            </div>
          </AccordionItemBody>
        </AccordionItem>
      );
    });
    const accordians = (
      <Accordion >
        {stepsRendered}
      </Accordion>
    );
    return accordians;
  }

  render() {
    let results = JSON.parse(this.props.result);
    const params = {
      params: {
        company_name: 'Arrivy',
        task_url: results !== null ? results.url_safe_id : null
      }
    };
    return (
      <div className={styles.liveTrackExpComponent}>
        {this.props.loading && results.url_safe_id &&
          <div className={styles.savingSpinnerContainer}>
            <SavingSpinner title="Loading live track experience" size="8" borderStyle="none" />
          </div>
        }
        {!this.props.loading && this.props.result !== null && results.url_safe_id &&
          <div className={styles.stepsContainer}>
            <Row>
              <Col md={8}>
                <LiveTrackV2
                  match={params}
                  useSandboxUrl={false}
                  showFooter={false}
                  showCompanyProfileWidget={false}
                  ref={(reference) => this.liveTrack = reference}
                />
              </Col>
              <Col md={4}>
                <div className={styles.liveTrackSidebarContainer}>
                  {this.renderSteps()}
                </div>
              </Col>
            </Row>
          </div>
        }
      </div>
    );
  }
}

LiveTrackExperienceComponent.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool,
  result: PropTypes.string,
  externalId: PropTypes.string
};
