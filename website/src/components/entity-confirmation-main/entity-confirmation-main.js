import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './entity-confirmation-main.module.scss';
import EntityInformation from './components/entity-information/entity-information';
import Assignments from './components/assignments/assignments';

export default class EntityConfirmationMain extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <EntityInformation
          entity={this.props.entity}
          date={this.props.date}
          updateDate={this.props.updateDate}
        />
        <Assignments
          tasks={this.props.tasks}
          entities={this.props.crew}
          updateTasks={this.props.updateTasks}
          serverActionIsPending={this.props.serverActionIsPending}
          updateFiled={this.props.updateFiled}
          updateSuccessful={this.props.updateSuccessful}
        />
      </div>
    );
  }
}

EntityConfirmationMain.propTypes = {
  entity: PropTypes.object,
  date: PropTypes.string,
  tasks: PropTypes.array,
  crew: PropTypes.array,
  updateTasks: PropTypes.func,
  serverActionIsPending: PropTypes.bool,
  updateFiled: PropTypes.bool,
  updateSuccessful: PropTypes.bool,
  updateDate: PropTypes.func
};
