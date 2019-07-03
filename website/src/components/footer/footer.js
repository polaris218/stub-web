import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col /* , Form, FormControl, ControlLabel, FormGroup, Button*/ } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './footer.module.scss';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import cx from 'classnames';

class FooterComponent extends Component {
  constructor(props) {
    super(props);

    this.subscribe = this.subscribe.bind(this);
    this.renderLinks = this.renderLinks.bind(this);
    this.renderSocialLinks = this.renderSocialLinks.bind(this);
  }

  subscribe(e) {
    e.preventDefault();
    e.stopPropagation();

    const email = findDOMNode(this.refs.email).value.trim();
    if (this.props.emailSubscribeHandler) {
      this.props.emailSubscribeHandler(email);
    }
  }

  renderLinks(linkList) {
    return (<ul className="list-unstyled">
      {linkList.map((item, idx) => {
        const { href, label } = item;
        return (
          <li key={idx} className={styles.link}>
            {item.new_window
              ?
              <a href={href} target='_blank' className={styles['contact-text-gray']}>{label}</a>
              :
              <Link to={href} className={styles['contact-text-gray']}>{label}</Link>
            }
          </li>
        );
      })}
    </ul>);
  }

  renderSocialLinks(socialLinks) {
    return socialLinks.map((social) => {
      const { type, href, title } = social;
      return (
        <a key={title} className={styles['social-link']} title={title} href={href} target="_blank">
          <i className={classNames('fa', `fa-${type}`)} />
        </a>
      );
    });
  }

  render() {
    const { links, slimFooter } = this.props;
    const { developerLinks, company_nameLinks, socialLinks } = links;
    return (
      <section className={styles.mlt10}>
        <Grid className={styles['contact-container']}>
          { !slimFooter ? <div className={styles['contact-contacts']}>
            <Col md={12} sm={12}>
              <Row>
                <Col sm={3}>
                  <p className={styles['contact-text']}><strong>DEVELOPER</strong></p>
                  { this.renderLinks(developerLinks) }
                </Col>
                <Col sm={3}>
                  <p className={styles['contact-text']}><strong>COMPANY</strong></p>
                  { this.renderLinks(company_nameLinks) }
                </Col>
                <Col sm={6} className="text-center">
                  <p className={styles['contact-text']}><strong>STAY IN TOUCH</strong></p>
                  <div className={styles['social-links-block']}>
                    { this.renderSocialLinks(socialLinks) }
                  </div>
                </Col>
              </Row>
            </Col>
          </div> : null }
          <Row>
            <Col md={12}>
              <div className={cx('text-center', styles['footerCopyright'])}>
                <p className={styles['copyright']}>&copy; Arrivy, Inc. - All Rights Reserved</p>
              </div>
            </Col>
          </Row>
        </Grid>
      </section>
    );
  }
}

FooterComponent.propTypes = {
  links: PropTypes.object.isRequired,
  emailSubscribeHandler: PropTypes.func,
  slimFooter: PropTypes.bool
};

export default FooterComponent;
