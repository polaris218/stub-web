import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Col, Row, Grid } from 'react-bootstrap';
import styles from './task-review.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import RatingsView from '../ratings-view/ratings-view';

export default class TaskReview extends Component {
  constructor(props) {
    super(props);
    this.refreshRatings = this.refreshRatings.bind(this);
    this.fetchNewData = this.fetchNewData.bind(this);

    this.state = {
      gettingRatings: false,
      ratings: []
    };
  }

  componentDidMount() {
    this.fetchNewData();
  }

  fetchNewData() {
    this.refreshRatings();
  }

  refreshRatings() {
    this.setState({ gettingRatings: true });
    this.props.getTaskRatings(this.props.task.id).then(res => {
      const ratings = JSON.parse(res);
      this.setState({
        gettingRatings: false,
        ratings: ratings || []
      });
    });
  }

  render() {
    const { ratings } = this.state;

    return (
    <Grid style={{minHeight: '900px'}}>
      <Row className={styles['formset-block']}>
        <Col lg={12} md={12} sm={12}>
          {this.state.gettingRatings &&
            <SavingSpinner title="Loading Reviews" borderStyle="none" size={8} />
          }
          <RatingsView ratings={ ratings } task={ this.props.task } companyUrl={ this.props.company_url } />
        </Col>
      </Row>
    </Grid>
    );
  }
}

TaskReview.propTypes = {
  task: PropTypes.object.isRequired,
  getTaskRatings: PropTypes.func.isRequired,
  company_url: PropTypes.string
};
