import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './reporting-main.module.scss';
import { Grid, Row, Col } from 'react-bootstrap';
import TaskReports from '../reporting-task-reports/task-reports';
import SentimentsAnalytics from '../reporting-sentiments-analytics/sentiments-analytics';
import TeamReports from '../team-task-reports/team-task-reports';
import { ActivityStream, ActivityStreamButtonV2 } from '../index';
import {Link} from "react-router-dom";

export default class ReportingMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: (props.pageParams.page_id != undefined) ? props.pageParams.page_id : 'task_utilization',
      view_activity_stream: false
    };
  }

  componentDidMount() {
    let permissions = null;
    let is_company = false;
    let view_activity_stream = false;
    const profile = this.props.profile;
    if (profile) {
      if (profile && profile.permissions) {
        permissions = profile.permissions
      }
      if (permissions && permissions.includes('COMPANY')) {
        is_company = true
      }
      if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
        view_activity_stream = true;
      }
    }
    this.setState({
      view_activity_stream
    });
  }

  componentWillReceiveProps(nextProps) {
  	if (!_.isEqual(this.props.pageParams, nextProps.pageParams)) {
			this.setState({
				activeTab: nextProps.pageParams.page_id,
			})
	  }
  }

  render() {
    const active_tab = this.state.activeTab;
    let taskReport = (
      <div id={'task_report'}>
            <TaskReports
              profile={this.props.profile}
              groups={this.props.groups}
            />
      </div>
    );
    let teamReport = (
      <div id={'team_report'}>
         <TeamReports
                profile={this.props.profile}
                groups={this.props.groups}
          />
      </div>
    );
    let sentimentAnalytics = (
      <div id={'sentiment_analytics'}>
           <SentimentsAnalytics
              profile={this.props.profile}
              groups={this.props.groups}
            />
      </div>
    );

    let active =  taskReport;
    switch (active_tab) {
      case 1:
        active = taskReport;
        break;
      case 'task_utilization':
        active = taskReport;
        break;
      case 2:
        active = teamReport;
        break;
      case 'team_task':
        active = teamReport;
        break;
      case 3:
        active = sentimentAnalytics;
        break;
      case 'sentiments':
        active = sentimentAnalytics;
        break;
      default:
        active = taskReport;
        break;
    }

    return (
      <div className={styles.reportingPageContainer}>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.props.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        <Grid>
          <div id="keen-example-chart">
          </div>
          <div className={styles.topBar}>
            <Row>
              <Col md={11} sm={11} xs={11}>
                <div>
                  <ul className={styles['view-sidebar'] + ' list-inline'}>
                    <li data-active = {active_tab === "task_utilization" || active_tab === 1} className={this.state.activeTab === 'task_utilization' ? styles.active : ''}>
                      <Link to={'/reporting/task_utilization'}>
                      <span>Task/Utilization Reports</span>
                      </Link>
                    </li>

                    <li data-active = {active_tab === "team_task" || active_tab === 2} className={this.state.activeTab === 'team_task' ? styles.active : ''} >
                      <Link to={'/reporting/team_task'}>
                      <span>Performance</span>
                      </Link>
                    </li>
                    <li data-active = {active_tab === "sentiments" || active_tab === 3}  className={this.state.activeTab === 'sentiments' ? styles.active : ''} >
                      <Link to={'/reporting/sentiments'}>
                      <span>Customer Ratings</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </Col>
              <Col md={1} sm={1} xs={1}>
                <div className={styles.activityStreamBtnContainer}>
                  <ActivityStreamButtonV2 activityStreamStateHandler={this.props.activityStreamStateHandler} />
                </div>
              </Col>
            </Row>
          </div>
          {active}
        </Grid>
      </div>
    );
  }
}

ReportingMain.propTypes = {
  equipments: PropTypes.array,
  profile: PropTypes.object,
};
