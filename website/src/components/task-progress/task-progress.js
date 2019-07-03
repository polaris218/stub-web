import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './task-progress.module.scss';

export default class Progress extends Component {
  render() {
    return (<div>
              <h3>Progress</h3>
              <ul className={styles['task-progress']}>
                {this.props.statusList.map((status) => {
                    return <li key={status.id} className={styles['status']}></li>;
                })}
                <li className={styles['status']}> </li>
              </ul>
              <ul className={'list-inline ' + styles['task-labels']}>
                {this.props.statusList.map((status) => {
                    return <li key={status.id}>{status.type}</li>;
                })}
              </ul>
            </div>);
  }
}

Progress.propTypes = {
  statusList: PropTypes.array.isRequired
}