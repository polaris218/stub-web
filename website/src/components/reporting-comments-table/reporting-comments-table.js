import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './reporting-comments-table.module.scss';
import { Alert, Table } from 'react-bootstrap';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { getErrorMessage } from '../../helpers/task';
import TimeFilterInReports from "../time-filter-in-reports/time-filter-in-reports";

export default class ReportingCommentsTable extends Component {
  constructor(props) {
    super(props);



    this.renderAnalytics = this.renderAnalytics.bind(this);
    this.renderError = this.renderError.bind(this);
    this.openTask = this.openTask.bind(this);
    this.onHide = this.onHide.bind(this);
  }

  renderError() {
    if (this.props && this.props.analyticsError) {
      return this.props.analyticsError.message ? this.props.analyticsError.message : getErrorMessage(this.props.analyticsError);
    }
  }

  openTask(e, result) {
    e.preventDefault();
    e.stopPropagation();
    window.open(window.location.origin+'/tasks/'+result.taskId);
  }

  onHide(){
    this.setState({
      showDialog:false
    });
  }


  renderAnalytics() {
    if (this.props && this.props.analyticsResults !== null && this.props.analyticsResults.length !== 0) {
      const results = [...this.props.analyticsResults];
      const renderedAnalytics = results.map((result) => {
        return (
          <tr className={styles.clickableRow} onClick={(e) => { this.openTask(e, result)}}>
            <td>
              <p>
                {result.task_rating_text}
              </p>
            </td>
            <td>
              <p>
                {result.customer_name}
              </p>
            </td>
          </tr>
        );
      });
      return renderedAnalytics;
    } else {
      return (
        <tr>
          <td colSpan={2}>
            No results found.
          </td>
        </tr>
      );
    }
  }

  render() {
    return (
      <div className={styles.customerCommentsTableContainer}>
        {this.props.fetchingAnalytics &&
        <div className={styles.loadingContianer}>
          <SavingSpinner borderStyle="none" title="" />
        </div>
        }
        {this.props && this.props.analyticsError !== null && !this.props.fetchingAnalytics &&
        <div className={styles.loadingContianer}>
          <Alert bsStyle="danger">{ this.renderError() }</Alert>
        </div>
        }
        {this.props && this.props.analyticsResults !== null && !this.props.fetchingAnalytics &&
        <Table hover responsive bordered>
          <thead>
          <tr>
            <th>
              Customer Feedback
            </th>
            <th>
              Customer Name
            </th>
          </tr>
          </thead>
          <tbody>
          {this.renderAnalytics()}
          </tbody>
        </Table>
        }
      </div>
    );
  }

}

ReportingCommentsTable.propTypes = {
  analyticsResults: PropTypes.object,
  analyticsError: PropTypes.object,
  fetchingAnalytics: PropTypes.bool
};
