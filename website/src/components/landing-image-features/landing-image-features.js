import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Grid, Row, Image } from 'react-bootstrap';
import classNames from 'classnames';
import styles from './image-features.module.scss';
import { LocationMap } from '../';

class LandingImageFeatures extends Component {
  constructor(props, context) {
    super(props, context);
    
    const currentTime = Date.now();
    this.state = {
      devices :  [{
        name: "Neil",
        id: "14390_56269",
        location: {
            lat: 47.610255,
            lng: -122.339800,
          },
        time: currentTime
        }
      ]
    }
  }

  renderFeatureImages(images) {
    return images.map((image) => {
      return (
        <div key={image} className={styles['image-features-usage-flex-item']}>
          <img className={styles['image-features-usage-flex-item-image']} src={image} />
        </div>
      );
    });
  }

  getHeightForMap(){
    if ($(document).width() < 720 ) {
      return '250px';
    } else {
      return '40vh';
    }
  }

  render() {
    const { data } = this.props;
    const images = data && data['image-features'];

    return (
      <div>
        <section className={styles['image-features']}>
          <Grid>
            <Row>
              {/* div className={styles.featuresIntro}>How It Works!</div> */}
              {/* <div className={styles.featuresDesc}>
                Integrating live tracking made easy. Send location data from
                <p className={styles.featuresDescDetailed}> Arrivy Driver App - Your Apps - Services - Devices, Tags, Assets - Systems</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <img style={{ width:'100%', maxWidth:'650px' }} src="images/illustration.png" href="/demo" />
              </div>
              <div className={styles.featuresDesc}>
                Retrieve in real-time location for your entities in
                <p className={styles.featuresDescDetailed}> Your consumer Apps - Admin Apps - Portals - Services - Systems</p>
              </div> */}
              <div className={styles['videoContainer']}>
                <iframe src="https://player.vimeo.com/video/229962479" webkitallowfullscreen mozallowfullscreen allowFullScreen></iframe>
              </div>
            </Row>
          </Grid>
        </section>
      </div>
    );
  }
}

LandingImageFeatures.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingImageFeatures;
