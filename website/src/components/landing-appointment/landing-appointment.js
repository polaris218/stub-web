import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import styles from './landing-appointment.module.scss';

class LandingAppointment extends Component {
  render() {
    const { data } = this.props;
    const heading = data.appointment && data.appointment.heading;
    const text = data.appointment && data.appointment.text;

    return (
      <section className={styles.appointment}>
        <Grid className={styles['appointment-container']}>
          <Row className={styles['appointment-header']}>
            <Col sm={4}>
              { heading && <h3 className={styles['appointment-header-text']}>{ heading }</h3> }
              { text && <p>{ text }</p> }
            </Col>
            <Col sm={8}>
              <a id="Setmore_button_iframe" style={{ float: 'none' }} href="https://my.setmore.com/bookingpage/73b5ab7c-aca7-4f3e-ad3b-73e83af7d87f">
                <img src="https://my.setmore.com/images/bookappt/SetMore-book-button.png" alt="Book an appointment using SetMore" />
              </a>
            </Col>
          </Row>
        </Grid>
      </section>
    );
  }
}

LandingAppointment.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingAppointment;
