import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './profile.module.scss';
import { FooterComponent, FooterConfiguration }  from '../../components';
import { getPublicProfile, getPublicRatings, getPublicTaskRating } from '../../actions';
import RatingsView from '../../components/ratings-view-v2/ratings-view-v2';
import RatingsView2 from '../../components/ratings-view-v3/ratings-view-v3';
import { Grid, Row, Col } from 'react-bootstrap';
import Helmet from 'react-helmet';
import cx from 'classnames';

export default class Profile extends Component {

  state = {
    isSingle: false,
    profile: {},
    ratings: [],
    loading: true,
    overall_rating: 0,
    truncateLimit: 300
  };

  constructor(props, context) {
    super(props, context);

    this.showFullText = this.showFullText.bind(this);
    this.showTruncatedText = this.showTruncatedText.bind(this);
  }

  componentDidMount() {
    const { company_url, task_url } = this.props.match.params;
    const isSingle = !!task_url;
    this.setState({ isSingle, loading: true });
    this.loadProfile(company_url);
    isSingle ? this.loadTaskRatings(company_url, task_url) : this.loadProfileRatings(company_url);
  }

  showFullText(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      truncateLimit: this.state.profile.details.length
    });
  }

  showTruncatedText(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      truncateLimit: 300
    });
  }

  loadProfile(company_url) {
    getPublicProfile(company_url).then(resp => {
      resp = JSON.parse(resp);
      this.setState({ profile: resp, loading: false })
    });
  }

  loadProfileRatings(company_url) {
    getPublicRatings(company_url).then(resp => {
      resp = JSON.parse(resp);

      resp = resp.filter((r) => {
        if (r.rating_type === 'ThumbsUpDown' && r.rating === 1) {
          return r;
        } else if(r.rating_type === 'NPS' && r.rating > 6) {
            return r;
        } else if(r.rating_type === 'FiveStar' && r.rating > 3) {
          return r;
        } else if ((r.rating_type === null || typeof r.rating_type === 'undefined') && r.rating > 3) {
          return r;
        }
      });

      resp.sort(function (a, b) {
        const a_time = new Date(a.time);
        const b_time = new Date(b.time);
        const time_comparison = a_time > b_time ? -1 : a_time <b_time ? 1 : 0;
        return a.rating < b.rating || time_comparison;
      });

      let overall_rating = 0;

      if (resp.length > 0) {
        resp.map((review) => {
          overall_rating = overall_rating + review.rating;
        });

        overall_rating = overall_rating / resp.length;
      }

      this.setState({ ratings: resp, overall_rating });
    });
  }

  loadTaskRatings(company_url, task_url) {
    getPublicTaskRating(company_url, task_url).then(resp => {
      resp = JSON.parse(resp);
      this.setState({ ratings: resp });
    });
  }

  generateSocialLink(service, url, icon = null) {
    return !!url && (
      <a className={ cx(styles['social-link'], styles[service]) } data-service={ service } href={ url } target="_blank">
        <i className={ `fa fa-${icon || service}` }></i>
      </a>
    );
  }

  convertFirstLetterToUppercase(name) {
    if(!name) {
      return '';
    }

    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  render() {
    const { ratings, profile, isSingle, loading, overall_rating } = this.state;

    let description = 'Keep customers aware of progress';
    let title = 'Arrivy';
    if (profile) {
      if (isSingle) {
        if (ratings && ratings.length > 0) {
          title = this.convertFirstLetterToUppercase(ratings[0].customer_first_name) + '\'s review of ' + profile.fullname;
          description = ratings[0].text;
        } else {
          title = profile.fullname;
          description = 'Click to see details of the review';
        }
      } else {
        title = profile.fullname;
        description = profile.intro;
      }
    }

    let backgroundStyles = null;
    if (this.state.profile !== null && this.state.profile.color !== null && this.state.profile.color !== '') {
      backgroundStyles = {
        backgroundColor: this.state.profile.color
      };
    } else {
      backgroundStyles = {
        backgroundImage: 'linear-gradient(to right, #008bf8 0%,#00d494 100%)'
      };
    }

    return (
      <main className={styles.page}>
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
        <section className={ styles.profile }>
          { isSingle && <div className={ styles['ratings-highlighted'] }>
            <Grid>
              <Row>
                <Col mdOffset={2} md={8} xs={12}>
                  <RatingsView2 ratings={ ratings } hideActions largeSize showShortTime companyProfile={this.state.profile}/>
                </Col>
              </Row>
            </Grid>
          </div> }

          <div className={ styles['profile-image'] } style={backgroundStyles}>
            { !loading && <img src={ profile.image_path || '/images/user.png' } alt={ profile.fullname }/> }
          </div>
          <Grid>
            <Row>
              <Col md={12}>
                { loading
                  ? <div className={ styles.loading }>
                    <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                  </div>
                  : <Row>
                    <Col mdOffset={2} md={8} sm={12}>
                      <div className={ styles.info }>
                        { !!profile.fullname && <div className={ styles.fullname }>{ profile.fullname }</div> }
                        { !!profile.intro && <div className={ styles.intro }>{ profile.intro }</div> }
                        { !!profile.address && <div className={ styles.address }>{ profile.address }</div> }
                        { !!profile.website && <div className={ styles.website }>
                          <a href={ profile.website } target="_blank">{ profile.website }</a>
                        </div> }
                        { !!profile.mobile_number && <div className={ styles.phone }>
                          <a href={ `tel:${profile.mobile_number}` }>
                            <i className="fa fa-mobile-phone" style={ { fontSize: 24 } }/> { profile.mobile_number }
                          </a>
                        </div> }
                        { !!profile.support_email && <div className={ styles.email }>
                          <a href={ `mailto:${profile.support_email}` }>
                            <i className="fa fa-envelope"/> { profile.support_email }
                          </a>
                        </div> }
                        <div className={ styles.socials }>
                          { profile.social_links ? this.generateSocialLink('facebook', profile.social_links.facebook) : null }
                          { profile.social_links ? this.generateSocialLink('google', profile.social_links.google) : null }
                          { profile.social_links ? this.generateSocialLink('yelp', profile.social_links.yelp) : null }
                          { profile.social_links ? this.generateSocialLink('angieslist', profile.social_links.angieslist, 'comment-o') : null }
                          { profile.social_links ? this.generateSocialLink('thumbtack', profile.social_links.thumbtack, 'thumb-tack') : null }
                          { profile.social_links ? this.generateSocialLink('twitter', profile.social_links.twitter, 'twitter') : null }
                        </div>
                      </div>
                      { !!profile.details && <div className={ styles.details }>
                        <div className="text-center">
                          { profile.details.length > this.state.truncateLimit ? profile.details.slice(0, this.state.truncateLimit) : profile.details }
                          { profile.details.length > this.state.truncateLimit && <span>... <button className={styles.showMoreBtn} onClick={(e) => this.showFullText(e)}>[Show More]</button></span> }
                          { profile.details.length === this.state.truncateLimit && <span><button className={styles.showMoreBtn} onClick={(e) => this.showTruncatedText(e)}>[Show Less]</button></span> }
                        </div>
                      </div> }
                      { !isSingle && ratings && (ratings.length > 0) && <div className={ styles.reviews }>
                        <h3>Reviews</h3>
                        { /*<div className={ styles['item-stars'] }>
                        <StarRatingComponent
                          name={'overall rating'}
                          starColor={'#00DC9A'}
                          emptyStarColor={'#9f9f9f'}
                          editing={false}
                          value={overall_rating}
                        />
                        <span>{ratings.length} reviews</span>
                      </div>*/ }
                        <RatingsView overflow={false} ratings={ ratings } showShortTime hideActions largeSize companyProfile={this.state.profile}/>
                      </div> }
                    </Col>
                  </Row> }
              </Col>
            </Row>
          </Grid>
        </section>
        <footer>
          <FooterComponent links={FooterConfiguration} slimFooter/>
        </footer>
      </main>
    );
  }
}

Profile.contextTypes = {
  router: PropTypes.object.isRequired
};
