import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './worker-assignments.module.scss';
import {Alert, Tooltip, Popover, OverlayTrigger} from 'react-bootstrap';
import moment from 'moment';
import cx from 'classnames';
import SavingSpinner from '../../../saving-spinner/saving-spinner';

export default class WorkerAssignments extends Component {
  constructor(props) {
    super(props);

    this.renderAssignments = this.renderAssignments.bind(this);
    this.showResponses = this.showResponses.bind(this);
  }

  showResponses(responses) {
    if (responses.worker_request_status === 'CLOSED') {
      return {disableAcceptButton: true, disableDeclineButton: true};
    } else if ((responses.worker_request_status === 'OPEN' && responses.entity_response === 'NOT_AVAILABLE' && responses.internal_decision === 'NOT_AVAILABLE') || (responses.worker_request_status === 'OPEN' && responses.entity_response === 'APPLIED' && responses.internal_decision === 'DECLINED')) {
      return {disableAcceptButton: false, disableDeclineButton: false};
    } else if (responses.worker_request_status === 'OPEN' && responses.entity_response === 'APPLIED' && responses.internal_decision === 'ACCEPTED') {
      return {disableAcceptButton: true, disableDeclineButton: false};
    } else if (responses.worker_request_status === 'OPEN' && responses.entity_response === 'DECLINED' && responses.internal_decision === 'ACCEPTED') {
      return {disableAcceptButton: false, disableDeclineButton: true};
    }
  }

