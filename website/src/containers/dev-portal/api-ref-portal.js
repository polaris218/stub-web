import React, { Component } from 'react';
import cx from 'classnames';
import { DevPortalContainer } from '../../components';
import landingPageData from '../../landing-page.json';
import styles from './dev-portal.module.scss';
import { DefaultHelmet } from '../../helpers';
import docsData from './api-ref-content.json';

export default class APIRefPortal extends Component {
  constructor(props, context) {
    super(props, context);

    window.applicationType = 'json';

    this.state = {
      activeDoc: 'building_blocks',
      applicationType: window.applicationType
    };

    this.routeUpdateCallback = this.routeUpdateCallback.bind(this);
    this.handleApplicationTypeChange = this.handleApplicationTypeChange.bind(this);

  }

  componentDidMount() {
    if (typeof this.props.match.params.doc_id !== 'undefined' && this.props.match.params.doc_id !== '') {
      this.setState({
        activeDoc: this.props.match.params.doc_id
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.match.params.doc_id !== 'undefined' && nextProps.match.params.doc_id !== '') {
      this.setState({
        activeDoc: nextProps.match.params.doc_id
      });
    } else {
      this.setState({
        activeDoc: 'building_blocks'
      });
    }
  }

  handleApplicationTypeChange(e, type) {
    this.setState({
      applicationType: type
    }, () => {
      window.applicationType = type;
    });
  }

  routeUpdateCallback(doc_id) {
    this.setState({
      activeDoc: doc_id
    });
  }

  render() {
    return (
      <div className={cx(styles.portalPageContainer, styles.pagewrap)}>
        <DefaultHelmet />
        <DevPortalContainer
          location={this.props.location}
          landingPageData={landingPageData}
          data={docsData}
          activeDoc={this.state.activeDoc}
          routeUpdateCallback={this.routeUpdateCallback}
          basePath='/api_reference'
          developer_api_title='Api Reference'
          applicationType={this.state.applicationType}
          handleApplicationTypeChange={this.handleApplicationTypeChange}
        />
      </div>
    );
  }
}
