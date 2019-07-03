import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import styles from './ratings-view-v2.module.scss';
// import StarRatingComponent from 'react-star-rating-component';
import cx from 'classnames';

import { Glyphicon, Popover, OverlayTrigger, Row, Col } from 'react-bootstrap';
import { ShareButtons, generateShareIcon } from 'react-share';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faShareAlt, faMobile } from '@fortawesome/fontawesome-free-solid';
import { faEnvelope } from '@fortawesome/fontawesome-free-regular';
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
    showShortTime: false,
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
        <OverlayTrigger container={this} trigger="click" rootClose placement="bottom" overlay={sharePopover}>
          <a href="#">
            <FontAwesomeIcon icon={faShareAlt} className={ styles['icon']} /> Share review
          </a>
        </OverlayTrigger>
        <a href={ `mailto:${customer.customer_email}` }>
          <FontAwesomeIcon icon={faEnvelope} className={ styles['icon']} /> Email customer
        </a>
        <a href={ `tel:${customer.customer_phone}` }>
          <FontAwesomeIcon icon={faMobile} className={ styles['icon']} /> Phone customer
        </a>
      </div>);
    }

    return <div className={ styles['item'] } key={ i }>
      <Row>
        <Col md={8} sm={8} xs={6}>
          <div className={ styles['item-details'] }>
            <div className={ styles['item-customer'] }>
              <Row>
                <Col md={2} sm={2} xs={4} >
                  <div className={ styles['customer-photo'] }>
                    <img src="/images/user.png" className="img-responsive" alt=""/>
                  </div>
                </Col>
                <Col md={10} sm={10} xs={8} >
                  <div className={ styles['rating-container'] }>
                    <div className={ styles['customer-info'] }>
                      <h4 className={ styles['customer-name'] }>
                        { getCustomerName(customer.customer_first_name, customer.customer_last_name) }
                      </h4>
                      <div className={ styles['customer-location'] }>
                        { this.getLocation(customer.customer_city, customer.customer_state) }
                      </div>
                    </div>
                    <div className={ cx(styles['item-text'], largeSize ? styles['large-text'] : '', this.props.overflow ? styles.overflowControl : null)}>{ text }</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
        <Col md={4} sm={4} xs={6} className="text-right">
          <div className={ styles['item-content'] }>
            <div className={ styles['item-heading'] }>
              <div className={ styles['item-stars'] }>
                <RatingType taskRatingType={(rating_type !== null && typeof rating_type !== 'undefined') ? rating_type : 'FiveStar'}
                            value={rating} edit={false} starColor="#ffd700" companyRatingType={this.props.companyProfile.rating_type}/>
              </div>
              <div
                className={ styles['item-date'] }>{ moment.utc(time).local().format(showShortTime ? 'MMM DD' : 'MMM DD hh:mm a') }</div>
            </div>
          </div>
        </Col>
        <Col md={12} sm={12} xs={12}>
          { actions }
        </Col>
      </Row>
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
  largeSize: PropTypes.bool,
  overflow: PropTypes.bool,
  companyProfile: PropTypes.object
}