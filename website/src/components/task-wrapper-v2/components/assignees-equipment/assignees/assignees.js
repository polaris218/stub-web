import React, { Component } from 'react';
import styles from './assignees.module.scss';
import cx from 'classnames';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

export default class Assignees extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={cx(styles.assigneeWrapper)}>
        <div className={cx(styles.assignee)}>
          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip">Pending Release</Tooltip>}>
            <figure className={cx(styles.assigneeImg)}>
              <img src="/images/user.png" alt="image" style={{borderColor: '#348AF7'}} />
              <span className={cx(styles.remove)} />
            </figure>
          </OverlayTrigger>
          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Eddie W<br/>Primary Group</Tooltip>}>
            <div>
              <div className={cx(styles.name)}>Eddie W</div>
              <div className={cx(styles.type)}>Mover</div>
            </div>
          </OverlayTrigger>
        </div>
        <div className={cx(styles.assignee)}>
          <figure className={cx(styles.assigneeImg)}>
            <img src="/images/user.png" alt="image" style={{borderColor: '#1BC59D'}} />
            <span className={cx(styles.remove)} />
          </figure>
          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">George E<br/>Primary Group</Tooltip>}>
            <div>
              <div className={cx(styles.name)}>George E</div>
              <div className={cx(styles.type)}>Mover</div>
            </div>
          </OverlayTrigger>
        </div>
        <div className={cx(styles.assignee)}>
          <figure className={cx(styles.assigneeImg)}>
            <img src="/images/user.png" alt="image" style={{borderColor: '#348AF7'}} />
            <span className={cx(styles.remove)} />
          </figure>
          <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Jack W<br/>Primary Group</Tooltip>}>
            <div>
              <div className={cx(styles.name)}>Jack W</div>
              <div className={cx(styles.type)}>Mover</div>
            </div>
          </OverlayTrigger>
        </div>
        <div className={cx(styles.assignee)}>
          <figure className={cx(styles.assigneeImg)}>
            <img src="/images/user.png" alt="image" style={{borderColor: '#FF0000'}} />
            <span className={cx(styles.remove)} />
          </figure>
          <div className={cx(styles.name)}>Robert S</div>
          <div className={cx(styles.type)}>Supervisor</div>
        </div>
        <div className={cx(styles.addBtn)} />
      </div>
    );
  }
}