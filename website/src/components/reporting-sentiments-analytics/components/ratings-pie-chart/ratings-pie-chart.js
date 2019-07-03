import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './ratings-pie-chart.module.scss';
import Keen from 'keen-js';
import { get_client, get_task_ratings } from '../../../../helpers/reporting';
import { getErrorMessage } from '../../../../helpers/task';

export default class RatingsPieChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      viewType: this.props.viewType
    };

    this.generateRatingsGraph = this.generateRatingsGraph.bind(this);
  }

  componentDidMount() {
    this.generateRatingsGraph();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.viewType !== this.props.viewType) {
      this.setState({
        viewType: nextProps.viewType,
      }, () => {
        this.generateRatingsGraph();
      });
    }
  }

  generateRatingsGraph() {
    let profileID = this.props.profile.owned_company_id || this.props.profile.owner;

    let timeFrame = this.state.monthlyInterval;
    if (this.state.viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }
    Keen.ready(function () {
      const element = document.getElementById('ratingsPieChart');
      const chart = new Keen.Dataviz()
        .el(element)
        .height(400)
        .title('rating')
        .type('pie')
        .prepare();
      get_client().run([get_task_ratings(timeFrame, profileID)])
        .then(res => {
          chart
            .data(res)
            .call(function () {
              this.dataset.updateColumn(0, function (value, index, column) {
                return value + ' Star';
              });
            })
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
      <div className={styles.ratingsGraphContainer}>
        <div id="ratingsPieChart"></div>
      </div>
    );
  }

}

RatingsPieChart.propTypes = {
  profile: PropTypes.object,
  viewType: PropTypes.string
};
