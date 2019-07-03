/* eslint-disable indent,no-trailing-spaces */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './rating.module.scss';
import StarRatingComponent from 'react-star-rating-component';
import { Button, Modal, Tooltip, OverlayTrigger, Grid, Col, Row } from 'react-bootstrap';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { sendRecommendation } from '../../actions';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { getErrorMessage } from '../../helpers/task';

export default class Rating extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rate: 0,
      rateButton: false,
      feedback: '',
      rated: false,
      loading: false,
      recommendForm: false,
      recommendationText: '',
      emailAddresses: '',
      emailConfirmationText: '',
      errorOccurred: false,
    };

    this.onChangeRate = this.onChangeRate.bind(this);
    this.rateClick = this.rateClick.bind(this);
    this.changeFeedback = this.changeFeedback.bind(this);
    this.generateSocialIcon = this.generateSocialIcon.bind(this);
    this.recommendFormToggle = this.recommendFormToggle.bind(this);
    this.changeRecommendationText = this.changeRecommendationText.bind(this);
    this.changeEmailAddresses = this.changeEmailAddresses.bind(this);
    this.sendClick = this.sendClick.bind(this);
  }

  onChangeRate(rate) {
    let feedback = this.state.feedback;

    if ((this.state.rate < 3 && rate > 2) || (this.state.rate > 2 && rate < 3)) {
      feedback = '';
    }

    this.setState({ rate, rateButton: true, feedback });

    //this.props.rate(rate, this.state.feedback);
  }

  rateClick() {
    this.setState({
      loading: true
    });
    this.props.rate(this.state.rate, this.state.feedback).then((res) => {
      this.setState({
        rated: true,
        loading: false
      });
    });
  }

  sendClick() {
    this.setState({
        loading: true,
    });
    let team_members_list=[];
    const renderedEntites=this.props.entities.map((entity)=>{
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
        });
    }).catch((e) => {
        const error = e.responseText;
        this.setState({ emailConfirmationText: getErrorMessage(error), loading: false, errorOccurred: true, recommendForm: false, });
    });
  }

  changeFeedback(e) {
    const feedback = e.target.value;

    this.setState({ feedback });
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
       this.setState({ recommendationText: txt.target.value });
   }

    changeEmailAddresses(em) {
      this.setState({ emailAddresses: em.target.value });
    }

    getInitialRecommendationText() {
      let team_members=[];
      const renderedEntites=this.props.entities.map((entity)=>{
       team_members.push(entity.name);

      });
      const companyProfile = this.props.company;
      const text = 'Hi,\nI would like to recommend '+ companyProfile.fullname + '. They did a great job for me. You can contact them at: \n\n' + companyProfile.fullname + ' \n' + companyProfile.website + ' \n' + companyProfile.mobile_number + '\n' + companyProfile.support_email + '\n \n' + this.props.customerName;
      this.setState({
          recommendationText: text,
      });
    }

  generateSocialIcon(type, icon) {

    let className = [styles['social-link']];
    if (type == 'facebook') {
      className.push(styles['facebook']);
    } else if (type == 'google') {
      className.push(styles['google']);
    } else if (type == 'yelp') {
      className.push(styles['yelp']);
    } else if (type == 'angieslist') {
      className.push(styles['angieslist']);
    } else if (type == 'thumbtack') {
      className.push(styles['thumbtack']);
    }
    className = className.join(' ');

    return (
        <a
          className={className}
          title={type}
          href={this.props.social_links[type]}
          target="_blank"
        >
          <i className={'fa ' + icon} style={{ fontSize: '28px', margin: '6px' }}/>
        </a>
    );
  }

  renderMessage() {
    const { loading, rated, rate } = this.state;

    let displaySocialsLinks = false;
    let min_rating = 4;
    if (this.props.company.min_acceptable_rating) {
      min_rating = this.props.company.min_acceptable_rating;
    }
    if (this.props.social_links && rate >= min_rating) {
      displaySocialsLinks = this.props.social_links['facebook'] ||
        this.props.social_links['yelp'] ||
        this.props.social_links['angieslist'] ||
        this.props.social_links['google'] ||
        this.props.social_links['thumbtack'];
    }

    return (<div className={ styles['message'] }>
      <div className={ styles['message-text'] }>Your review is saved!</div>
      <div className={ styles['message-check'] }>
        <i className="fa fa-check"></i>
      </div>
      {/*<div className={styles.recommendationLink}>*/}
        {/*<Button bsStyle="link" className={styles.recommendBtn} onClick={this.recommendFormToggle}>*/}
          {/*<i className="fa fa-share-alt"></i> Recommend us to a friend*/}
        {/*</Button>*/}
      {/*</div>*/}
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
                className={cx(styles['rate-Button'], 'btn-submit', styles['sendEmailBtn'])}
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
        {(!this.state.errorOccurred && this.state.emailConfirmationText !== '') &&
        <div className={ styles.successMsg }>
            {this.state.emailConfirmationText}
        </div>
        }
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
        </div>
      </div>
      }
    </div>);
  }

  renderForm() {
    const { loading, rated, rate } = this.state;

    let displaySocialsLinks = false;
    let min_rating = 4;
    if (this.props.company.min_acceptable_rating) {
      min_rating = this.props.company.min_acceptable_rating;
    }
    if (this.props.social_links && rate >= min_rating) {
      displaySocialsLinks = this.props.social_links['facebook'] ||
        this.props.social_links['yelp'] ||
        this.props.social_links['angieslist'] ||
        this.props.social_links['google'];
    }

    return (<div className={styles.form}>

      <div className={styles.rate}>{ this.props.review_prompt_text ? this.props.review_prompt_text : 'Please rate our service' }</div>
      <div className={styles.stars}>
        <StarRatingComponent
          name={'rating'}
          onStarClick={(nextValue) => this.onChangeRate(nextValue)}
          starColor={'#142046'}
          emptyStarColor={'#9f9f9f'}
          editable={false}
          value={this.state.rate}
        />
      </div>
      <div>
        {(this.state.rate < 4 && this.state.rate > 0) &&
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
            className={cx(styles['rate-Button'], 'btn-submit')}
            onClick={this.rateClick}
            disabled={ loading }
          >
            Send Feedback
          </Button>
        </div>
        }
        {this.state.rate > 3 &&
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
            {/*<Col md={9} sm={9} xs={9}>*/}
              {/*<Button bsStyle="link" className={styles.recommendBtn} onClick={this.recommendFormToggle}>*/}
                {/*<i className="fa fa-share-alt"></i> Recommend us to a friend*/}
              {/*</Button>*/}
            {/*</Col>*/}
          </Row>

          <div className={ styles.clearfixCustom }></div>

            {this.state.recommendForm &&
              <div className={ styles.recommendationForm } >
                <span className={styles.arrowHead}></span>
                <div className={styles.formGroupCustom}>
                  <label>To</label> <input type="text" onChange={this.changeEmailAddresses} value={this.state.emailAddresses} placeholder="email addresses" />
                </div>
                <div className={styles.formGroupCustom}>
                  <textarea rows="10" onChange={this.changeRecommendationText}>{this.state.recommendationText}</textarea>
                </div>
                <Row>
                  <Col md={4} sm={4} xs={4}>
                    <Button
                        type="button"
                        className={cx(styles['rate-Button'], 'btn-submit', styles['sendEmailBtn'])}
                        onClick={this.sendClick}
                        disabled={ loading }
                    >
                      Send
                    </Button>
                  </Col>
                  <Col md={8} sm={8} xs={8}>
                    <Button bsStyle="link" onClick={this.recommendFormToggle}>
                      Cancel
                    </Button>
                  </Col>
                </Row>
                  {this.state.loading &&
                    <SavingSpinner title="Sending" borderStyle="none" size={8} />
                  }
              </div>
            }

            {(this.state.errorOccurred && this.state.emailConfirmationText !== '') &&
            <div className={ styles.errorMsg }>
                {this.state.emailConfirmationText}
            </div>
            }
            {(!this.state.errorOccurred && this.state.emailConfirmationText !== '') &&
            <div className={ styles.successMsg }>
                {this.state.emailConfirmationText}
            </div>
            }
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
            </div>
          </div>
          }
        </div>
        }
      </div>
    </div>)
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


Rating.propTypes = {
  name: PropTypes.string.isRequired,
  social_links: PropTypes.object,
  closeRating: PropTypes.func.isRequired,
  rate: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  company: PropTypes.object,
  customerName: PropTypes.string,
  customerID: PropTypes.number,
  entities: PropTypes.array.isRequired,
  review_prompt_text: PropTypes.string.isRequired,
  negative_review_prompt_text: PropTypes.string.isRequired,
  task_url: PropTypes.string
};
