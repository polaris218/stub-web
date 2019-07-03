import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, Modal } from 'react-bootstrap';
import styles from './movingv3-components.module.scss';

export default class HowItWorks extends Component {

  constructor(props) {
    super(props);
    this.state = {
      videoPopUp : false
    };
    this.mapReviewsArray = this.mapReviewsArray.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {

  }

  showModal() {
    this.setState({
      videoPopUp: true
    });
  }

  closeModal() {
    this.setState({
      videoPopUp: false
    });
  }

  mapReviewsArray() {
    const reviews = this.props.data;
    const renderedReviews = reviews.reviews.map(review => {
      return (
        <Row>
          <Col md={3}>
            <img src={review.company_logo} alt="" className="img-responsive" />
          </Col>
          <Col md={8}>
            <a className={styles.reviewLink} href={review.url}>
              <h2>
                {review.company_name}
              </h2>
              <p>
                <strong>
                  {review.review_text1}
                </strong>
              </p>
              <p>
                {review.review_text2}
              </p>
              <p>
                {review.reviewer_name}
              </p>
            </a>
          </Col>
        </Row>
      );
    });
    return renderedReviews;
  }

  render() {
    return (
      <div className={styles.reviewsContainer}>
        <Grid>
          <Row>
            <Col md={6} xs={12}>
              <h2>How Arrivy Works</h2>
              <a onClick={this.showModal} className={styles.videoClick} >
                <img src="/images/lending/moving/how-arrivy-works-vector.png" alt="" className="img-responsive" />
              </a>
            </Col>
            <Col md={6} xs={12}>
              <div className={styles.reviewContainer}>
                {this.mapReviewsArray()}
              </div>
            </Col>
          </Row>
        </Grid>
        <Modal dialogClassName="video-modal" show={this.state.videoPopUp} onHide={this.closeModal} bsSize="lg">
          <Modal.Header closeButton>
            <Modal.Title>Arrivy - How It works!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><iframe src="https://player.vimeo.com/video/229962479?autoplay=1" width="100%" height="460" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></p>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

}

HowItWorks.propTypes = {
  data: PropTypes.object.isRequired
};
