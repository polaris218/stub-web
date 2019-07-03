import styles from './landing-carousel.module.scss';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Carousel, Button } from 'react-bootstrap';
import assign from 'lodash.assign';

class LandingCarousel extends Component {
  renderCarouselItems(carouselItems) {
    return carouselItems.map((item) => {
      const style = {
        backgroundImage: `url(${item.image})`
      };

      return (
        <Carousel.Item key={item.text}>
          <div className={styles['carousel-item']} style={item.image && style}>
            <div className={styles['carousel-item-wrapper']}>
              <div className={styles['carousel-item-center']}>
                <Grid>
                  <Row>
                    <Col sm={10} smOffset={1}>
                      <div className={styles['carousel-item-hero']}>
                        { item.text && <h2 className={styles['carousel-item-hero-pretext']}>{ item.pretext }</h2> }
                        { item.text && <h1 className={styles['carousel-item-hero-text']} >Arrivy <span id='js-rotating'>
                          automates communication and coordination with team and customers,
                          brings predictability to service appointments,
                          delights customers with an uber-like experience,
                          helps businesses get more positive reviews
                          </span></h1> }
                        <div className={styles['carousel-item-hero-buttons']}>
                          { item.button && (
                            <Button bsSize="large" className={styles['carousel-item-hero-btn']} ref="button" onClick={(e) => {
                              e.preventDefault();
                              this.props.navigateToSignup();
                            }}>{ item.button.label }</Button>
                          ) }
                        </div>
                        <div className={styles['carousel-item-links-section']}>
                        { item.links.map((link, i) => {
                          let linkToDisplay = (<a className={styles['carousel-item-link-text']} id={link.id} href={link.href}>
                            { link.text }
                          </a>);
                          if (link.type === 'modal') {
                            linkToDisplay = (<a className={styles['carousel-item-link-text']} id={link.id} onClick={(e) => {
                              e.preventDefault();
                              this.props.openSubscribeModal();
                            }}>
                              { link.text }
                            </a>);
                          }
                          return <span key={i + '-carousel-item'}>
                          { linkToDisplay }
                          {i !== item.links.length-1 ? <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span> : null}
                          </span>
                        }) }
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </div>
            </div>
          </div>
        </Carousel.Item>
      );
    });
  }

  componentDidMount(){
    $("#js-rotating").Morphext({
      // The [in] animation type. Refer to Animate.css for a list of available animations.
      animation: "fadeIn",
      // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
      separator: ",",
      // The delay between the changing of each phrase in milliseconds.
      speed: 5000,
      complete: function () {
          // Called after the entrance animation is executed.
      }
    });
  }

  render() {
    const { data } = this.props;
    const iconStyle = {
      position: 'absolute',
      top: '50%',
      display: 'inline-block',
      marginTop: '-10px',
      zIndex: 5
    };
    const leftIconStyle = assign({}, iconStyle, {
      left: '50%',
      marginLeft: '-10px'
    });
    const rightIconStyle = assign({}, iconStyle, {
      right: '50%',
      marginRight: '-10px'
    });

    return (
      <section className={styles.carousel}>
        <div className={styles['carousel-container']}>
          <Carousel
            controls={false}
            indicators={false}
            interval={0}>
            { this.renderCarouselItems(data['carousel-items']) }
          </Carousel>
        </div>
      </section>
    );
  }
}

LandingCarousel.propTypes = {
  navigateToSignup: PropTypes.func,
  openSubscribeModal: PropTypes.func,
  data: PropTypes.object.isRequired
};

export default LandingCarousel;
