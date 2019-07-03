import React, { Component } from 'react';
import styles from './rating-view-widget.module.scss';
import moment from 'moment';
import { getCustomerName } from '../../../../helpers/task';
import { Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap';
import { ShareButtons, generateShareIcon } from 'react-share';
import RatingType from '../../../rating-type/rating-type';
const { FacebookShareButton, LinkedinShareButton, TwitterShareButton, GooglePlusShareButton} = ShareButtons;
import config from '../../../../config/config'
const server_url = config(self).serverUrl

export default class RatingViewWidget extends Component {
  constructor(props) {
    super(props);
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
            <img src={`${server_url}/images/user.png`} alt=""/>
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
            <RatingType companyRatingType={this.props.companyProfile.rating_type} taskRatingType={(rating_type !== null && typeof rating_type !== 'undefined') ? rating_type : 'FiveStar'} value={rating} edit={false} starColor="#00DC9A"/>
          </div>
          <div
            className={ styles['item-date'] }>{ moment.utc(time).local().format(showShortTime ? 'MMM DD' : 'MMM DD hh:mm a') }</div>
        </div>
        <div className={ styles['item-text'] }>{ text }</div>
      </div>
    </div>
  }

  render() {

    return (
      <div className={ styles['list'] }>
        { this.props.ratings.length
          ? this.props.ratings.map(this.renderRatingItem)
          : <div className={ styles['list-empty'] }>No reviews</div>
        }
      </div>
    );
  }

}
