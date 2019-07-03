import React, { Component } from 'react';
import styles from './trial-expiration.module.scss';
import { Link } from 'react-router-dom';

export default class TrialExpiration extends Component {
  constructor(props) {
    super(props);
    this.showSubscribeButton = this.showSubscribeButton.bind(this);
  }

  showSubscribeButton(){
    const permissions = this.props.profile && this.props.profile.permissions;
    if (permissions && (permissions.indexOf('VIEW_SETTING') !== -1 || permissions.indexOf('COMPANY') !== -1)) {
      return true;
    }
    return false;
  }

  render() {
    let profileImage = this.props.companyProfile && this.props.companyProfile.image_path || '/images/user.png',
        profileName = this.props.companyProfile && this.props.companyProfile.fullname || this.props.profile && this.props.profile.fullname,
        supportEmail = this.props.companyProfile && this.props.companyProfile.support_email,
        mailSubject = 'Trial%20Expired',
        mailBody = 'Hi ' + (this.props.companyProfile ? this.props.companyProfile.fullname : '') + ',%0A%0AUnfortunately, our trial has been expired so I won\'t be able to further continue my work. Please subscribe so that I could continue the work.%0A%0AThanks',
        showSubscribeButton = this.showSubscribeButton();
    return (
      <div className={styles.expirationContainer}>
        <div className={styles.expirationBox}>
          <div className={styles.boxTitle}>
            <h4>Subscribe!</h4>
          </div>
          <div className={styles.boxBody}>
            <div className={styles.inner}>
              <div className={styles.profileImage}><img src={profileImage} alt={profileName} /></div>
              <h3>Your free trial has expired!</h3>
              <p>Thank you for signing up with Arrivy. You can continue to manage your last-mile customer experience, connect your team and streamline your communications, simply by subscribing.</p>
              {showSubscribeButton ? <Link className={styles.button} to="/payment_setup">Subscribe Now!</Link> : <a href={'mailto:'+supportEmail+'?Subject='+mailSubject+'&body='+mailBody} target="_top">Contact your company</a>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}