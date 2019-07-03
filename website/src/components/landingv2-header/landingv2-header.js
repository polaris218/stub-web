import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, FormControl, FormGroup, Grid, ControlLabel, Col, Row, Dropdown, MenuItem } from 'react-bootstrap';
import styles from './landingv2-header.module.scss';
import Landingv2HeaderCustomerLogos from './landing2-header-cutomer-logos';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import history from '../../configureHistory';

class Landingv2Header extends Component {

    constructor() {
        super();
        this.state = {
            modalIsOpen: false,
            showVideoButton: false
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.tryArrivy = this.tryArrivy.bind(this);
    }

    componentWillMount(){
      if(this.props.data["headerTexts"]["right_part_promo_2"]){
        this.setState({showVideoButton:true});
      }
    }

    tryArrivy(e){
        e.preventDefault();
        const { data } = this.props;
        const dataItem = data["headerTexts"];
        if(dataItem['button_url'] !== '') {
            window.location.href=dataItem['button_url'];
        } else {
            history.push('/signup');
        }
    }

    renderHeaderBottom(texts) {
        return texts.map((item, i) => {
            if (item) {
                return (
                    <li>
                        {item}
                    </li>
                );
            }
        });
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }


    render() {
        const { data } = this.props;
        const dataItem = data["headerTexts"];
        const headerImages = data["fake-components"];
        const headerStyle = {
          backgroundImage: `url("${dataItem.title_background}")`
        };

        let class_names = styles['center-text'];
        if (dataItem.largeSize) {
          class_names = cx(styles['center-text'], styles['large-size']);
        }

        return (
            <section className={styles['landing-header']}>
                <div className={styles['header-top-wrapper']}>
                    <Grid className={styles['form-grid']}>
                        <Row className={styles['header-top']} style={headerStyle}>
                            <Col sm={12} md={6} lg={7} className={styles['header-top-area']}>
                                <div className={class_names}>
                                    <h1>{dataItem["title"]}</h1>
                                    <h2>{dataItem["subtitle"]}</h2>
                                    <div className={styles['buttons-block']}>
                                      {this.state.showVideoButton &&
                                        <span>
                                          {dataItem["right_part_promo_2"].type == 'external'
                                            ?
                                            <a href={dataItem["right_part_promo_2"].href} className={styles['blue-btn']} onClick={this.openModal} target="_blank">{dataItem["right_part_promo_2"].text}</a>
                                            :
                                            <Link to={dataItem["right_part_promo_2"].href} className={styles['blue-btn']} onClick={this.openModal}>{dataItem["right_part_promo_2"].text}</Link>
                                          }
                                        </span>
                                      }
                                      <Link to="#" onClick={this.tryArrivy}>{dataItem["button"]}</Link>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={12} md={6} lg={5}>
                                <div className={styles['right-text']}>
                                  <div className={styles['button-holder']}>
                                    <button id='openmodal-button' onClick={this.openModal}>{dataItem["right_part_button"]}</button>
                                  </div>
                                </div>
                            </Col>
                            <Modal dialogClassName="video-modal" show={this.state.modalIsOpen} onHide={this.closeModal} container={this.props.container} bsSize="lg">
                                <Modal.Header closeButton>
                                    <Modal.Title>Arrivy - How It works!</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p><iframe src="https://player.vimeo.com/video/229962479?autoplay=1" width="100%" height="460" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></p>
                                </Modal.Body>
                            </Modal>
                        </Row>
                    </Grid>
                </div>

                <Landingv2HeaderCustomerLogos data={data}/>

            </section>

        )
    }
}

Landingv2Header.propTypes = {
  data: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired
};

export default Landingv2Header;
