import React, { Component } from 'react';
import styles from './equipment.module.scss';
import cx from 'classnames';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

export default class Equipment extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={cx(styles.equipmentBadgesWrapper)}>
        <div className={cx(styles.equipmentBadge)}>
          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Truck 1 (26ft)<br/>Primary Group</Tooltip>}>
            <div>Truck 1 (26ft)<span className={cx(styles.remove)} /></div>
          </OverlayTrigger>
        </div>
        <div className={cx(styles.equipmentBadge)}>
          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Scissors Lift<br/>Primary Group</Tooltip>}>
            <div>Scissors Lift<span className={cx(styles.remove)} /></div>
          </OverlayTrigger>
        </div>
        <div className={cx(styles.addBtn)} />
      </div>
    );
  }
}