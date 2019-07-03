import React, { Component } from 'react';
import styles from './live-track-main-v2.module.scss';
import {getCustomerName, getErrorMessage} from '../../helpers/task';
import Rating from './components/rating/rating';
import EstimateWidget from './components/estimate-widget/estimate-widget';
import ConfirmWidget from './components/confirm-widget/confirm-widget';
import LiveStatus from './components/live-status/live-status';
import TaskScheduleWidget from './components/task-schedule-widget/task-schedule-widget';
import AssigneeWidget from './components/assignee-widget/assignee-widget';
import LocationMap from './components/location-map/location-map';
import RatingViewWidget from './components/rating-view-widget/rating-view-widget';
import ProfileWidget from './components/profile-widget/profile-widget';
import ArrivyBrandingWidget from './components/arrivy-branding-widget/arrivy-branding-widget';
import TaskProducts from '../task-products/task-products';
import SubscriptionNotification from '../subscription-notification/subscription-notification';
import cx from 'classnames';

export default class LiveTrackMainV2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showData : false,
      showCompletePopup: false,
      closeRating: false
    };

    this.closeRating = this.closeRating.bind(this);
    this.postRate = this.postRate.bind(this);
    this.forceShowRatingPop = this.forceShowRatingPop.bind(this);
    this.updateSubscription = this.updateSubscription.bind(this);
  }

  componentDidMount() {
    if (this.props.contentLoaded) {
      const company_rating_type = (this.props.profile && this.props.profile.rating_type) && this.props.profile.rating_type;

      let anyRatingExists = false;
      if (this.props.rating && this.props.rating.length > 0) {
        anyRatingExists = true;
      }

      this.setState({
        showData: true,
        showCompletePopup: company_rating_type !== 'NoRating' && (this.state.showCompletePopup || ((this.props.status.latestStatus === 'COMPLETE' || this.props.status.latestStatus === 'AUTO_COMPLETE') && !anyRatingExists))
      });
    }
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.contentLoaded || this.props.contentLoaded) {
      const company_rating_type = (nextProps.profile && nextProps.profile.rating_type) && nextProps.profile.rating_type;

      let anyRatingExists = false;
      if (nextProps.rating && nextProps.rating.length > 0) {
        anyRatingExists = true;
      }

      this.setState({
        showData: true,
        showCompletePopup: company_rating_type !== 'NoRating' && (this.state.showCompletePopup || ((nextProps.status.latestStatus === 'COMPLETE' || nextProps.status.latestStatus === 'AUTO_COMPLETE') && !anyRatingExists))
      });
    }
  }

  forceShowRatingPop() {
    this.setState({
      showCompletePopup: true,
      closeRating: false
    });
  }

  closeRating() {
    this.setState({
      closeRating: true
    });
  }

  postRate(rating, text, rating_type) {
    return this.props.rate(
      this.props.company_name,
      this.props.task_url,
      rating,
      text,
      rating_type
    );
  }

  updateSubscription(subscribe = !this.props.subscribe, subscribe_source = 'EMAIL') {
    this.props.updateTaskSubscription(this.props.company_name, this.props.task_url, subscribe, subscribe_source).then(() => {
      this.props.refreshStatus();
    }).catch((error) => {
      const resposne_error = JSON.parse(error.responseText);
      const error_text = getErrorMessage(resposne_error);
      console.log(error_text, 'Unabled to change subscription.');
    });

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
      rating,
      group
    } = this.props;

    let customerName = '';
    let customerID = '';
    if (task !== null) {
      customerName = getCustomerName(task['customer_first_name'], task['customer_last_name']);
      customerID = task['customer_id'];
    }

    let existingReviews = null;
    if (rating && rating.length > 0)  {
      existingReviews = (
        <RatingViewWidget ratings={ rating } task={ task } hideActions companyProfile={this.props.profile}/>
      );
    }
    let mapHeight = 700;
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (screenWidth < 990) {
      mapHeight = (screenHeight * 0.65) > 500 ? 500 : screenHeight * 0.65;
      mapHeight = mapHeight + 100;
    } else {
      mapHeight = screenHeight * 0.71;
    }

    let showSocialLinks = false;
    if (rating.length > 0 && rating[0].rating_type === 'ThumbsUpDown' && rating[0].rating >0) {
      showSocialLinks = true;
    } else if (rating.length > 0 && rating[0].rating_type === 'NPS' && rating[0].rating > 8) {
      showSocialLinks = true;
    }  else if (rating.length > 0 && rating[0].rating_type === 'FiveStar' && rating[0].rating > 3) {
      showSocialLinks = true;
    } else if (rating.length > 0 && rating[0].rating_type === null && rating[0].rating > 3) {
      showSocialLinks = true;
    }
    const items_with_statuses = this.props.items_with_statuses;

    let social_links = group && !$.isEmptyObject(group.social_links) ? group.social_links : profile.social_links;

    return (
      <div className={styles.liveTrackMainContainer}>
        { this.state.showCompletePopup && (!this.props.sub_component || this.props.sub_component === 'Rating') &&
        <Rating
          name={profile.fullname}
          closeRating={this.closeRating}
          rate={(rating, text, rating_type) => this.postRate(rating, text, rating_type)}
          showModal={!this.state.closeRating}
          social_links={social_links}
          task_url={this.props.task_url}
          company={profile}
          customerName={customerName}
          customerID={customerID}
          entities={this.props.entities}
          review_prompt_text = { this.props.review_prompt_text }
          negative_review_prompt_text = { this.props.negative_review_prompt_text }
        />
        }
        <div className={styles.liveTrackMainFlexContainer}>
          {(!this.props.sub_component || this.props.sub_component === 'Profile') &&
            <div className={cx(styles.customColumn, styles.companyProfileColumn, 'col-md-12')}>
              <ProfileWidget profile={profile} showLinks={showSocialLinks}/>
            </div>
          }
          {(!this.props.sub_component || this.props.sub_component === 'Estimate') &&
            <div className={cx(styles.customColumn, styles.estimateColumn, 'col-md-12')}>
              <EstimateWidget profile={profile} unscheduled={task.unscheduled} estimate={ estimate } status={ status }/>
            </div>
          }
          {(!this.props.sub_component || this.props.sub_component === 'Confirmation') &&
            <div className={cx(styles.specialColumn)}>
              <ConfirmWidget
                confirmation_needed={ this.props.confirmation_needed }
                confirmation_message_text={ this.props.confirmation_message_text }
                company_name={ this.props.company_name }
                task_url={ this.props.task_url }
                confirmTask={ this.props.confirmTask }
                declineTask={ this.props.declineTask }
                task={this.props.task}
                profile={profile}
              />
            </div>
          }
          {(!this.props.sub_component || this.props.sub_component === 'Reviews') &&
            <div className={cx(styles.customColumn, styles.ratingViewColumn, 'col-md-12')}>
              { existingReviews }
            </div>
          }
          {(!this.props.sub_component || this.props.sub_component === 'Crew') &&
            <div className={cx(styles.customColumn, styles.assigneeColumn, 'col-md-6')}>
              <AssigneeWidget profile={profile} entities={entities} />
            </div>
          }
          {(!this.props.sub_component || this.props.sub_component === 'TaskSchedule') &&
            <div className={cx(styles.customColumn, styles.taskScheduleColumn, 'col-md-6')}>
              <TaskScheduleWidget task={task} profile={profile} />
            </div>
          }

          {items_with_statuses && items_with_statuses.length > 0 &&
          <div className={cx(styles.customColumn, styles.taskItemsColumn, 'col-md-12')}>
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <h3 className={styles.productsHeading}>Products</h3>
                <TaskProducts products={items_with_statuses} slidesToShow={3} slidesToScroll={3} page="liveTrack"/>
              </div>
            </div>
          </div>
          }

          {(!this.props.sub_component || this.props.sub_component === 'StatusJournal') &&
            <div className={cx(styles.customColumn, styles.liveStatusColumn, 'col-md-6')}>
              <LiveStatus profile={ profile } estimate={ estimate } entities={ entities } task={ task } status={ status } rating={ rating } task_url={ this.props.task_url } refreshStatus={ this.props.refreshStatus } updateSubscription={this.props.updateTaskSubscription}/>
            </div>
          }

          {(!this.props.sub_component || this.props.sub_component === 'LocationMap') &&
            <div style={{height: !task.customer_exact_location ? '58px': mapHeight}} className={cx(styles.customColumn, !task.customer_exact_location ? styles.locationMapNoColumns : styles.locationMapColumns, 'col-md-6')}>
              <LocationMap mapHeight={mapHeight} task={task} estimate={estimate} entities={entities} task_url={ this.props.task_url } status={status} refreshStatus={ this.props.refreshStatus } />
            </div>
          }
          {!this.props.sub_component && !profile.white_label_enabled &&
            <div className={cx(styles.customColumn, styles.brandingColumn, 'col-md-12')}>
              <ArrivyBrandingWidget />
            </div>
          }
        </div>
        {this.props.showAlert &&
          <SubscriptionNotification changeSubscribe={this.updateSubscription} subscribe={this.props.subscribe}/>
        }
      </div>
    );
  }
}
