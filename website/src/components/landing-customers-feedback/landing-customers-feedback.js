import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { Grid, Carousel } from 'react-bootstrap';
import styles from './landing-customers-feedback.module.scss';

class LandingCustomersFeedback extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedSlide : 0
    };

    this.advanceRating = this.advanceRating.bind(this);
  }

  componentWillUnmount(){
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
  }

  componentDidMount() {
    this.timeoutID = setTimeout(() => { this.advanceRating(); }, 7000);
  }

  componentDidUpdate() {
    this.timeoutID = setTimeout(() => { this.advanceRating(); }, 7000);
  }

  advanceRating() {
    this.setState({
      selectedSlide: (this.state.selectedSlide + 1) % this.props.data.customer_reviews.length
    });
  }

  render() {
    const { data } = this.props;
    const customer_reviews = data && data.customer_reviews;
    const selectedText = customer_reviews[this.state.selectedSlide];
    const textComponent = <p className={styles.feedback_item_text}>{selectedText}</p>;


    return (
      <section className={styles.features} id="features-5">
        <div className={styles.vertical_line}></div>
        <div className={styles.customer_section}>
          <div>
            <h3 className={styles.customers_saying_heading}><i>This is what their customers are saying:</i></h3>
          </div>
          <div className={styles.feedback_item}>
            <div>
              <div className={styles.feedback_quote_item}><i className="fa fa-quote-left fa-4x"></i></div>
              {textComponent}
            </div>
          </div>
          <div>
            <Link to='/more_reviews_more_business' style={{fontSize:'22px', 'text-decoration':'underline'}}>Find out why are Arrivy users getting more business and better customer reviews</Link>
          </div>
        </div>
      </section>
    );
  }
}

LandingCustomersFeedback.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingCustomersFeedback;
