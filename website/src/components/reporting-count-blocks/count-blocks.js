import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './count-blocks.module.scss';
import { Grid, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import cx from 'classnames';
import Keen from 'keen-js';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faListUl, faClock, faTasks, faBan, faHandPaper } from '@fortawesome/fontawesome-free-solid';

export default class CountBlocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      cancelledTasks: 0,
      totalTasks: 0,
      completedTasks: 0,
      declinedTasks: 0,
      totalTimePerJob: 0,
      tasksWithException: 0,
      exceptionOnTasks: 0,
      avgTimePerJob: {
        result: 0
      },
      monthlyReport: null
    };
    this.generateMonthlyReportsData = this.generateMonthlyReportsData.bind(this);
  }

  componentDidMount() {
    this.getMonthlyReports();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.viewType !== this.props.viewType) {
      this.getMonthlyReports();
    }
  }

  getMonthlyReports() {
    const client = new Keen({
      projectId: '5a47257446e0fb00018e2cf7',
      readKey: '55FB4DAEB1012EF9273FC290916E6321BDD1B76A13D11BDEDB73766B3B8106612F5E98F9436BFAD669E26E60BABABA2FA2053F9B9211572AFF38F70DD2FECB7EB504A13AD1013C387781B58E0336BC64A0E12616C27F8333D3762B8BB15DF89A'
    });
    let profileID = this.props.profile.owned_company_id || this.props.profile.owner;

    let timeFrame = this.state.monthlyInterval;
    if (this.props.viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.props.viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }
    client
      .query("count", {
        event_collection: profileID + '',
        filters: [{ 'operator':'eq', 'property_name':'owner', 'property_value':profileID }],
        group_by: ['event_type'],
        timeframe: timeFrame,
        timezone: 18000
      })
      .then(res => {
        this.generateMonthlyReportsData(res);
        this.setState({
          monthlyReport: res
        });
      })
      .catch(err => {
        console.log(err);
      });

    client
      .query("average", {
        event_collection: profileID + '',
        filters: [{ 'operator':'eq', 'property_name':'owner', 'property_value':profileID }],
        target_property: 'task_time',
        timeframe: timeFrame,
        timezone: 18000
      })
      .then(res => {
        this.setState({
          avgTimePerJob: res
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  generateMonthlyReportsData(monthlyReportsData = this.state.monthlyReport) {
    if (monthlyReportsData !== null) {
      let { cancelledTasks, totalTasks, completedTasks, declinedTasks, totalTimePerJob, tasksWithException, exceptionOnTasks } = this.state;
      monthlyReportsData.result.forEach((el) => {
        if (el.event_type === 'Task Create') {
          totalTasks = el.result;
        } else if (el.event_type === 'Task Completed') {
          completedTasks = el.result;
        } else if (el.event_type === 'Task Declined') {
          declinedTasks = el.result;
        } else if (el.event_type === 'Task Exception') {
          tasksWithException = el.result;
        } else if (el.event_type === 'Task Cancelled') {
          cancelledTasks = el.result;
        } else if (el.event_type === 'Exception on Task') {
          exceptionOnTasks = el.result;
        }
      });
      this.setState({
        cancelledTasks,
        totalTasks,
        completedTasks,
        declinedTasks,
        totalTimePerJob,
        tasksWithException,
        exceptionOnTasks
      });
    }
  }

  render() {
    return (
      <div className={styles.reportingBlocksContainer}>
        <Grid>
          <Row>
            <Col md={4} xs={12} className={styles.customColumnPadding}>
              <div className={cx(styles.reportingBlock, styles.blockOne)}>
                <span>
                  <FontAwesomeIcon icon={faListUl} />
                </span>
                <span className={styles.countValue}>
                  {this.state.totalTasks}
                </span>
                <span className={styles.countCounter}>
                  Total Tasks
                </span>
              </div>
            </Col>
            <Col md={4} xs={12} className={styles.customColumnPadding}>
              <div className={cx(styles.reportingBlock, styles.blockTwo)}>
                <span>
                  <FontAwesomeIcon icon={faClock} />
                </span>
                <span className={styles.countValue}>
                  {this.state.avgTimePerJob.result !== null ? this.state.avgTimePerJob.result.toFixed(2) : 0}
                </span>
                <span className={styles.countCounter}>
                  Average Time Per Job <small>(In MIN)</small>
                </span>
              </div>
            </Col>
            <Col md={4} xs={12} className={styles.customColumnPadding}>
              <div className={cx(styles.reportingBlock, styles.blockThree)}>
                <span>
                  <FontAwesomeIcon icon={faTasks} />
                </span>
                <span className={styles.countValue}>
                  {this.state.completedTasks}
                </span>
                <span className={styles.countCounter}>
                  Completed Tasks
                </span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={4} xs={12} className={styles.customColumnPadding}>
              <div className={cx(styles.reportingBlock, styles.blockFour)}>
                <span>
                  <FontAwesomeIcon icon={faBan} />
                </span>
                <span className={styles.countValue}>
                  {this.state.cancelledTasks}
                </span>
                <span className={styles.countCounter}>
                  Cancelled Tasks
                </span>
              </div>
            </Col>
            <Col md={4} xs={12} className={styles.customColumnPadding}>
              <div className={cx(styles.reportingBlock, styles.blockFive)}>
                <span>
                  <FontAwesomeIcon icon={faHandPaper} />
                </span>
                <span className={styles.countValue}>
                  {this.state.declinedTasks}
                </span>
                <span className={styles.countCounter}>
                  Declined Tasks
                </span>
              </div>
            </Col>
            <Col md={4} xs={12} className={styles.customColumnPadding}>
              <div className={cx(styles.reportingBlock, styles.blockSix)}>
                <span>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </span>
                <span className={styles.countValue}>
                  {this.state.exceptionOnTasks}
                </span>
                <span className={styles.countCounter}>
                  Exceptions
                </span>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

CountBlocks.propTypes = {
  profile: PropTypes.object,
  viewType: PropTypes.string
};
