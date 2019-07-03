import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './worker-request-confirmation.module.scss';
import { DefaultHelmet } from '../../helpers';
import EntityWorkerRequestConfirmationMain  from '../../components/entity-worker-request-confirmation-main/entity-confirmation-main';
import {SlimFooterV2} from '../../components';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { fetchWorkerRequestForConfirmation, updateWorkerRequestConfirmation } from '../../actions';
import { Alert } from 'react-bootstrap';
import moment from 'moment';
import { parseQueryParams } from '../../helpers';

export default class WorkerRequestConfirmation extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      profile: null,
      contentLoaded: false,
      entity: null,
      worker_requests: null,
      date: null,
      serverActionIsPending: false,
      pageLoadError: false,
      updateFiled: false,
      updateSuccessful: false,
      errorMessage: null,
      timer: null,
    };
    this.updateWorkerRequestConfirmationOnServer = this.updateWorkerRequestConfirmationOnServer.bind(this);
    this.getContentForEntityConfirmation = this.getContentForEntityConfirmation.bind(this);
    this.clearAlerts = this.clearAlerts.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.getAjaxCall = this.getAjaxCall.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);
  }

  componentDidMount() {
    this.setTimer = true;
    document.addEventListener('visibilitychange', this.visibilityChanged);
    this.getContentForEntityConfirmation();
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 3e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
      });
    } else {
      clearTimeout(timer);
    }
  }

  componentWillUnmount() {
    this.setTimer = false;
    this.clearAsyncUpdate();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
  }

  visibilityChanged() {
    if (document.hidden) {
      this.clearAsyncUpdate();
    } else {
      this.clearAsyncUpdate();
      this.startAsyncUpdate();
    }
  }

  startAsyncUpdate() {
    this.getContentForEntityConfirmation();
  }

  clearAsyncUpdate() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }

  clearAlerts() {
    this.setState({
      updateFailed: false,
      updateSuccessful: false
    });
  }

  handleDateChange(date) {
    this.setState({
      date
    }, () => { this.getContentForEntityConfirmation(moment(date).format('YYYY-MM-DD')); });
  }

  getAjaxCall(call) {
    this.callInProgress = call;
  }

  getContentForEntityConfirmation(queryDate = null) {
    this.setState({
      pageLoadError: false
    });
    const query = parseQueryParams(this.props.location.search);
    const url_safe_id = this.props.match.params.entity_url_safe_id;
    const request_date = queryDate !== null ? queryDate : query.date;
    fetchWorkerRequestForConfirmation(url_safe_id, request_date, this.getAjaxCall).then((confirmationPageContent) => {
      const confirmationWorkerRequests = JSON.parse(confirmationPageContent);
      this.setState({
        entity: confirmationWorkerRequests.entity,
        worker_requests: confirmationWorkerRequests.worker_requests,
        date: confirmationWorkerRequests.date,
        contentLoaded: true
      });
    }).catch((err) => {
      let errorMessage = 'Could not load content at the moment. Try again.';
      console.log(err);
      this.setState({
        contentLoaded: false,
        pageLoadError: true,
        serverActionIsPending: false,
        errorMessage
      });
    });
  }

  updateWorkerRequestConfirmationOnServer(updatedRequests) {
    this.setState({
      serverActionIsPending: true,
      updateFiled: false
    });
    updateWorkerRequestConfirmation(this.props.match.params.entity_url_safe_id, JSON.stringify(updatedRequests)).then((res) => {
      this.setState({
        serverActionIsPending: false,
        updateSuccessful: true
      }, () => {
        this.getContentForEntityConfirmation(this.state.date);
        setTimeout(() => {
          this.clearAlerts();
        }, 8e3);
      });
    }).catch((err) => {
      this.setState({
        updateFiled: true,
        updateSuccessful: false
      });
    });
  }

  render() {
    return (
      <div className={styles.pageWrap}>
        <DefaultHelmet />
        <header className={styles.header}>
          <a href="/" className={styles.logo}>
            <img src="/images/logo-dark.png" alt="Arrivy"/>
          </a>
        </header>
        <main>
          {!this.state.contentLoaded && !this.state.pageLoadError &&
            <SavingSpinner title={"Loading content"} borderStyle="none" />
          }
          {this.state.pageLoadError &&
            <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
          }
          {this.state.contentLoaded &&
            <EntityWorkerRequestConfirmationMain
              entity={this.state.entity}
              worker_requests={this.state.worker_requests}
              date={this.state.date}
              serverActionIsPending={this.state.serverActionIsPending}
              updateWorkerRequests={this.updateWorkerRequestConfirmationOnServer}
              updateFiled={this.state.updateFiled}
              updateSuccessful={this.state.updateSuccessful}
              updateDate={this.handleDateChange}
            />
          }
        </main>
        <footer className={styles.footer}>
          <SlimFooterV2 />
        </footer>
      </div>
    );
  }
}

WorkerRequestConfirmation.contextTypes = {
  router: PropTypes.object.isRequired,
};

WorkerRequestConfirmation.propTypes = {
  params: PropTypes.object.isRequired
};
