import React, { Component } from 'react';
import style from "../../base-styling.module.scss";
import styles from './assignees-equipment.module.scss';
import cx from 'classnames';
import Assignees from './assignees/assignees';
import Equipment from './equipment/equipment';

export default class AssigneesEquipment extends Component {
  constructor(props) {
    super(props);

    this.getRef = this.getRef.bind(this);
  }

  getRef() {
    return this.refs.node;
  }

  render() {
    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>Assignees & Equipment</h3>
        <div className={cx(style.boxBody)} ref="node">
          <div className={cx(style.boxBodyInner)}>
            <strong className={cx(styles.title)}>Assignee(s)</strong>
            <Assignees />
          </div>
          <div className={cx(style.boxBodyInner)}>
            <strong className={cx(styles.title)}>Equipment</strong>
            <Equipment />
          </div>
        </div>
      </div>
    );
  }
}