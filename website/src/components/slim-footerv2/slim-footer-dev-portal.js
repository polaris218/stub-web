import React, { Component } from 'react';
import styles from './slim-footer-dev-portal.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebookF } from '@fortawesome/fontawesome-free-brands';
import { faPhone, faEnvelope } from '@fortawesome/fontawesome-free-solid';
import { Link } from 'react-router-dom';

export default class SlimFooterDevPortal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      socialMedia: [
        {
          type: 'Twitter',
          link: 'https://twitter.com/arrivy_platform',
          icon: faTwitter
        },
        {
          type: 'Facebook',
          link: 'https://facebook.com/arrivy',
          icon: faFacebookF
        }
      ]
    };

    this.renderFooterNavigation = this.renderFooterNavigation.bind(this);
    this.renderFooterSocialMedia = this.renderFooterSocialMedia.bind(this);

  }

  renderFooterNavigation() {
    const linksArray = this.state.menuItems;
    const renderedNavigation = linksArray.map((link, index) => {
      return (
        <li key={'footer_nav_idx_' + index}>
          <a href={link.link}>{link.title}</a>
        </li>
      );
    });
    return renderedNavigation;
  }

  renderFooterSocialMedia() {
    const linksArray = this.state.socialMedia;
    const renderedSocialMedia = linksArray.map((link, index) => {
      return (
        <li key={'footer_social_media_idx_' + index}>
          <a target="_blank" href={link.link}>
            <FontAwesomeIcon icon={link.icon} />
          </a>
        </li>
      );
    });
    return renderedSocialMedia;
  }

  render () {
    return (
      <div className={styles.footerContainer}>
        <div className={styles.footerLinks}>
          <div className={styles.footerNavigation}>
            <ul className={styles.navigation}>
              <li>
                <span>&copy; 2019 Arrivy, Inc.</span>
              </li>
              <li>
                <Link to="/terms">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className={styles.footerNavigation}>
            <ul className={styles.navigation}>
              <li>
                <Link to="/about_us">About Arrivy</Link>
              </li>
              <li>
                <a href="mailto:info@arrivy.com">
                  <FontAwesomeIcon icon={faEnvelope} /> &nbsp; info@arrivy.com
                </a>
              </li>
              <li>
                <a href="tel:8559277489">
                  <FontAwesomeIcon icon={faPhone} /> &nbsp; 855 927-7489
                </a>
              </li>
            </ul>
            <ul className={styles.footerSocialMedia}>
              {this.renderFooterSocialMedia()}
              <li key={'footer_social_media_idx_placeholder'} className={styles.socialMediaPlaceholder}>
                <a>
                  &nbsp;
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
