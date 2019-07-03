import React, { Component } from 'react';
import style from '../../base-styling.module.scss';
import styles from './summary.module.scss';
import cx from 'classnames';
import SavingSpinner from "../../../saving-spinner/saving-spinner";

export default class Summary extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let profile = this.props.profile;
    let mileageUnit = (profile && profile.mileage_unit) ? profile.mileage_unit.toLowerCase() : ' miles';
    mileageUnit = mileageUnit.replace('s', '(s)');
    const iconClock = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><g transform="translate(-5 -5)"><path d="M13.5,5A8.5,8.5,0,1,0,22,13.5,8.489,8.489,0,0,0,13.5,5Zm3.438,11.994a.867.867,0,0,1-1.209,0l-3.136-3.136v-5.1a.85.85,0,1,1,1.7,0v4.4L16.938,15.8A.855.855,0,0,1,16.938,16.994Z"/></g></svg>,
          iconRoad  = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 16.925"><g transform="translate(-4.7 -4.9)"><path data-name="Path 798" d="M14.082,4.9V6.307a.882.882,0,0,1-1.764,0V4.9a8.508,8.508,0,0,0,.019,16.925V20.418a.882.882,0,0,1,1.764,0v1.407A8.51,8.51,0,0,0,14.082,4.9Zm0,12.591a.882.882,0,0,1-1.764,0V14.826a.882.882,0,1,1,1.764,0Zm0-5.592a.882.882,0,0,1-1.764,0V9.234a.882.882,0,1,1,1.764,0Z"/></g></svg>;
    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>{this.props.gettingSummary ? <SavingSpinner title="Loading Summary" borderStyle="none" className={styles.textLeft} /> : 'Summary'}</h3>
        <div className={cx(style.boxBody)}>
          {/*here null check is good as time can be 0*/}
          {(this.props.totalTime !==  null && this.props.taskTime !==  null && this.props.travelTime !==  null) ?
            <ul className={cx(styles.summaryWrapper)}>
              <li>
                <div className={cx(styles.summary)}>
                  <strong className={cx(styles.title)}>
                    {iconClock}Total Time</strong>
                  <div className={cx(styles.detail)}>{Math.floor((this.props.totalTime / 60)) + ' hr(s) '+ this.props.totalTime % 60 + ' min(s)'}</div>
                </div>
              </li>
              <li>
                <div className={cx(styles.summary)}>
                  <strong className={cx(styles.title)}>
                    {iconClock}Task Time</strong>
                  <div className={cx(styles.detail)}>{Math.floor((this.props.taskTime / 60)) + ' hr(s) '+ this.props.taskTime % 60 + ' min(s)'}</div>
                </div>
              </li>
              <li>
                <div className={cx(styles.summary)}>
                  <strong className={cx(styles.title)}>
                    {iconClock}Travel Time</strong>
                  <div className={cx(styles.detail)}>{Math.floor((this.props.travelTime / 60)) + ' hr(s) '+ this.props.travelTime % 60 + ' min(s)'}</div>
                </div>
              </li>
              <li>
                <div className={cx(styles.summary)}>
                  <strong className={cx(styles.title)}>
                    {iconRoad}Mileage</strong>
                  <div className={cx(styles.detail)}>{this.props.mileage.toFixed(2)+' '+mileageUnit}</div>
                </div>
              </li>
            </ul>
          : <div className={cx(styles.emptyText)}>No Summary</div>}
        </div>
      </div>
    );
  }
}
