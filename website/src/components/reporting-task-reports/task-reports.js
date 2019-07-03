import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './task-reports.module.scss';
import { Grid, Row, Col } from 'react-bootstrap';
import TimeGraph from './components/time-graph/time-graph';
import TeamUtilizationChart from './components/team-utilization-chart/team-utilization-chart';
import MileageReports from '../reporting-mileage-reports/mileage-reports';
import ReportingUtilization from '../reporting-utilization/reporting-utilization';
import DropdownFilter from '../dropdown-filter/dropdown-filter';
import OnTimePerformanceChart from '../on-time-performance-chart/on-time-performance-chart';
import TaskDurationReport from '../task-duration-report/task-duration-report';

export default class TaskReports extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedGroupsFilter: null,
      groups: null
    };
    this.groupsFilterChanged = this.groupsFilterChanged.bind(this);
  }

  groupsFilterChanged(selectedGroups) {
    this.setState({
      selectedGroupsFilter: selectedGroups.map(group => group.id)
    });
  }

  render() {
    this.can_view_group_filter = false;
    const groups = [];
    if (this.props.groups) {
      this.can_view_group_filter = true;
        this.props.groups.map(group => {
          groups.push({
              name: group.name,
              id: group.id
          });
      });
    }

    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 1) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 0) {
      showGroupDropdown = true;
    }

    return (
      <div className={styles.taskReportsContainer}>
        <Grid>
          <Row className={styles.pageIntroContainer}>
            <Col sm={6}>
              <h2>Task/Utilization Reports</h2>
            </Col>
            <Col sm={3} smOffset={3} className={styles.groupFilter}>
              {this.can_view_group_filter && showGroupDropdown &&
              <div>
                <DropdownFilter
                  name="groupFilter"
                  data={groups}
                  handleChange={this.groupsFilterChanged}
                  title="Groups"
                  searchable
                  minWidth="120px"/>
              </div>
              }
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <ReportingUtilization
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <TimeGraph
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <TeamUtilizationChart
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <MileageReports
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}

TaskReports.propTypes = {
  profile: PropTypes.object,
};
