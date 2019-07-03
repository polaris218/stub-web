import React, { Component } from 'react';
import style from '../../base-styling.module.scss';
import styles from './reviews.module.scss';
import cx from 'classnames';
import RatingType from "../../../rating-type/rating-type";
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { ShareButtons, generateShareIcon } from 'react-share';
import SavingSpinner from "../../../saving-spinner/saving-spinner";
import moment from 'moment';
import { getCustomerName } from '../../../../helpers/task';

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

export default class Reviews extends Component {

  defaultProps = {
    showShortTime: false,
  };

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
    const { task, hideActions, showShortTime, companyUrl, largeSize } = this.props;
    const customer = task || others;
    let actions;

    if (!hideActions) {
      const shareOptions = {
        url: `${window.location.origin}/profile/${companyUrl}/rating/${task.url_safe_id}`,
        title: `${task.customer_first_name}'s review`,
        description: text
      };

      const sharePopover = (
        <Popover id={ `popover-share-${id}` }>
          <div className={ cx(styles['share-buttons']) }>
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

      actions = (<div className={cx(styles['btn-wrapper'])}>
        <OverlayTrigger container={this} trigger="click" rootClose placement="bottom" overlay={sharePopover}>
          <a href="javascript:void (0)" className={cx(styles.btn, styles['btn-primary'])}><img src="/images/task-form/icon-share.svg" alt="Share" /> Share Review</a>
        </OverlayTrigger>
        <a href={ `tel:${customer.customer_phone}` } className={cx(styles.btn, styles['btn-primary'])}><img src="/images/task-form/icon-phone.svg" alt="Phone" /> Phone Customer</a>
        <a href={ `mailto:${customer.customer_email}` } target="_top" className={cx(styles.btn, styles['btn-primary'])}><img src="/images/task-form/icon-envelope.svg" alt="Envelope" /> Email Customer</a>
      </div>);
    }

    return <div className={cx(styles.review)} key={i}>
      <figure className={cx(styles.imageWrapper)}>
        <img src="/images/task-form/default_img.svg" alt="image" />
      </figure>
      <div className={cx(styles.reviewInfo)}>
        <div className={cx(styles.reviewInfoInner)}>
          <div className={cx(styles.name)}>
            <strong>{ getCustomerName(customer.customer_first_name, customer.customer_last_name) }</strong><span>{(customer.customer_first_name || customer.customer_last_name) ? ' | ' : ''}{ this.getLocation(customer.customer_city, customer.customer_state) }</span>
          </div>
          <div className={cx(styles.rating)}>
            <RatingType
              taskRatingType={rating_type ? rating_type : 'FiveStar'}
              value={rating}
              edit={false}
              starColor="#ffd700"
              companyRatingType={this.props.companyProfile.rating_type}
            />
            <time className={ styles['reviewDate'] }>{ moment.utc(time).local().format(showShortTime ? 'MMM DD' : 'MMM DD hh:mm a') }</time>
          </div>
          <div className={cx(styles.reviewText, largeSize ? styles['large-text'] : '', this.props.overflow ? styles.overflowControl : null)}>
            <p>{text}</p>
          </div>
        </div>
        {actions}
      </div>
    </div>
  };

  render() {
    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>{this.props.gettingRatings ? <SavingSpinner title="Loading Reviews" borderStyle="none" className={styles.textLeft} /> : 'Reviews'}</h3>
        <div className={cx(style.boxBody)}>
          { this.props.ratings.length ?
            <div className={cx(style.boxBodyInner)}>
              <div className={cx(styles.reviewsWrapper)}>
                {this.props.ratings.map(this.renderRatingItem)}
              </div>
            </div>
           : <div className={cx(styles.emptyText)}>No reviews</div>
          }
        </div>
      </div>
    );
  }
}
