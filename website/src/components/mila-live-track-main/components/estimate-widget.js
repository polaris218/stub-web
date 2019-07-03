import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './estimate-widget.module.scss';
import { Grid, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { ESTIMATE_MESSAGES, TASK_WITH_NO_DATETIME_MESSAGE } from '../../../helpers/mila-translations';
import cx from 'classnames';

export default class EstimateWidget extends Component {
  constructor(props) {
    super(props);
    this.renderEstimateMessages = this.renderEstimateMessages.bind(this);
  }

  renderEstimateMessages() {
    const { status, estimate, task } = this.props;
    let langParam = 'EN';
    if (this.props.lang && this.props.lang !== '' && (this.props.lang === 'DE' || this.props.lang === 'EN' || this.props.lang === 'FR' || this.props.lang === 'IT')) {
      langParam = this.props.lang;
    }

    let dateFormat = 'MMMM DD, hh:mm A';
    if (langParam === 'DE') {
      dateFormat = 'DD. MMMM, HH:mm';
    } else if (langParam === 'FR') {
      dateFormat = 'DD. MMMM, HH:mm';
    } else if (langParam === 'IT') {
      dateFormat = 'DD. MMMM, HH:mm';
    }

    const messagesArray = ESTIMATE_MESSAGES;

    let displayMessage = '';
    switch (task.status) {
      case 'ENROUTE':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{this.props.task.start_datetime_original_iso_str !== '' && this.props.task.start_datetime_original_iso_str !== null && <h2>{moment.utc(this.props.task.start_datetime_original_iso_str).local().format(dateFormat)}</h2>}</h2>
          </div>
        );
        break;
      case 'STARTED':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{messagesArray[task.status][langParam].secondary}</h2>
          </div>
        );
        break;
      case 'AUTO_START':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{messagesArray[task.status][langParam].secondary}</h2>
          </div>
        );
        break;
      case 'COMPLETE':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{messagesArray[task.status][langParam].secondary}</h2>
          </div>
        );
        break;
      case 'AUTO_COMPLETE':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{messagesArray[task.status][langParam].secondary}</h2>
          </div>
        );
        break;
      case 'CANCELLED':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{messagesArray[task.status][langParam].secondary}</h2>
          </div>
        );
        break;
      case 'CUSTOMER_EXCEPTION':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{messagesArray[task.status][langParam].secondary}</h2>
          </div>
        );
        break;
      case 'EXCEPTION':
        displayMessage = (
          <div>
            <h3>{messagesArray[task.status][langParam].primary}</h3>
            <h2>{messagesArray[task.status][langParam].secondary}</h2>
          </div>
        );
        break;
      default:
        displayMessage = (
          <div>
            <h3>{messagesArray['ARRIVALDATETIME'][langParam].primary}</h3>
            {this.props.task.start_datetime_original_iso_str !== '' && this.props.task.start_datetime_original_iso_str !== null && <h2>{moment.utc(this.props.task.start_datetime_original_iso_str).local().format(dateFormat)}</h2>}
            {(this.props.task.start_datetime_original_iso_str === '' || this.props.task.start_datetime_original_iso_str === null) && <h2>{TASK_WITH_NO_DATETIME_MESSAGE[langParam]}</h2>}
          </div>
        );
    }
    return displayMessage;
  }

  render() {

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    return (
      <div className={styles.estimateWidgetContainer}>
        <Grid>
          <Row>
            <Col md={12} sm={12} xs={12}>
              {this.renderEstimateMessages()}
              {iOS && this.props.showChatWidget &&
                <a id="modalPositionEL" onClick={() => this.props.toggleModal(true)} className={cx(styles.chatButton)}>
                  <img src="/images/enterprise/mila_chat.png" />
                </a>
              }
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
