import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './guide_page.module.scss';
import { UserHeader, FooterComponent, FooterConfiguration, Guide }  from '../../components';
import { DefaultHelmet } from '../../helpers';

export default class GuidePage extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <UserHeader router={this.context.router}/>
          <Guide />
        </div>
        <div className={styles.footer}>
          <FooterComponent links={FooterConfiguration}/>
        </div>
      </div>
    );
  }
}

GuidePage.contextTypes = {
  router: PropTypes.object.isRequired
};

/*
  TaskPage.propTypes = {
    params: PropTypes.object
  };
*/
