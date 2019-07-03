import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './entity-confirmation-main.module.scss';
import WorkerEntityInformation from './components/entity-information/entity-information';
import WorkerAssignments from './components/assignments/worker-assignments';

export default class EntityWorkerRequestConfirmationMain extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <WorkerEntityInformation
          entity={this.props.entity}
          date={this.props.date}
          updateDate={this.props.updateDate}
        />
        <WorkerAssignments
          worker_requests={this.props.worker_requests}
          updateWorkerRequests={this.props.updateWorkerRequests}
          serverActionIsPending={this.props.serverActionIsPending}
          updateFiled={this.props.updateFiled}
          updateSuccessful={this.props.updateSuccessful}
        />
      </div>
    );
  }
}

EntityWorkerRequestConfirmationMain.propTypes = {
  entity: PropTypes.object,
  date: PropTypes.string,
  worker_requests: PropTypes.array,
  updateWorkerRequests: PropTypes.func,
  serverActionIsPending: PropTypes.bool,
  updateFiled: PropTypes.bool,
  updateSuccessful: PropTypes.bool,
  updateDate: PropTypes.func
};
