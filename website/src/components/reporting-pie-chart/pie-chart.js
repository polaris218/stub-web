import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './pie-chart.module.scss';
import cx from 'classnames';
import Keen from 'keen-js';
import { get_client, get_count_of_all_events } from '../../helpers/reporting';
import { getErrorMessage } from '../../helpers/task';

export default class PieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
    };

  }

  componentDidMount() {
    this.getMonthlyReports();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.viewType !== this.props.viewType) {
      this.getMonthlyReports(nextProps.viewType);
    }
  }

  getMonthlyReports(viewType = this.props.viewType) {
    let profileID = this.props.profile.owned_company_id || this.props.profile.owner;
    let timeFrame = this.state.monthlyInterval;
    if (viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }
    Keen.ready(function () {
      const element = document.getElementById('keen-pie-chart');
      const chart = new Keen.Dataviz()
        .el(element)
        .type('pie')
        .height(400)
        .prepare();
      get_client().run([get_count_of_all_events(timeFrame, profileID)])
        .then(res => {
          let task_create = 0;
          let task_completed = 0;
          let task_cancelled = 0;
          let task_with_exception = 0;
          let task_declined = 0;

          const ds = new Keen.Dataset();
          if (res.result !== null && res.result.length > 0) {
            res.result.map((task) => {
              if (task.event_type === 'Task Create' || task.event_type === 'Task Without Datetime Create') {
                task_create += task.result;
              } else if (task.event_type === 'Task Completed' || task.event_type === 'Task Without Datetime Completed') {
                task_completed += task.result;
              } else if (task.event_type === 'Task Cancelled' || task.event_type === 'Task Without Datetime Cancelled') {
                task_cancelled += task.result;
              } else if (task.event_type === 'Exception on Task' || task.event_type === 'Exception on Task Without Datetime') {
                task_with_exception += task.result;
              } else if (task.event_type === 'Task Declined' || task.event_type === 'Task WIthout Datetime Declined') {
                task_declined += task.result;
              }
            });
          }
          ds.set(['Task Create', 'Task Create'], task_create);
          ds.set(['Task Completed', 'Task Completed'], task_completed);
          ds.set(['Task Cancelled', 'Task Cancelled'], task_cancelled);
          ds.set(['Exception on Task', 'Exception on Task'], task_with_exception);
          ds.set(['Task Declined', 'Task Declined'], task_declined);
          chart
            .data(ds)
            .title(null)
            .render();
        })
        .catch(err => {
          if (typeof err.message === 'undefined') {
            chart
              .message(getErrorMessage(err));
          } else {
            chart
              .message(err.message);
          }
        });
    });
  }

  render() {
    return (
      <div>
        <div id="keen-pie-chart">

        </div>
      </div>
    );
  }
}

PieChart.propTypes = {
  profile: PropTypes.object,
  viewType: PropTypes.string
};
