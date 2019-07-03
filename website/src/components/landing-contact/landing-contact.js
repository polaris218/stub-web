import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import { Gmaps, Marker } from 'react-gmaps';
import styles from './landing-contact.module.scss';

class LandingContact extends Component {
  renderContactList(linkList) {
    return linkList.map((item) => {
      const { href, text } = item;

      return (
        <li key={text}>
          <a href={href} className={styles['contact-text-gray']}>{text}</a>
        </li>
      );
    });
  }

  render() {
    const { data } = this.props;
    const { contact } = data;
    const { googleMaps, linkList, info } = contact;
    const { size, coordinates, zoom, params } = googleMaps;

    return (
      <section className={styles.contact}>
        <Grid className={styles['contact-container']}>
          <Row className={styles['contact-contacts']}>
            <Col sm={6}>
              <figure className={styles['contact-figure']}>
                <Gmaps width={size.width} height={size.height} lat={coordinates.lat} lng={coordinates.lng} zoom={zoom} params={params}>
                  <Marker lat={coordinates.lat} lng={coordinates.lng} draggable={false} />
                </Gmaps>
              </figure>
            </Col>
            <Col sm={6}>
              <Row>
                <Col sm={5} smOffset={1}>
                  <p className={styles['contact-text']}><strong>ADDRESS</strong></p>
                  <p className={styles['contact-text']}>{ info.company_name }</p>
                  <p className={styles['contact-text']}>{ info.address }</p>
                  <br />
                  <br />
                  <p className={styles['contact-text']}><strong>CONTACTS</strong></p>
                  <p className={styles['contact-text']}>{ info.email }</p>
                  <p className={styles['contact-text']}>{ info.phone }</p>
                </Col>
                <Col sm={6}>
                  <p className={styles['contact-text']}><strong>LINKS</strong></p>
                  <ul className={styles['contact-list']}>
                    { this.renderContactList(linkList) }
                  </ul>
                </Col>
              </Row>
            </Col>
          </Row>
        </Grid>
      </section>
    );
  }
}

LandingContact.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingContact;
