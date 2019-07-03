import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './landingv2-reviews.module.scss';
import { Modal, Button, Form, FormControl, FormGroup, Grid, ControlLabel, Col, Row, Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

class Landingv2Reviews extends Component {
    constructor(props) {
        super(props);
        this.state = {currentSlide: 0};
        this.handleClick = this.handleClick.bind(this);
    }

    downloadWhitePaperPage() {
      window.location = 'https://www.arrivy.com/thesecretsauce';
    }

    renderPromoBottomItems(items) {
        return items.map((item) => {
            if (item) {
                return (
                    <li className={styles['promo-bottom-item']}>
                        {item}
                    </li>
                );
            }
        });
    }

    renderSlides(items){
        return items.map((item,index) => {
            if (item) {
                return (
                    <Slide active={this.state.currentSlide} itemkey={index} item={item}/>
                );
            }
        });
    }

    handleClick(e) {
        e.preventDefault();
        let slideId = e.target.getAttribute('data-id');
        this.setState({currentSlide: slideId});
    }

    renderSwitches(items){
        return items.map((item,index) => {
            if(item) {
                return (
                    <li data-active={this.state.currentSlide == index}><a data-id={index} onClick={this.handleClick} href="javascript:void(0)"></a></li>
                );
            }
        });
    }

    renderWhitePaper(data) {
      return <Grid>
              <Col xs={12} sm={3} smOffset={3}>
                <img src='/images/lending/whitepaper.png'/>
              </Col>
              <Col xs={12} sm={6} >
                  <p>{data['text-heading']}</p>
                  <h2>{data['text']}</h2>
                  <Button bsSize="large" ref="button" onClick={(e) => {
                              e.preventDefault();
                              this.downloadWhitePaperPage();
                            }}>Download</Button>
              </Col>
            </Grid>;
    }

    render() {
        const { data } = this.props;
        const headerData = data["promo-page"];

        return (
          <div>
            <section className={styles['reviews']} id="landing-reviews" name="landing-reviews">
                    <div>
                        <h2>Reviews</h2>
                        <Grid className={styles["slides-container"]}>
                            {this.renderSlides(data.reviews.slides)}
                            <div className={styles["switches"]}>
                                <ul>
                                    {this.renderSwitches(data.reviews.slides)}
                                </ul>
                            </div>
                        </Grid>
                    </div>
                </section>
                {typeof headerData["promo-bottom"] !== 'undefined' &&
                    <div className={styles['promo-bottom']}>
                        <Grid>
                            <ul>
                                { this.renderPromoBottomItems(headerData["promo-bottom"]) }
                            </ul>
                        </Grid>
                    </div>
                }
                {typeof headerData["whitepaper"] !== 'undefined' &&
                    <div className={styles['whitepaper-section-2']}>
                        { this.renderWhitePaper(headerData["whitepaper"]) }
                    </div>
                }
              </div>);
    }
};

// Single Slide
class Slide extends Component {

    renderLeftBlock(item){  
      let textStyles = null;
      if(item.longText) {
        textStyles = {
          fontSize: '1.2em'
        };
      }

      return (
          <div className={styles["left-block"]}>
              <div className={styles["top-part"]}>
                  <img src={item.avatar} />
                  <h4>{item.title}</h4>
              </div>
              <div className={styles["content"]} style={textStyles}>
                  <p>{item.text}</p>
              </div>
              <div className={styles["bottom-link"]}>
                {item.externalLink
                  ?
                  <a href={item.linkUrl} target="_blank">{item.linkText}</a>
                  :
                  <Link to={item.linkUrl}>{item.linkText}</Link>
                }
              </div>
          </div>
      );
    }

    renderRightBlock(item){
        return (
            <div className={styles["right-block"]}>
                <div className={styles["top-part"]}>
                    <h4>{item.title}</h4>
                </div>
                <div className={styles["content"]}>
                    <p>{item.text}</p>
                    <p>{item.text2}</p>
                </div>
                <div className={styles["bottom-link"]}><Link to={item.linkUrl}>{item.linkText}</Link></div>
            </div>
        );
    }

    render() {
        return (
            <div data-active={this.props.itemkey == this.props.active} className={styles["slide"]}>
                <Row>
                    <Col md={6}>
                        {this.renderLeftBlock(this.props.item.item1)}
                    </Col>
                    <Col md={6}>
                        {this.renderRightBlock(this.props.item.item2)}
                    </Col>
                </Row>
            </div>
        );
  }
};

Landingv2Reviews.propTypes = {
  data: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default Landingv2Reviews;
