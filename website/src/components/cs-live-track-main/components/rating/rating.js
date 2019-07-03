import React, { Component } from 'react';
import styles from './rating.module.scss';
import { Button, Modal, Col, Row } from 'react-bootstrap';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { sendRecommendation } from '../../../../actions';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import { getErrorMessage } from '../../../../helpers/task';
import RatingType from '../../../rating-type/rating-type';

export default class Rating extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rate: -1,
      rateButton: false,
      feedback: '',
      rated: false,
      loading: false,
      recommendForm: false,
      recommendationText: '',
      emailAddresses: '',
      emailConfirmationText: '',
      errorOccurred: false,
      ratedOnce: -1,
      emailError: false,
      negativeRateLimit: 3,
      positiveRateLimit: 4
    };

    this.onChangeRate = this.onChangeRate.bind(this);
    this.rateClick = this.rateClick.bind(this);
    this.changeFeedback = this.changeFeedback.bind(this);
    this.generateSocialIcon = this.generateSocialIcon.bind(this);
    this.recommendFormToggle = this.recommendFormToggle.bind(this);
    this.changeRecommendationText = this.changeRecommendationText.bind(this);
    this.changeEmailAddresses = this.changeEmailAddresses.bind(this);
    this.sendClick = this.sendClick.bind(this);
    this.renderRecommendationForm = this.renderRecommendationForm.bind(this);
  }

  componentDidMount() {
    let negativeRateLimit = 3;
    let positiveRateLimit = 4;
    if (!this.props.company.rating_type || this.props.company.rating_type === 'FiveStar') {
      negativeRateLimit = 3;
      positiveRateLimit = 4;
    }
    else if (this.props.company.rating_type === 'NPS') {
      negativeRateLimit = 6;
      positiveRateLimit = 7;
    } else if (this.props.company.rating_type === 'ThumbsUpDown') {
      negativeRateLimit = 0;
      positiveRateLimit = 1;
    }
    this.setState({
      negativeRateLimit,
      positiveRateLimit
    });
  }

  onChangeRate(rate) {
    let feedback = this.state.feedback;
    let negativeRateLimit = this.state.negativeRateLimit;
    let positiveRateLimit = this.state.positiveRateLimit;
    if ((this.state.rate < positiveRateLimit && rate > negativeRateLimit) || (this.state.rate > negativeRateLimit && rate < positiveRateLimit)) {
      feedback = '';
    }
    if (this.state.ratedOnce === -1) {
      this.setState({
        rate,
        rateButton: true,
        feedback,
        ratedOnce: rate
      });
    } else {
      this.setState({
        rate,
        rateButton: true,
        feedback
      });
    }
  }

  rateClick() {
    this.setState({
      loading: true
    });
    this.props.rate(this.state.rate, this.state.feedback, this.props.company.rating_type).then((res) => {
      this.setState({
        rated: true,
        loading: false
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  sendClick() {
    if (this.state.emailAddresses === '') {
      this.setState({
        emailError: true
      });
      return;
    }
    this.setState({
      loading: true,
    });
    const team_members_list=[];
    this.props.entities.map((entity)=>{
      team_members_list.push(entity.name);

    });
    let team_members=JSON.stringify(team_members_list);
    let company_name = this.props.name;
    let task_url = this.props.task_url;
    let customer_id = this.props.customerID;
    let customer_name = this.props.customerName;
    let email_addresses = JSON.stringify(this.state.emailAddresses);
    let email_content = this.state.recommendationText;
    sendRecommendation(company_name, task_url, customer_id, customer_name, email_addresses, email_content, team_members).then((res) => {
      this.setState({
        loading: false,
        emailConfirmationText: 'Email sent! Thank you for recommending us.',
        recommendForm: false,
        emailError: false,
      });
    }).catch((e) => {
      const error = e.responseText;
      let errorMsg = getErrorMessage(error);
      this.setState({
        emailConfirmationText: errorMsg,
        loading: false,
        errorOccurred: true,
        recommendForm: false,
        emailError: false
      });
    });
  }

  changeFeedback(e) {
    const feedback = e.target.value;

    this.setState({
      feedback
    });
  }

  getInitialState(){
    this.setState({
      recommendForm: false
    });
    return this.state.recommendForm;
  }

  recommendFormToggle() {
    if (this.getInitialState()) {
      this.setState({
        recommendForm: false,
      });
    } else {
      this.setState({
        recommendForm: true,

      });
      this.getInitialRecommendationText();
    }
  }

  changeRecommendationText(txt) {
    this.setState({
      recommendationText: txt.target.value
    });
  }

  changeEmailAddresses(em) {
    this.setState({
      emailAddresses: em.target.value
    });
  }

  getInitialRecommendationText() {
    const companyProfile = this.props.company;
    const text = 'Hi,\nI would like to recommend '+ companyProfile.fullname + '. They did a great job for me. You can contact them at: \n\n' + companyProfile.fullname + ' \n' + companyProfile.website + ' \n' + companyProfile.mobile_number + '\n' + companyProfile.support_email + '\n \n' + this.props.customerName;
    this.setState({
      recommendationText: text,
    });
  }

  generateSocialIcon(type, icon) {

    let className = [styles['social-link']];
    if (type === 'facebook') {
      className.push(styles['facebook']);
    } else if (type === 'google') {
      className.push(styles['google']);
    } else if (type === 'yelp') {
      className.push(styles['yelp']);
    } else if (type === 'angieslist') {
      className.push(styles['angieslist']);
    } else if (type === 'thumbtack') {
      className.push(styles['thumbtack']);
    } else if (type === 'twitter') {
      className.push(styles['twitter']);
    }
    className = className.join(' ');

    return (
      <a
        className={className}
        title={type}
        href={this.props.social_links[type]}
        target='_blank'
      >
        <i className={'fa ' + icon} style={{ fontSize: '28px', margin: '6px' }}/>
      </a>
    );
  }

  renderRecommendationForm() {
    const { loading, rated, rate } = this.state;
    return (
      <div>
        {this.state.recommendForm &&
        <div className={ styles.recommendationFormRated } >
          <span className={styles.arrowHead}></span>
          <div className={styles.formGroupCustom}>
            <label>To</label> <input type="text" onChange={this.changeEmailAddresses} value={this.state.emailAddresses} placeholder="email addresses" />
          </div>
          <div className={styles.formGroupCustom}>
            <textarea rows="10" onChange={this.changeRecommendationText}>{this.state.recommendationText}</textarea>
          </div>
          <Row>
            <Col md={6} sm={6} xs={6}>
              {this.state.loading &&
              <SavingSpinner title="Sending" borderStyle="none" size={8} />
              }
              {!this.state.loading &&
              <Button
                type="button"
                className="btn-submit"
                onClick={this.sendClick}
                disabled={ loading }
              >
                Send
              </Button>
              }
            </Col>
            <Col md={6} sm={6} xs={6}>
              <Button bsStyle="link" onClick={this.recommendFormToggle}>
                Cancel
              </Button>
            </Col>
          </Row>
        </div>
        }
        {(this.state.errorOccurred && this.state.emailConfirmationText !== '') &&
        <div className={ styles.errorMsg }>
          {this.state.emailConfirmationText}
        </div>
        }
        {this.state.emailError &&
        <div className={ styles.errorMsg }>
          Email field cannot be empty.
        </div>
        }
        {(!this.state.errorOccurred && this.state.emailConfirmationText !== '') &&
        <div className={ styles.successMsg }>
          {this.state.emailConfirmationText}
        </div>
        }
      </div>
    );
  }
  renderMessage() {
    const { loading, rated, rate, negativeRateLimit, positiveRateLimit } = this.state;

    let displaySocialsLinks = false;
    // let min_rating = 4;
    // if (this.props.company.min_acceptable_rating) {
    //   min_rating = this.props.company.min_acceptable_rating;
    // }
    if (this.props.social_links && rate > negativeRateLimit) {
      displaySocialsLinks = this.props.social_links['facebook'] ||
        this.props.social_links['yelp'] ||
        this.props.social_links['angieslist'] ||
        this.props.social_links['google'] ||
        this.props.social_links['thumbtack'] ||
        this.props.social_links['twitter'];
    }

    return (<div className={ styles['message'] }>
      <div className={ styles['message-text'] }>Your review is saved!</div>
      <div className={ styles['message-check'] }>
        <i className="fa fa-check"></i>
      </div>
      <div className={styles.recommendationLink}>
        <Button bsStyle="link" className={styles.recommendBtn} onClick={this.recommendFormToggle}>
          <i className="fa fa-share-alt"></i> Recommend us to a friend
        </Button>
      </div>
      {this.renderRecommendationForm()}
      {displaySocialsLinks &&
      <div className={ cx(styles['message-links']) }>
        <div className={ styles['message-links-text'] }>
          We'll appreciate if you can <br/> rate us on
        </div>
        <div className={ styles['message-links-buttons'] }>
          { this.props.social_links && this.props.social_links['yelp'] ? this.generateSocialIcon('yelp', 'fa-yelp') : null }
          { this.props.social_links && this.props.social_links['facebook'] ? this.generateSocialIcon('facebook', 'fa-facebook') : null }
          { this.props.social_links && this.props.social_links['google'] ? this.generateSocialIcon('google', 'fa-google-plus') : null }
          { this.props.social_links && this.props.social_links['angieslist'] ? this.generateSocialIcon('angieslist', 'fa-comment-o') : null }
          { this.props.social_links && this.props.social_links['thumbtack'] ? this.generateSocialIcon('thumbtack', 'fa-thumb-tack') : null }
          { this.props.social_links && this.props.social_links['twitter'] ? this.generateSocialIcon('twitter', 'fa-twitter') : null }
        </div>
      </div>
      }
    </div>);
  }

  renderForm() {
    const { loading, rated, rate, negativeRateLimit, positiveRateLimit } = this.state;
    let min_rating = positiveRateLimit;

    let displaySocialsLinks = false;
    if (this.props.social_links && rate >= min_rating) {
      displaySocialsLinks = this.props.social_links['facebook'] ||
        this.props.social_links['yelp'] ||
        this.props.social_links['angieslist'] ||
        this.props.social_links['google'] ||
        this.props.social_links['twitter'];
    }
    const marginTopStyle = {
      marginTop: "10px",
    }
    return (<div className={styles.form}>

      <div className={styles.rate}>{ this.props.review_prompt_text ? this.props.review_prompt_text : 'Please rate our service' }</div>
      <div className={styles.ratingText}>
        { this.props.company.rating_type === 'ThumbsUpDown' && 'Would you recommend our company to your friends, your colleague or your family members?' }
        { this.props.company.rating_type === 'NPS' && 'On a scale of zero to 10, with 10 being highest, what\'s the likelihood that you would recommend our company to a friend or colleague?' }
      </div>
      <div className={styles.stars}>
        <RatingType
          companyRatingType={(this.props.company.rating_type !== null && typeof this.props.company.rating_type !== 'undefined') ? this.props.company.rating_type : 'FiveStar'}
          onChange={this.onChangeRate}
          value={this.state.rate}
          edit={true}
          starColor="#00DC9A"
        />
      </div>
      <div>
        {(this.state.rate <= negativeRateLimit && this.state.rate >= 0) &&
        <div className={styles.feedback}>
                  <span className={ styles['feedback-text'] }>
                    {
                      this.props.negative_review_prompt_text ?
                        this.props.negative_review_prompt_text :
                        'What went wrong? Please leave a note here and we will try our best to make it up to you!'
                    }

                  </span>
          <textarea rows="5" onChange={this.changeFeedback} value={this.state.feedback}></textarea>
          <Button
            type="button"
            className="btn-submit"
            onClick={this.rateClick}
            disabled={ loading }
          >
            Send Feedback
          </Button>
          {displaySocialsLinks &&
          <div className={ cx(styles['social-links-container']) } style={marginTopStyle}>
            <div className={ styles['message-links-text'] }>
              We'll appreciate if you can  rate us on
            </div>
            <div className={styles.urls}>
              { this.props.social_links && this.props.social_links['yelp'] ? this.generateSocialIcon('yelp', 'fa-yelp') : null }
              { this.props.social_links && this.props.social_links['facebook'] ? this.generateSocialIcon('facebook', 'fa-facebook') : null }
              { this.props.social_links && this.props.social_links['angieslist'] ? this.generateSocialIcon('angieslist', 'fa-comment-o') : null }
              { this.props.social_links && this.props.social_links['google'] ? this.generateSocialIcon('google', 'fa-google-plus') : null }
              { this.props.social_links && this.props.social_links['thumbtack'] ? this.generateSocialIcon('thumbtack', 'fa-thumb-tack') : null }
              { this.props.social_links && this.props.social_links['twitter'] ? this.generateSocialIcon('twitter', 'fa-twitter') : null }
            </div>
          </div>
          }
        </div>

        }
        {this.state.rate >= positiveRateLimit &&
        <div className={styles.feedback}>
          <textarea rows="5" onChange={this.changeFeedback} value={this.state.feedback}
                    placeholder="Write your review here..."></textarea>
          <Row>
            <Col md={3} sm={3} xs={3}>
              <Button
                type="button"
                className={cx(styles['rate-Button'], 'btn-submit')}
                onClick={this.rateClick}
                disabled={ loading }
              >
                Rate
              </Button>
            </Col>
            <Col md={9} sm={9} xs={9}>
              <Button bsStyle="link" className={styles.recommendBtn} onClick={this.recommendFormToggle}>
                <i className="fa fa-share-alt"></i> Recommend us to a friend
              </Button>
            </Col>
          </Row>

          <div className={ styles.clearfixCustom }></div>

          {this.renderRecommendationForm()}
          {displaySocialsLinks &&
          <div className={ cx(styles['social-links-container']) }>
            <div className={ styles['message-links-text'] }>
              We'll appreciate if you can  rate us on
            </div>
            <div className={styles.urls}>
              { this.props.social_links && this.props.social_links['yelp'] ? this.generateSocialIcon('yelp', 'fa-yelp') : null }
              { this.props.social_links && this.props.social_links['facebook'] ? this.generateSocialIcon('facebook', 'fa-facebook') : null }
              { this.props.social_links && this.props.social_links['angieslist'] ? this.generateSocialIcon('angieslist', 'fa-comment-o') : null }
              { this.props.social_links && this.props.social_links['google'] ? this.generateSocialIcon('google', 'fa-google-plus') : null }
              { this.props.social_links && this.props.social_links['thumbtack'] ? this.generateSocialIcon('thumbtack', 'fa-thumb-tack') : null }
              { this.props.social_links && this.props.social_links['twitter'] ? this.generateSocialIcon('twitter', 'fa-twitter') : null }
            </div>
          </div>
          }
        </div>
        }
      </div>
    </div>);
  }

  render() {
    const { loading, rated, rate } = this.state;
    return (
      <Modal show={this.props.showModal} onHide={this.props.closeRating} bsSize="large"
             dialogClassName={styles['transparent-color']}>
        <Modal.Body className={styles['transparent-color']}>
          <div className={styles['rating-c']}>
            <div className={styles.title}>
              Thank you from
            </div>
            <div className={styles.title}>
              {this.props.name}
            </div>
            { rated ? this.renderMessage() : this.renderForm() }

            <div className="text-center">
              <Button
                type="button"
                className={styles['noty-button']}
                onClick={this.props.closeRating}
              >
                { this.state.rated ? "Close" : "No Thanks" }
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
