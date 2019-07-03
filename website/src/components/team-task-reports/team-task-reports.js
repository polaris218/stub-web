import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './team-task-reports.module.scss';
import { Grid, Row, Col } from 'react-bootstrap';
import DropdownFilter from '../dropdown-filter/dropdown-filter';
import OnTimePerformanceChart from '../on-time-performance-chart/on-time-performance-chart';
import IndividualTeamMemberChart from '../individual-team-member-chart/individual-team-member-chart'
import TeamUtilizationChart from "../reporting-task-reports/components/team-utilization-chart/team-utilization-chart";

export default class TeamReports extends Component {
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
    if (this.props.groups && typeof this.props.groups !== 'undefined') {
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
              <h2>Performance</h2>
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
              <OnTimePerformanceChart
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
                <IndividualTeamMemberChart
                  profile={this.props.profile}
                  group_ids={this.state.selectedGroupsFilter}
                  scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
                />
            </Col>
          </Row>
           {/*<Row>*/}
            {/*<Col md={12}>*/}
              {/*<TaskDurationReport*/}
                {/*profile={this.props.profile}*/}
                {/*group_ids={this.state.selectedGroupsFilter}*/}
                {/*scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}*/}
              {/*/>*/}
            {/*</Col>*/}
          {/*</Row>*/}
        </Grid>
      </div>
    );
  }
}

TeamReports.propTypes = {
  profile: PropTypes.object,
};
