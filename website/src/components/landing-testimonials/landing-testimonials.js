import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import styles from './testimonials.module.scss';

class LandingTestimonials extends Component {
  renderTestimonials(testimonials) {
    return testimonials.map((testimonial) => {
      const { name, bio, text } = testimonial;

      return (
        <Col key={name} sm={6} md={4} componentClass="li" className={styles['testimonials-reviews__item']}>
          <div className={styles['testimonials-reviews__text']}>
            <p className={styles['testimonials-reviews__p']}>{ text }</p>
          </div>
          <div className={classNames(styles['testimonials-reviews__author'], styles['testimonials-reviews__author--short'])}>
            <div className={styles['testimonials-reviews__author-name']}>{ name }</div>
            <div className={styles['testimonials-reviews__author-bio']}>{ bio }</div>
          </div>
        </Col>
      );
    });
  }

  render() {
    const { data } = this.props;
    const heading = data.testimonials && data.testimonials.heading;
    const reviews = data.testimonials && data.testimonials.reviews;

    return (
      <section className={styles.testimonials}>
        <Grid className={styles['testimonials-container']}>
          <Row>
            <Col sm={12}>
              { heading && <h2 className={styles['testimonials-header']}>{ heading }</h2> }
              <ul className={classNames(styles['testimonials-reviews'], 'row')}>
                { this.renderTestimonials(reviews) }
              </ul>
            </Col>
          </Row>
        </Grid>
      </section>
    );
  }
}

LandingTestimonials.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingTestimonials;