  renderAssignments() {
    String.prototype.trunc = String.prototype.trunc || function(n){
      return (this.length > n) ? this.substr(0, n-1) + '...' : this;
    };

    const assignments = this.props.worker_requests;
    if (assignments !== null && assignments.length > 0) {
      const renderedAssignments = assignments.map((worker_request) => {
        let addresses = [];
        let cities = [];
        let extra_addresses_content = null;
        let extra_address = [];
        if (worker_request.tasks_data && worker_request.tasks_data.length > 0) {
          worker_request.tasks_data.map((task) => {
            if (task.customer_address) {
              addresses.push(task.customer_address);
            }
            if (task.customer_city) {
              cities.push(task.customer_city);
            }
          });

          if (addresses && addresses.length > 2) {
            extra_address = addresses.slice(2, addresses.length);
            addresses = addresses.slice(0, 2);
            if (extra_address && extra_address.length > 0) {
              extra_addresses_content = <Popover className={styles.popover}>{extra_address.map((address, i) => {
                return (<div key={i}>{address + (i !== extra_address.length - 1 ? ', ' : '')}</div>);
              })}</Popover>;
            }
          }
        }
        let customerCities = [...new Set(cities)];

        let status = {};
        let responses = this.showResponses(worker_request.request_and_entity_status);
        let systemResponseValue = '';
        const systemResponseClass = (worker_request.request_and_entity_status.internal_decision).toLowerCase();

        if (worker_request.request_and_entity_status.entity_response && worker_request.request_and_entity_status.internal_decision === 'NOT_AVAILABLE') {
          systemResponseValue = 'Awaiting Response';
        } else if (worker_request.request_and_entity_status.internal_decision === 'ACCEPTED'){
          systemResponseValue = 'Accepted';
        } else {
          systemResponseValue = 'Rejected';
        }

        return (
          <div key={worker_request.id}  className={cx(styles.flexRow, styles.item)}>
            <div className={cx(styles.flexColumn, styles.actions)}>
              <button disabled={responses.disableAcceptButton} onClick={() => {status[worker_request.id] = 'ACCEPTED'; this.props.updateWorkerRequests(status)}} className={cx(styles.btn, styles['btn-secondary'])}>Accept</button>
              <button disabled={responses.disableDeclineButton} onClick={() => {status[worker_request.id] = 'DECLINED'; this.props.updateWorkerRequests(status)}} className={cx(styles.btn, styles['btn-outline'], styles['btn-outline-danger'])}>Decline</button>
            </div>
            <div className={cx(styles.flexColumn, styles.dateTime)}>
              <time>{worker_request.request_date}</time>
              <time>{moment.utc(worker_request.start_datetime).local().format('hh:mm A')} - {moment.utc(worker_request.end_datetime).local().format('hh:mm A')}</time>
            </div>
            {worker_request.task_ids.length > 0 && worker_request.request_and_entity_status.entity_response === 'APPLIED' && worker_request.request_and_entity_status.internal_decision === 'ACCEPTED' ?
              <div className={cx(styles.flexColumn, styles.jobLocation)}>
                {addresses && addresses.length > 0 && addresses.map((address, index) => {
                return (
                  <div key={index} className={styles.address}>
                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={'address'+index}>{address}</Tooltip>}>
                      <span>{address && address.trunc(60).trim()}</span>
                    </OverlayTrigger>
                  </div>
                );
                })}
                {extra_address && extra_address.length > 0 && <div className={styles.address}>
                  <OverlayTrigger placement="bottom" trigger={'click'} rootClose={true} overlay={extra_addresses_content}>
                    <span className={styles.seeMore}>See more</span>
                  </OverlayTrigger>
                </div>}
              </div> :
              <div className={cx(styles.flexColumn, styles.jobLocation)}>
                {customerCities && customerCities.length > 0 && customerCities.map((city, i) => {
                  return (<div key={i} className={styles.address}>{city}</div>)
                })}
              </div>
            }
            <div className={cx(styles.flexColumn, styles.requestStatus)}>
              <strong>{(worker_request.request_and_entity_status.worker_request_status).toLowerCase()}</strong>
            </div>
            <div className={cx(styles.flexColumn, styles.workerResponse)}>
              <strong>{(worker_request.request_and_entity_status.entity_response && worker_request.request_and_entity_status.entity_response === 'NOT_AVAILABLE' ? 'NOT APPLIED' : worker_request.request_and_entity_status.entity_response).toLowerCase()}</strong>
            </div>
            <div className={cx(styles.flexColumn, styles.systemResponse)}><span className={systemResponseClass ? styles[systemResponseClass] : ''}>{systemResponseValue}</span></div>
          </div>
        );
      });
      return renderedAssignments;
    } else {
      return (<div className={styles.notFoundMessage}>No Worker Request found.</div>);
    }
  }


  render() {
    return (
      <div className={styles.flexTable}>
        <div className={cx(styles.flexRow, styles.header)}>
          <div className={cx(styles.flexColumn, styles.actions)}><img src="/images/worker-request/circle.svg" alt="Icon" className={styles.icon} />Actions</div>
          <div className={cx(styles.flexColumn, styles.dateTime)}><img src="/images/task-list/clock.svg" alt="Icon" className={styles.icon} />Date & Time</div>
          <div className={cx(styles.flexColumn, styles.jobLocation)}><img src="/images/task-list/pin.svg" alt="Icon" className={styles.icon} />Job Location(s)</div>
          <div className={cx(styles.flexColumn, styles.requestStatus)}><img src="/images/worker-request/title.svg" alt="Icon" className={styles.icon} />Request Status</div>
          <div className={cx(styles.flexColumn, styles.workerResponse)}><img src="/images/worker-request/title.svg" alt="Icon" className={styles.icon} />Worker Response</div>
          <div className={cx(styles.flexColumn, styles.systemResponse)}><img src="/images/worker-request/title.svg" alt="Icon" className={styles.icon} />System Response</div>
        </div>
        <div className={styles.inner}>
          {this.props.serverActionIsPending && <SavingSpinner title={"Updating"} borderStyle="none" />}
          {this.props.updateFiled && <Alert bsStyle="danger">Update failed. Please try again.</Alert>}
          {this.props.updateSuccessful && <Alert bsStyle="success">Update successful.</Alert>}
          {this.renderAssignments()}
        </div>
      </div>
    );
  }
}

WorkerAssignments.proptTypes = {
  worker_requests: PropTypes.array,
  entities: PropTypes.array,
  updateWorkerRequests: PropTypes.func,
  serverActionIsPending: PropTypes.bool,
  updateFiled: PropTypes.bool
};
