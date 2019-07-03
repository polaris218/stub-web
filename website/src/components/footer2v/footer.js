import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './footer.module.scss';
import { Link } from 'react-router-dom';
import { Modal, Button, Form, FormControl, FormGroup, Grid, ControlLabel, Col, Row, Dropdown, MenuItem } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/fontawesome-free-regular';
import { faPhone } from '@fortawesome/fontawesome-free-solid';


class Footer2v extends Component {

    renderFooterItems(items) {
        const length = items && items.length ? items.length : 0;
        return items.map((item, i) => {
            if (item && i == 0) {
                return (
                    <Col className={styles["footerColmn"]} xs={6} sm={3} md={3} lgOffset={2} lg={2}>
                        <h4>{item["title"]}</h4>
                        <ul className={styles["links"]}>
                            {this.renderLinks(item["links"])}
                        </ul>
                    </Col>
                );
            } else if(item && i == length - 1){
                return (
                    <Col className={styles["footerColmn"]} xs={6} sm={3} md={3} lg={2}>
                        <h4>{item["title"]}</h4>
                        <div className={styles["footerItems"]}>
                            {this.renderIcons(item["links"])}
                        </div>
                        <p className={styles["text"]}>{item["text"]}</p>
                        <p className={styles["mail"]}><FontAwesomeIcon icon={faEnvelope} /> &nbsp;<a href={'mailto:' + item["mail"]}>{item["mail"]}</a></p>
                        <p className={styles["phone"]}><FontAwesomeIcon icon={faPhone} /> &nbsp;<a href={'tel:' + item["phone_link"]}>{item["phone"]}</a></p>
                    </Col>
                );
            } else {
                return (
                    <Col className={styles["footerColmn"]} xs={6} sm={3} md={3} lg={2}>
                        <h4>{item["title"]}</h4>
                        <ul className={styles["links"]}>
                            {this.renderLinks(item["links"])}
                        </ul>
                    </Col>
                );
            }
        });
    }

    renderLinks(items){
      return items.map((item, i) => {
        if (item) {
          return (
            <li>
              {item["externalLink"]
                ?
                <a href={item["link"]} target="_blank">{item["title"]}</a>
                :
                <Link to={item["link"]}>{item["title"]}</Link>
              }
            </li>
          );
        }
      });
    }

    renderIcons(items){
        return items.map((item, i) => {
            if (item) {
                return (
                    <a className={styles[item["type"]]} href={item["href"]} title={item["title"]}></a>
                );
            }
        });
    }

    render() {
        const { data } = this.props;
        const footerImage = data["fake-components"];
        const footerData = data["footer_data"];


        return (<section className={styles['footer']}>
                    <Grid>
                        <Row>
                            { this.renderFooterItems(footerData["columns"]) }
                        </Row>
                        <Row>
                            <Col md={12}>
                                <p className={styles["copyr"]}>{footerData["copyright"]}</p>
                            </Col>
                        </Row>
                    </Grid>
                </section>)
    }
};

Footer2v.propTypes = {
  headerImage: PropTypes.string,
  data: PropTypes.object.isRequired
};

export default Footer2v;
