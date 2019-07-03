import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './landingv2-slack.module.scss';
import { Modal, Button, Form, FormControl, FormGroup, Grid, ControlLabel, Col, Row, Dropdown, MenuItem } from 'react-bootstrap';
import history from '../../configureHistory';


class Landingv2Slack extends Component {

    tryArrivy() {
      history.push('/signup');
    }

    render() {
        const { data } = this.props;
        const sluckData = data["slack"];


        return (<section className={styles['slack']}>
                    <div className={styles['slack_integration']}>
                        <Grid className={ styles['form-grid'] }>
                            <Row>
                                <Col md={6} className={styles['enterprise_image']}>
                                  <Col sm={4} md={4} className={styles['slack_logo']}>
                                      <img src={ sluckData['enterprise_img'] } />
                                  </Col>
                                  <Col sm={8} md={8}>
                                      <h2 className={ styles['slack_header']}>
                                          { sluckData["enterprise_title"] }
                                      </h2>
                                      <p>
                                          { sluckData["enterprise_text"] }
                                      </p>
                                  </Col>
                                </Col>
                                <Col md={6} className={styles['slack_image']}>
                                  <Col sm={4} md={4} className={styles['slack_logo']}>
                                      <img src={ sluckData['img'] } />
                                  </Col>
                                  <Col sm={8} md={8}>
                                      <h2 className={ styles['slack_header']}>
                                          { sluckData["title"] }
                                      </h2>
                                      <p>
                                          { sluckData["text"] }
                                      </p>
                                  </Col>
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                    {/*<div className={styles['first_month']}>
                        <h2>First month is on us</h2>
                        <p>No credit card required</p>
                        <Button bsSize="large" className={styles['carousel-item-hero-btn']} ref="button" onClick={(e) => {
                              e.preventDefault();
                              this.tryArrivy();
                            }}>Get Started for Free</Button>
                    </div>*/}
                </section>)
    }
};

Landingv2Slack.propTypes = {
  data: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default Landingv2Slack;
