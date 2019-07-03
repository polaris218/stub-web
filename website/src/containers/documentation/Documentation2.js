import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  ApiContentManager,
  LandingNavigation,
  LandingHeader,
  FooterComponent,
  FooterConfiguration,
  LandingNavigationV2
} from '../../components';
import styles from './documentation.module.scss';
import landingPageData from '../../landing-page.json';
import { DefaultHelmet } from '../../helpers';

export default class Documentation2 extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const doc_id = this.props.match.params.doc_id || 'getting-started';
    const paths = this.props.route.path.split(':');
    let base_path = paths[0];
    const lastChar = base_path[base_path.length -1];
    if (lastChar !== '/') {
      base_path = base_path + '/';
    }
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={landingPageData} />
          <LandingHeader image={'/images/documentation.jpg'} header="Get Started in minutes"/>
          <ApiContentManager doc_id={doc_id} base_path={base_path}/>
        </div>
        <div className={styles.footer}>
          <FooterComponent links={FooterConfiguration}/>
        </div>
      </div>
    );
  }
}

Documentation2.contextTypes = {
  router: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
