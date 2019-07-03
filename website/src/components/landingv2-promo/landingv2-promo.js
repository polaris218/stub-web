import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './landingv2-promo.module.scss';
import { Modal, Button, Form, FormControl, FormGroup, Grid, ControlLabel, Col, Row, Dropdown, MenuItem } from 'react-bootstrap';

class Landingv2Promo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            modalHeader: '',
            modalContent1: '',
            modalContent2: '',
            modalImage1: '',
            modalImage2: '',

        };
        this.close = this.close.bind(this);
        this.modalRender = this.modalRender.bind(this);
    }

    renderPromoItems(items) {
        var clearfix = "";
        return items.map((item,index) => {
            var isEven = (index % 2) == 1;
            if (item) {
                return (
                    <Col className={styles['promo-item']} sm={6} md={6} lg={6}>
                        <div><img src={item["image"]} /></div>
                        <h3>{item["heading"]}</h3>
                        <p>{item["text"]}</p>
                        <Button className={styles.readMore} id={item["heading"].replace(/\s+/g, '-').toLowerCase()} onClick={this.modalRender.bind(null, item["heading"])}>
                            Read More
                        </Button>
                        { item["type"] === 'mobile' ?
                          <p style={{ paddingTop: '10px' }}><a href={"https://play.google.com/store/apps/details?id=com.insac.can.pinthatpoint&hl=en"}><img className={styles['footer-storage-badge']} src="images/google_badge.png" /></a>
                          <a href={"https://itunes.apple.com/us/app/pinthatpoint-go/id1177367972?ls=1&mt=8"}><img className={styles['footer-storage-badge']} src="images/appstore_badge.png" /></a></p> : null
                        }
                    </Col>
                );
            }
        });
    }

    watchVideo() {
        document.getElementById('openmodal-button').click();
    }

    modalRender(clickId) {
        const { data } = this.props;
        const modalData = data["features_drilldown"];
        return modalData["features-items"].map((key, value) => {
            if (key["heading"] === clickId) {
                this.setState({
                    modalHeader: key["heading"],
                    modalContent1: key["text1"],
                    modalContent2: key["text2"],
                    modalImage1: key["image1"],
                    modalImage2: key["image2"],
                    showModal: true,
                });
            }
        });
    }

    close() {
        this.setState({ showModal: false, });
    }


    render() {
        const { data } = this.props;
        const headerData = data["promo-page"];
        const headerImages = data["fake-components"];
        let promoBackgroundColor = "#FFFFFF";
        if (headerData["background-color"]) {
          promoBackgroundColor = headerData["background-color"];
        }
        return (
            <section className={styles['promo']} style={{backgroundColor: promoBackgroundColor}} id="landing-features" name="landing-features">
                <div className={styles['promo-content']}>
                    <Grid>
                        <Row>
                            { this.renderPromoItems(headerData["promo-items"]) }
                        </Row>
                        <div className={styles["centered-blue"]}>
                            <Button bsSize="large" className={styles['carousel-item-hero-btn']} ref="button" onClick={(e) => {
                                  e.preventDefault();
                                  this.watchVideo();
                                }}>See how Arrivy works</Button>
                        </div>
                    </Grid>
                </div>
                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <h3>{this.state.modalHeader}</h3>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className={styles.featuresModalsContent}>
                            {this.state.modalContent1}
                        </p>
                        <div className={styles.modalImages}>
                            <img className="img-responsive" src={this.state.modalImage1} alt="" />
                            {this.state.modalImage2 !== '' &&
                                <img className="img-responsive" src={this.state.modalImage2} alt="" />
                            }
                        </div>
                        <p className={styles.featuresModalsContent}>
                            {this.state.modalContent2}
                        </p>
                    </Modal.Body>
                </Modal>
            </section>
        );
    }
};

Landingv2Promo.propTypes = {
  data: PropTypes.object.isRequired
};

export default Landingv2Promo;
