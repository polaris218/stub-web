import React, {Component} from 'react';
import cx from "classnames";
import { Checkbox, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import styles from "./worker-request-details-tabs.module.scss";
import moment from 'moment';

export default class WorkerRequestResponses extends Component {
  constructor(props) {
    super(props);
    this.renderRespondents = this.renderRespondents.bind(this);
  }

  renderRespondents() {
    const entities_data = this.props.worker_request_object.entities_data;
    if (entities_data && entities_data.length > 0) {
      return entities_data.map((entity, i) => {
        const name = entity && entity.name;

        return (
          <div key={i} className={cx(styles.flexRow, styles.item)}>
            <div className={cx(styles.flexColumn, styles.name)}>
              <div className={styles.entity}>
                <div className={styles.entityImage}>
                  <img src={entity.image_path ? entity.image_path : '/images/user-default.svg'} alt={entity.name} style={{borderColor: (entity.color ? entity.color : '#348AF7')}}/>
                </div>
                <div className={styles.entityName}>
                  <OverlayTrigger placement="bottom" overlay={<Tooltip id={'entity_'+i}>{entity.name}</Tooltip>}>
                    <strong>{entity.name}</strong>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
            <div className={cx(styles.flexColumn, styles.workerResponse)}>
              <strong>{(this.props.worker_request_object.entity_confirmation_statuses && this.props.worker_request_object.entity_confirmation_statuses[entity.id] ? this.props.worker_request_object.entity_confirmation_statuses[entity.id].response === 'ACCEPTED' ? 'Applied' : 'Declined' : 'Not Applied')}</strong>
            </div>
            <div className={cx(styles.flexColumn, styles.systemResponse)}>
              {(this.props.worker_request_object.entity_confirmation_statuses && this.props.worker_request_object.entity_confirmation_statuses[entity.id] ? this.props.worker_request_object.entity_confirmation_statuses[entity.id].status === 'ACCEPTED' ? <strong className={styles.selected}>{this.props.worker_request_object.entity_confirmation_statuses[entity.id].response === 'ACCEPTED' ? 'Selected' : 'Accepted'}</strong> : <span className={styles.declined}>{'Declined'}</span> : <span className={styles.awaiting_response}>{('Awaiting Response')}</span>)}
            </div>
          </div>
        );
      });
    }
  }

  render() {
    const color = this.props.worker_request_object && this.props.worker_request_object.request_status.toLowerCase() + 'Status';

    return (
      <div className={cx(styles.flexTable, styles.ResponseTable)}>
        <div className={cx(styles.flexRow, styles.header)}>
          <div className={cx(styles.flexColumn, styles.name)}><img src="/images/worker-request/user.svg" className={styles.icon} alt="Icon" />Worker Name</div>
          <div className={cx(styles.flexColumn, styles.workerResponse)}><img src="/images/worker-request/title.svg" className={styles.icon} alt="Icon" />Worker Response</div>
          <div className={cx(styles.flexColumn, styles.systemResponse)}><img src="/images/worker-request/title.svg" className={styles.icon} alt="Icon" />System Response</div>
        </div>
        <div className={styles.requestInfo}>Request {this.props.number_of_workers_required} person(s) from {this.props.start_datetime} - {this.props.end_datetime} on {moment.utc(this.props.request_date).local().format('dddd MMM DD, YYYY')}</div>
        <h4>Respondents</h4>
        <div className={styles.inner}>
          {this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) < 0 && this.renderRespondents()}
        </div>
      </div>
    );
  }
}
