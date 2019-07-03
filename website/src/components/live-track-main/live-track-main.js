import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Button } from 'react-bootstrap';
import CompanyProfile from './components/company-profile';
import EstimateWidget from './components/estimate-widget';
import LiveStatus from './components/live-status';
import ConfirmWidget from './components/confirm-widget';
import styles from './live-track-main.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import Rating from '../rating/rating';
import RatingsView from '../ratings-view/ratings-view';
import { getCustomerName } from '../../helpers/task';

export default class LiveTrackMain extends Component {
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
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.contentLoaded || this.props.contentLoaded) {
      const company_rating_type = (this.props.profile && this.props.profile.rating_type) && this.props.profile.rating_type;

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
    this.setState({ closeRating: true });
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
         customerName = getCustomerName(task['customer_first_name'], task['customer_last_name']);
         customerID = task['customer_id'];
     }

     let existingReviews = null;     
     if (rating && rating.length > 0)  {
      existingReviews = (<div className={styles['rating-section']}>
          <Grid>
            <RatingsView ratings={ rating } task={ task } hideActions companyProfile={profile} />
          </Grid>
        </div>);
     }


    return (
      <div className={styles['entity-manager']}>
        { this.state.showCompletePopup && (!this.props.sub_component || this.props.sub_component === 'Rating') &&
          <Rating
            name={profile.fullname}
            closeRating={this.closeRating}
            rate={this.postRate}
            showModal={!this.state.closeRating}
            social_links={ profile.social_links }
            task_url={this.props.task_url}
            company={profile}
            customerName={customerName}
            customerID={customerID}
            entities={this.props.entities}
            review_prompt_text = { this.props.review_prompt_text }
            negative_review_prompt_text = { this.props.negative_review_prompt_text }
          />
        }
        {contentLoading &&
        <div className={styles['loading-section']}>
          <SavingSpinner title="Loading" borderStyle="none" fontSize={16} size={8}/>
        </div>
        }
        { error }
        {this.state.showData &&
          <div>
            {this.props.showCompanyProfileWidget && (!this.props.sub_component || this.props.sub_component === 'Profile') &&
              <CompanyProfile profile={ profile }/>
            }
            {(!this.props.sub_component || this.props.sub_component === 'Estimate') &&
              <EstimateWidget unscheduled={task.unscheduled} estimate={ estimate } status={ status }/>
            }

            {(!this.props.sub_component || this.props.sub_component === 'Reviews') && existingReviews}
            {(!this.props.sub_component || this.props.sub_component === 'Confirmation') &&
              <ConfirmWidget
                confirmation_needed={ this.props.confirmation_needed }
                confirmation_message_text={ this.props.confirmation_message_text }
                company_name={ this.props.company_name }
                task_url={ this.props.task_url }
                confirmTask={ this.props.confirmTask }
                declineTask={ this.props.declineTask }
              />
            }
            {(!this.props.sub_component || this.props.sub_component === 'LiveStatus') &&
              <LiveStatus profile={ profile } estimate={ estimate } entities={ entities } task={ task } status={ status } rating={ rating } task_url={ this.props.task_url } refreshStatus={ this.props.refreshStatus } />
            }
          </div>
        }
      </div>
    );
  }
}

LiveTrackMain.propTypes = {
  profile: PropTypes.object,
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
  sub_component: PropTypes.string,
  rate: PropTypes.func.isRequired,
  company_name: PropTypes.string.isRequired,
  task_url: PropTypes.string.isRequired,
  confirmTask: PropTypes.func.isRequired,
  declineTask: PropTypes.func.isRequired,
  refreshStatus: PropTypes.func.isRequired,
};
