import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, Glyphicon } from 'react-bootstrap';
import Lightbox from 'react-images';
import styles from './landing-gallery.module.scss';

class LandingGallery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lightboxIsOpen: false,
      currentImage: 0
    };
  }

  openLightbox(index, event) {
    event.preventDefault();

    this.setState({
      currentImage: index,
      lightboxIsOpen: true
    });
  }

  gotoNextLightboxImage() {
    this.setState({
      currentImage: this.state.currentImage + 1
    });
  }

  gotoPrevLightboxImage() {
    this.setState({
      currentImage: this.state.currentImage - 1
    });
  }

  closeLightbox() {
    this.setState({
      lightboxIsOpen: false
    });
  }

  renderGalleryItems(items) {
    return items.map((item, i) => {
      const { src } = item;

      return (
        <Col key={src} lg={3} md={4} sm={6} xs={12} className={styles['gallery-item']} onClick={(e) => { this.openLightbox(i, e); }}>
          <a className={styles['gallery-item-link']}>
            <img className={styles['gallery-item-image']} alt src={src} />
            <Glyphicon glyph={'glyphicon-zoom-in'} className={styles['gallery-item-icon']} />
          </a>
        </Col>
      );
    });
  }

  render() {
    const { data } = this.props;
    const { gallery } = data;
    const { lightboxIsOpen, currentImage } = this.state;

    return (
      <section className={styles.gallery}>
        <div className={styles['gallery-wrapper']}>
          <Row className={styles['gallery-row']}>
            { this.renderGalleryItems(gallery) }
          </Row>
        </div>
        <Lightbox currentImage={currentImage} images={gallery} isOpen={lightboxIsOpen} onClose={::this.closeLightbox} onClickPrev={::this.gotoPrevLightboxImage} onClickNext={::this.gotoNextLightboxImage} />
      </section>
    );
  }
}

LandingGallery.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingGallery;
