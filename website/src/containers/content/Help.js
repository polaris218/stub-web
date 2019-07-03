import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import landingPageDataHelp from '../../landingv2-data.json';
import { Grid } from 'react-bootstrap';
import { LandingNavigationV2, Footer3v }  from '../../components/index';
import styles from './static.module.scss';
import { UserHeader, LandingNavigation, FooterComponent, FooterConfiguration } from '../../components';
import { DefaultHelmet } from '../../helpers';
import landingPageData from '../../landing-page.json';


export default class Help extends Component {
  
  constructor(props, context){
    super(props, context);
  }

  render() {
    return (<div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigation data={landingPageData} />
            <Grid  style={{marginTop:'80px'}}>
          <h2>Support</h2>
          <p>Please send us an email at support@arrivy.com in case you have any questions. One of our team members will be in contact right away.</p>
        </Grid>
      </div>
          <Footer3v  data={landingPageDataHelp} links={FooterConfiguration}/>
    </div>);
  }
}

Help.contextTypes = {
  router: PropTypes.object.isRequired
};
