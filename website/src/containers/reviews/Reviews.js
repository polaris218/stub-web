import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './reviews.module.scss';

import ErrorAlert from '../../components/error-alert/error-alert';

import { FooterComponent, FooterConfiguration, UserHeaderV2, SlimFooterV2, ActivityStream, ActivityStreamButtonV2, TrialExpiration }  from '../../components';
import { getPublicRatings } from '../../actions';
import { getProfileInformation, getCompanyProfileInformation } from '../../actions/profile';
import RatingsView from '../../components/ratings-view-v4/ratings-view-v4';
import { Grid, Row, Col } from 'react-bootstrap';
import Helmet from 'react-helmet';
import { isTrialExpire } from '../../helpers';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faChevronLeft, faChevronRight } from '@fortawesome/fontawesome-free-solid';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import cx from 'classnames';

export default class Reviews extends Component {

  state = {
    profile: {},
    userProfile: {},
    ratings: [],
    loading: true,
    overall_rating: 0,
    items_per_page: 30,
    page: 1,
    fetchingMoreReviews: false,
    internetIssue: undefined,
    activityStreamStateHandler: null
  };

  constructor(props, context) {
    super(props, context);
    this.incrementReviews = this.incrementReviews.bind(this);
    this.decrementReviews = this.decrementReviews.bind(this);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
  }

  componentWillMount() {
    getCompanyProfileInformation().then((res) => {
      let profile = JSON.parse(res);
      this.setState({ profile });
      this.loadProfileRatings(profile.owner_url);
    }).catch((err) => {
      if(err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 6e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
        internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
      });
    } else {
      clearTimeout(timer);
    }

    getProfileInformation().then((res) => {
      let profile = JSON.parse(res);
      let is_company = false;
      let permissions = null;
      let view_activity_stream = false;
      if (profile) {
        if (profile && profile.permissions) {
          permissions = profile.permissions
        }
        if (permissions && permissions.includes('COMPANY')) {
          is_company = true
        }
        if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
          view_activity_stream = true;
        }
      }
      this.setState({ userProfile: profile, view_activity_stream });
    });
  }

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  incrementReviews(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ fetchingMoreReviews: true });
    let { itemsPerPage, page, profile } = this.state;
    page++;
    this.loadProfileRatings(profile.owner_url, itemsPerPage, page, false);
    this.setState({ page });
  }

  decrementReviews(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ fetchingMoreReviews: true });
    let { itemsPerPage, page, profile } = this.state;
    page--;
    this.loadProfileRatings(profile.owner_url, itemsPerPage, page, false);
    this.setState({ page });
  }


  loadProfileRatings(company_url, items_per_page = this.state.items_per_page, page = this.state.page, refreshPage = true) {
    if (refreshPage) {
      this.setState({ loading: true });
    }
    getPublicRatings(company_url, items_per_page, page).then(resp => {
      resp = JSON.parse(resp);

      resp.sort(function (a, b) {
        const a_time = new Date(a.time);
        const b_time = new Date(b.time);
        const time_comparison = a_time > b_time ? -1 : a_time <b_time ? 1 : 0;
        return time_comparison;
      });

      let overall_rating = 0;

      if (resp.length > 0) {
        resp.map((review) => {
          overall_rating = overall_rating + review.rating;
        });

        overall_rating = overall_rating / resp.length;
      }

      this.setState({ ratings: resp, overall_rating, loading: false, fetchingMoreReviews: false });
    }).catch((err) => {
      return;
    });
  }

  convertFirstLetterToUppercase(name) {
    if (!name) {
      return '';
    }

    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  render() {
    const { ratings, profile } = this.state;

    let description = 'Keep customers aware of progress';
    let title = 'Arrivy';
    if (profile) {
      title = profile.fullname;
      description = profile.intro;
    }

    const totalReviews = this.state.ratings.length;

    let prevDisabled = false;
    let nextDisabled = false;
    if (this.state.page === 1) {
      prevDisabled = true;
    }
    if (this.state.ratings.length < this.state.items_per_page) {
      nextDisabled = true;
    }

    const trialExpired = isTrialExpire(this.state.profile);

    return (
      <main className={styles.page  + ' activity-stream-right-space'}>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        <Helmet
          title={title}
          defaultTitle={title}
          meta={[
            { name: 'description', description },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:image', content: profile && profile.image_path ? profile.image_path : 'https://www.arrivy.com/images/logo-dark.png' }
          ]}
        />
        <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.userProfile} companyProfile={this.state.profile}/>
        {trialExpired ? <TrialExpiration companyProfile={this.state.profile} profile={this.state.userProfile} /> :
        <section className={ styles.profile }>
          <Grid>
            <Row>
              <Col md={12} className={ styles['main-column']}>
                <div className={ styles['reviews-row']}>
                  <Col xs={6}>
                    <h2>Reviews</h2>
                  </Col>
                  <Col xs={6}>
                    <h2>
                      <a className={ styles.publicViewsLInk } target="_blank" href={`/profile/${this.state.profile.owner_url}`}> <FontAwesomeIcon icon={faExternalLinkAlt} /> &nbsp; Reviews On Public Profile</a>
                    </h2>
                    <div className={styles.activityStreamBtnContainer}>
                      <ActivityStreamButtonV2 activityStreamStateHandler={this.state.activityStreamStateHandler} />
                    </div>
                  </Col>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12} sm={12}>
                {this.state.loading &&
                  <div className={styles.savingSpinnerContainer}>
                    <SavingSpinner size={8} borderStyle="none" title="Loading Reviews"/>
                  </div>
                }
                {this.state.fetchingMoreReviews &&
                  <div className={styles.paginationSpinnerContainer}>
                    <SavingSpinner title="Loading" borderStyle="none" />
                  </div>
                }
                {!this.state.loading && !this.state.fetchingMoreReviews && (this.state.ratings.length > 0 || this.state.page > 1) &&
                  <div className={styles.paginationContainer}>
                    {this.state.fetchingMoreReviews
                      ?
                      <p>
                        {this.state.ratings.length}
                      </p>
                      :
                      <p>
                        {((this.state.page - 1) * this.state.items_per_page) + 1 } - { (this.state.page * this.state.items_per_page) - (this.state.items_per_page - this.state.ratings.length) }
                      </p>
                    }
                    <ul>
                      <li style={{ cursor: 'wait' }}>
                        <button onClick={(e) => this.decrementReviews(e)} disabled={prevDisabled} className={cx(prevDisabled && 'disabled', this.state.fetchingMoreReviews && styles.pendingAction)}>
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                      </li>
                      <li style={{ cursor: 'wait' }}>
                        <button onClick={(e) => this.incrementReviews(e)} disabled={nextDisabled} className={cx(nextDisabled && 'disabled', this.state.fetchingMoreReviews && styles.pendingAction)}>
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </li>
                    </ul>
                  </div>
                }
                { ratings && (ratings.length > 0) &&
                <div className={ styles.reviews }>
                  <div className={styles.ratingsViewContainer}>
                    <RatingsView ratings={ ratings } owner_url={this.state.profile.owner_url} companyProfile={this.state.profile}/>
                  </div>
                </div>
                }
              </Col>
            </Row>
          </Grid>
          {!this.state.loading && totalReviews === 0 &&
            <div className={styles.noReviewsContainer}>
              <p>Looks like you don't have any reviews yet. Don't worry they will start coming in soon.</p>
            </div>
          }
        </section>}
        <footer>
          <SlimFooterV2 />
        </footer>
      </main>
    );
  }
}

Reviews.contextTypes = {
  router: PropTypes.object.isRequired
};
