import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './ratings-view.module.scss';
import moment from 'moment';
import StarRatingComponent from 'react-star-rating-component';
import { Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap';
import { ShareButtons, generateShareIcon } from 'react-share';
import { getCustomerName } from '../../helpers/task';
import RatingType from '../rating-type/rating-type';

const {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  GooglePlusShareButton
} = ShareButtons;
const FacebookIcon = generateShareIcon('facebook');
const TwitterIcon = generateShareIcon('twitter');
const LinkedinIcon = generateShareIcon('linkedin');
const GooglePlusIcon = generateShareIcon('google');


export default class RatingsView extends Component {

  defaultProps = {
    showShortTime: false
  }

  getLocation(city_name, state) {
    let location = "";

    if(city_name) {
      location = city_name.charAt(0).toUpperCase() + city_name.slice(1).toLowerCase();
    }

    if(state) {
      location = location + ", " + state.toUpperCase();
    }

    if(location.length > 18) { 
      location = location.substring(0, 18) + '...';
    }

    return location;   
  }

  renderRatingItem = ({ text, rating, time, id, rating_type, ...others }, i) => {
    const { task, hideActions, showShortTime, companyUrl } = this.props;
    const customer = task || others;
    let actions;

    if (!hideActions) {
      const shareOptions = {
        url: `${window.location.origin}/profile/${companyUrl}/rating/${task.url_safe_id}`,
        title: `${task.customer_first_name}'s review`,
        description: text
      };

      const sharePopover = (
        <Popover id={ `popover-share-${id}` } title="Share review">
          <div className={ styles['share-buttons'] }>
            <FacebookShareButton { ...shareOptions }>
              <FacebookIcon/>
            </FacebookShareButton>
            <TwitterShareButton { ...shareOptions }>
              <TwitterIcon/>
            </TwitterShareButton>
            <GooglePlusShareButton { ...shareOptions }>
              <GooglePlusIcon/>
            </GooglePlusShareButton>
            <LinkedinShareButton { ...shareOptions }>
              <LinkedinIcon/>
            </LinkedinShareButton>
          </div>
        </Popover>
      );

      actions = (<div className={ styles['item-actions'] }>
        <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={sharePopover}>
          <a href="#">
            <Glyphicon glyph="share"/> Share review
          </a>
        </OverlayTrigger>
        <a href={ `mailto:${customer.customer_email}` }>
          <Glyphicon glyph="envelope"/> Email customer
        </a>
        <a href={ `tel:${customer.customer_phone}` }>
          <Glyphicon glyph="phone"/> Phone customer
        </a>
      </div>);
    }

    return <div className={ styles['item'] } key={ i }>
      <div className={ styles['item-details'] }>
        <div className={ styles['item-customer'] }>
          <div className={ styles['customer-photo'] }>
            <img src="/images/user.png" alt=""/>
          </div>
          <div className={ styles['customer-info'] }>
            <div className={ styles['customer-name'] }>
              { getCustomerName(customer.customer_first_name, customer.customer_last_name) }
            </div>
            <div className={ styles['customer-location'] }>
              { this.getLocation(customer.customer_city, customer.customer_state) }
            </div>
          </div>
        </div>
        { actions }
      </div>
      <div className={ styles['item-content'] }>
        <div className={ styles['item-heading'] }>
          <div className={ styles['item-stars'] }>
              <RatingType companyRatingType={this.props.companyProfile && this.props.companyProfile.rating_type} taskRatingType={(rating_type !== null && typeof rating_type !== 'undefined') ? rating_type : 'FiveStar'} value={rating} edit={false} starColor="#00DC9A"/>
          </div>
          <div
            className={ styles['item-date'] }>{ moment.utc(time).local().format(showShortTime ? 'MMM DD' : 'MMM DD hh:mm a') }</div>
        </div>
        <div className={ styles['item-text'] }>{ text }</div>
      </div>
    </div>
  }

  render() {
    return <div className={ styles['list'] }>
      { this.props.ratings.length
        ? this.props.ratings.map(this.renderRatingItem)
        : <div className={ styles['list-empty'] }>No reviews</div>
      }
    </div>;
  }
}

RatingsView.propTypes = {
  ratings: PropTypes.array.isRequired,
  task: PropTypes.object,
  hideActions: PropTypes.bool,
  companyUrl: PropTypes.string,
  showShortTime: PropTypes.bool,
  companyProfile: PropTypes.object,
}