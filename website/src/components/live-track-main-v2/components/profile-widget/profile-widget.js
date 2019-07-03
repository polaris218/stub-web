import React, { Component } from 'react';
import styles from './profile-widget.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faThumbtack } from '@fortawesome/fontawesome-free-solid';
import { faComment } from '@fortawesome/fontawesome-free-regular';
import { faFacebookF, faGoogle, faYelp, faTwitter } from '@fortawesome/fontawesome-free-brands';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import cx from 'classnames';
import config from '../../../../config/config'
const env = config(self).env

export default class ProfileWidget extends Component {
  constructor(props) {
    super(props);

    this.renderProfileLinks = this.renderProfileLinks.bind(this);

  }

  renderProfileLinks() {
    const profile = this.props.profile;
    const email = profile.support_email;
    const phone = profile.mobile_number;
    const socialLinks = profile.social_links;
    let profileLinks = [];
    if (email !== null || email !== '') {
      profileLinks.push({
        icon: faEnvelope,
        link: 'mailto:' + email,
        tooltipMsg: 'Support Email',
        linkType: 'primary'
      });
    }
    if (phone !== null || phone !== '') {
      profileLinks.push({
        icon: faPhone,
        link: 'tel:' + phone,
        tooltipMsg: 'Phone',
        linkType: 'primary'
      });
    }
    if (socialLinks && socialLinks !== null && this.props.showLinks) {
      if (socialLinks.facebook && (socialLinks.facebook !== '' || socialLinks.facebook !== null)) {
        profileLinks.push({
          icon: faFacebookF,
          link: socialLinks.facebook,
          tooltipMsg: 'Facebook',
          linkType: 'social'
        });
      }
      if (socialLinks.angieslist && (socialLinks.angieslist !== '' || socialLinks.angieslist !== null)) {
        profileLinks.push({
          icon: faComment,
          link: socialLinks.angieslist,
          tooltipMsg: "Angie's List",
          linkType: 'social'
        });
      }
      if (socialLinks.google && (socialLinks.google !== '' || socialLinks.google !== null)) {
        profileLinks.push({
          icon: faGoogle,
          link: socialLinks.google,
          tooltipMsg: 'Google',
          linkType: 'social'
        });
      }
      if (socialLinks.thumbtack && (socialLinks.thumbtack !== '' || socialLinks.thumbtack !== null)) {
        profileLinks.push({
          icon: faThumbtack,
          link: socialLinks.thumbtack,
          tooltipMsg: 'Thumbtack',
          linkType: 'social'
        });
      }
      if (socialLinks.yelp && (socialLinks.yelp !== '' || socialLinks.yelp !== null)) {
        profileLinks.push({
          icon: faYelp,
          link: socialLinks.yelp,
          tooltipMsg: 'Yelp',
          linkType: 'social'
        });
      }
      if (socialLinks.twitter && (socialLinks.twitter !== '' || socialLinks.twitter !== null)) {
        profileLinks.push({
          icon: faTwitter,
          link: socialLinks.twitter,
          tooltipMsg: 'Twitter',
          linkType: 'social'
        });
      }
    }
    let color = '';
    if (profile && profile.show_brand_color && profile.color) {
      color = profile.color;
    }
    return profileLinks.map((contactLink) => {
      // const tooltipContent = (<Tooltip id={'idx_contact_link_' + contactLink.tooltipMsg}>{contactLink.tooltipMsg}</Tooltip>);
      const linkTypeClass = 'linkType_' + contactLink.linkType;
      const linkClass = styles[linkTypeClass];
      return (
        <a className={linkClass} style={{ color }} href={contactLink.link}><FontAwesomeIcon icon={contactLink.icon} /></a>
      );
    });
  }

  render() {
    const profile = this.props.profile;

    let color = '';
    if (profile && profile.show_brand_color && profile.color) {
      color = profile.color;
    }

    return (
      <div className={styles.profileWidgetContainer}>
        <div className={styles.profileInformation}>
          { (profile.image_path !== null || profile.image_path !== '') && <img src={profile.image_path} /> }
          <div className={styles.profileDetails}>
            <h2 style={{ color }}>{ profile.fullname }</h2>
            { /*<p>{ profile.intro !== null && profile.intro.slice(0, 36) } { (profile.intro !== null && profile.intro.length > 36) && '...' }</p> */}
          </div>
          <div className={cx(styles.profileContactDetails, 'text-right')}>
            { this.renderProfileLinks() }
          </div>
        </div>
        {env !== 'Lib' && !profile.white_label_enabled &&
          <div className={styles.arrivyBranding}>
            <a href="https://arrivy.com" target="_blank"><img src="/images/powered_by_arrivy.png" alt="" /></a>
          </div>
        }
      </div>
    );
  }

}
