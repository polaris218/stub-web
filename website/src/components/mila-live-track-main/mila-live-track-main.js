import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LiveStatus from './components/live-status';
import CrewWidget from './components/crew-widget';
import styles from './mila-live-track-main.module.scss';
import EstimateWidget from './components/estimate-widget';
import RatingsView from '../ratings-view/ratings-view';
import LocationMapContainer from './components/location-map';
import { Grid } from 'react-bootstrap';
import cx from 'classnames';

export default class MilaLiveTrackMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showData : false,
      showSendNoteModal: false
    };

    this.getCustomerName = this.getCustomerName.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.contentLoaded || this.props.contentLoaded) {
      this.setState({
        showData: true,
      });
    }
  }

  toggleModal(action) {
    this.setState({
      showSendNoteModal: action
    });
  }

  getCustomerName(customer_first_name, customer_last_name) {
    let customer_name = "";

    if(customer_first_name) {
      customer_name = customer_first_name.charAt(0).toUpperCase() + customer_first_name.slice(1).toLowerCase();
    }

    if(customer_last_name) {
      customer_name = customer_name + " " + customer_last_name.charAt(0).toUpperCase() + ".";
    }

    if(customer_name.length > 14) {
      customer_name = customer_name.substring(0,14) + '...';
    }

    return customer_name;
  }

  render() {
    const {
      task,
      profile,
      estimate,
      entities,
      status,
      contentLoading,
      contentLoaded,
      error,
      rating
    } = this.props;

    let customerName = '';
    let customerID = '';
    if (task !== null) {
      customerName = this.getCustomerName(task['customer_first_name'], task['customer_last_name']);
      customerID = task['customer_id'];
    }

    let existingReviews = null;
    if (rating && rating.length > 0)  {
      existingReviews = (<div className={styles['rating-section']}>
        <Grid>
          <RatingsView ratings={ rating } task={ task } hideActions />
        </Grid>
      </div>);
    }

    return (
      <div className={styles['entity-manager']}>
        {this.state.showData &&
          <div className={styles.customRow}>
            <div className={cx(styles.customColumn, styles.column2)}>
              <EstimateWidget showChatWidget={this.props.showChatWidget} toggleModal={this.toggleModal} lang={this.props.lang} estimate={estimate} status={status.latestStatus} task={task} />
            </div>
            <div className={cx(styles.customColumn, styles.column1)}>
              <CrewWidget lang={this.props.lang} entities={entities} getAssigneeRating={this.props.getAssigneeRating} task={this.props.task} trackerVersion={this.props.trackerVersion}/>
            </div>
            <div className={cx(styles.customColumn, styles.column3, 'col-md-6')}>
              <LocationMapContainer lang={this.props.lang} task={task} estimate={estimate} entities={entities} task_url={ this.props.task_url } status={status} refreshStatus={ this.props.refreshStatus } />
            </div>
            <div className={cx(styles.customColumn, styles.column4, 'col-md-6')}>
              <LiveStatus showChatWidget={this.props.showChatWidget} toggleModal={this.toggleModal} showModal={this.state.showSendNoteModal} lang={this.props.lang} task={task} estimate={estimate} entities={entities} task_url={ this.props.task_url } status={status} refreshStatus={ this.props.refreshStatus } trackerVersion={this.props.trackerVersion} />
            </div>
          </div>
        }
      </div>
    );
  }
}

MilaLiveTrackMain.propTypes = {
  task: PropTypes.object,
  confirmation_needed: PropTypes.bool,
  confirmation_message_text: PropTypes.string,
  review_prompt_text: PropTypes.string,
  negative_review_prompt_text: PropTypes.string,
  entities: PropTypes.array,
  estimate: PropTypes.string,
  rating: PropTypes.array,
  status: PropTypes.object,
  contentLoading: PropTypes.bool,
  contentLoaded: PropTypes.bool,
  error: PropTypes.string,
  rate: PropTypes.func,
  company_name: PropTypes.string,
  task_url: PropTypes.string,
  confirmTask: PropTypes.func,
  declineTask: PropTypes.func,
  refreshStatus: PropTypes.func,
  lang: PropTypes.string,
  getAssigneeRating: PropTypes.func,
};
