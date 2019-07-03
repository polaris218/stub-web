import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import styles from './ratings-view-v4.module.scss';
import StarRatingComponent from 'react-star-rating-component';
import cx from 'classnames';

import { Popover, OverlayTrigger, Row, Col } from 'react-bootstrap';
import { ShareButtons, generateShareIcon } from 'react-share';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faShareAlt, faMobile, faEye, faCircleNotch } from '@fortawesome/fontawesome-free-solid';
import { faEnvelope } from '@fortawesome/fontawesome-free-regular';
import { getTask } from '../../actions';
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
  };
  constructor(props) {
    super(props);

    this.state = {
      task_url_safe_id: null,
      preparingURL: true,
    };

    this.renderRatingItem = this.renderRatingItem.bind(this);
    this.contactCustomer = this.contactCustomer.bind(this);
    this.getUrlSafeID = this.getUrlSafeID.bind(this);
    this.openExternalReviewLink = this.openExternalReviewLink.bind(this);
  }

  contactCustomer (event, contactType, task_id, contact_id) {
    event.preventDefault();
    event.stopPropagation();
    if (contact_id !== null && contact_id !== '') {
      if (contactType.toUpperCase() === 'EMAIL') {
        window.location.href = 'mailto:' + contact_id;
      } else if (contactType.toUpperCase() === 'PHONE') {
        window.location.href = 'tel:' + contact_id;
      } else {
        return;
      }
    } else {
      getTask(task_id).then((result) => {
        const task = JSON.parse(result);
        if (contactType.toUpperCase() === 'EMAIL' && task.customer_email !== null) {
          window.location.href = 'mailto:' + task.customer_email;
        } else if (contactType.toUpperCase() === 'PHONE' && task.customer_mobile_number !== '') {
          window.location.href = 'tel:' + task.customer_mobile_number;
        } else {
          return;
        }
      }).catch((err) => {
        return;
      });
    }
  }

  getUrlSafeID(e, task_id, url_safe_id) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ preparingURL: true })
    if (url_safe_id !== null) {
      this.setState({
        task_url_safe_id: url_safe_id,
        preparingURL: false,
      });
    } else {
      getTask(task_id).then((result) => {
        const task = JSON.parse(result);
        this.setState({
          task_url_safe_id: task.url_safe_id,
          preparingURL: false
        });
      }).catch((err) => {
        return;
      });
    }
  }

  openExternalReviewLink(e, task_id, url_safe_id) {
    e.preventDefault();
    e.stopPropagation();
    if (url_safe_id !== null) {
      window.location.href = `${window.location.origin}/profile/${this.props.owner_url}/rating/${url_safe_id}`;
    } else {
      getTask(task_id).then((result) => {
        const task = JSON.parse(result);
        window.location.href = `${window.location.origin}/profile/${this.props.owner_url}/rating/${task.url_safe_id}`;
      });
    }
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

  renderRatingItem() {
    const reviewsRendered = this.props.ratings.map(review => {
      const { text, rating, time, task_id, id, rating_type, ...others } = review;
      const companyUrl = this.props.owner_url;
      let actions;
      const shareOptions = {
        url: `${window.location.origin}/profile/${companyUrl}/rating/${this.state.task_url_safe_id}`,
        title: `${review.customer_first_name}'s review`,
        description: text
      };

      const sharePopover = (
        <Popover id={ `popover-share-${id}` } {...this.props}>
          {!this.state.preparingURL &&
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
          }
          {this.state.preparingURL &&
            <div className={styles.shareButtonsPlaceholder}>
              <FontAwesomeIcon icon={faCircleNotch} className={cx('fa-spin fa-2x', styles.spinnerIcon)} />
            </div>
          }
        </Popover>
      );

      actions = (<div className={ styles['item-actions'] }>
        <OverlayTrigger container={this} trigger="click" rootClose placement="bottom" overlay={sharePopover}>
          <a href="#" onClick={(e) => this.getUrlSafeID(e, review.task_id, review.task_url_safe_id)}>
            <FontAwesomeIcon icon={faShareAlt} className={ styles['icon']} /> Share review
          </a>
        </OverlayTrigger>
        <a onClick={(e) => this.contactCustomer(e, 'email', review.task_id, review.customer_email)}>
          <FontAwesomeIcon icon={faEnvelope} className={ styles['icon']} /> Email customer
        </a>
        <a onClick={(e) => this.contactCustomer(e, 'phone', review.task_id, review.customer_mobile_number)}>
          <FontAwesomeIcon icon={faMobile} className={ styles['icon']} /> Phone customer
        </a>
        <a target="_blank" onClick={(e) => this.openExternalReviewLink(e, review.task_id, review.task_url_safe_id)}>
          <FontAwesomeIcon icon={faEye} className={ styles['icon']} /> External review link
        </a>
      </div>);

      return (<div className={ styles['item'] }>
        <a target="_blank" href={'/tasks/' + task_id}>
          <Row>
            <Col md={10} sm={10} xs={12}>
              <div className={ styles['item-details'] }>
                <div className={ styles['item-customer'] }>
                  <Row>
                    <Col md={3} sm={3} xs={3} >
                      <div className={ styles['customer-photo'] }>
                        <img src="/images/user.png" className="img-responsive" alt=""/>
                      </div>
                      <div className={ styles['customer-info'] }>
                        <h4 className={ styles['customer-name'] }>
                          { getCustomerName(review.customer_first_name, review.customer_last_name) }
                        </h4>
                        <div className={ styles['customer-location'] }>
                          { this.getLocation(review.customer_city, review.customer_state) }
                        </div>
                      </div>
                      <div className={ styles['item-date'] }>{ moment.utc(time).local().format('MMM DD hh:mm a') }</div>
                    </Col>
                    <Col md={9} sm={9} xs={9} >
                      <div className={ styles['item-content'] }>
                        <div className={ styles['item-heading'] }>
                          <div className={ styles['item-stars'] }>
                              <RatingType taskRatingType={(rating_type !== null && typeof rating_type !== 'undefined') ? rating_type : 'FiveStar'}
                                          value={rating} edit={false} starColor="#ffd700" companyRatingType={this.props.companyProfile.rating_type}/>
                          </div>
                        </div>
                      </div>
                      <div className={ styles['rating-container'] }>
                        <div className={ cx(styles['large-text'])}>{ text }</div>
                        { actions }
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </a>
      </div>);
    });
    return reviewsRendered;
  }

  render() {

    let reviews = this.renderRatingItem();
    if (this.props.ratings.length < 1) {
      reviews = (<p>No reviews found.</p>);
    }
    return (
      <div className={ styles['list'] }>
        { reviews }
      </div>
    );
  }
}

RatingsView.propTypes = {
  ratings: PropTypes.array.isRequired,
  task: PropTypes.object,
  hideActions: PropTypes.bool,
  companyUrl: PropTypes.string,
  showShortTime: PropTypes.bool,
  largeSize: PropTypes.bool,
  companyProfile: PropTypes.object
};
