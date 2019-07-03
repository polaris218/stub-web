import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import styles from './time-mileage.module.scss';
import moment from 'moment';
import cx from "classnames";
import style from "../../base-styling.module.scss";

export default class TimeMileage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let timeMileage = this.props && this.props.timeMileage,
        totalTimeInMins = 0,
        totalMileage = 0,
        totalHours = 0,
        totalMinutes = 0;
    let profile = this.props.profile;
    let mileageUnit = (profile && profile.mileage_unit) ? profile.mileage_unit.toLowerCase() : ' miles';
    mileageUnit = mileageUnit.replace('s', '(s)');
      return (
        <div className={cx(style.box)}>
          <div className={cx(style.boxBody)}>
            <div className={cx(style.boxBodyInner)}>
              <div className={cx(styles.heightSetting)}>
                <Table class="table" striped hover size="sm">
                  <thead>
                  <tr>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Elapsed Time</th>
                    <th>Mileage</th>
                  </tr>
                  </thead>
                  <tbody>
                  {timeMileage &&
                  timeMileage.map((timemileage) => {
                    let minTime = moment.utc(timemileage.datetime).local().format('DD-MMM-YYYY hh:mm A');
                    let dateTime = minTime.split(" ");
                    let date = dateTime[0];
                    totalTimeInMins += timemileage.elapsed_time;
                    let time = dateTime[1] + ' ' + dateTime[2];
                    let hours = timemileage.elapsed_time / 60;
                    let minutes = timemileage.elapsed_time % 60;
                    totalHours = totalTimeInMins / 60;
                    totalMinutes = totalTimeInMins % 60;
                    totalMileage += timemileage.mileage;
                    return (
                      <tr>
                        <td>{timemileage.status}</td>
                        <td>{date}</td>
                        <td>{time}</td>
                        <td>{parseInt(hours) + ' hr(s) ' + minutes + ' min(s)'}</td>
                        <td>{timemileage.mileage.toFixed(2) + ' ' + mileageUnit}</td>
                      </tr>
                    );
                  })
                  }
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={3} className="text-uppercase">Total</th>
                      <td>{parseInt(totalHours) + ' hr(s) ' + totalMinutes + ' min(s)'}</td>
                      <td>{totalMileage.toFixed(2)  + ' '+ mileageUnit}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
