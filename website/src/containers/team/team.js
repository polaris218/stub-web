import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './team.module.scss';
import { EntityManager, FooterComponent, FooterConfiguration, UserHeaderV2, SlimFooterV2, TrialExpiration }  from '../../components';
import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import {
  getEntities, getProfileInformation, getCompanyProfileInformation,
  createEntity, deleteEntity, updateEntity,
  getEntityImageUrl, updateEntityImage, removeEntityImage, getAllGroups, getEquipments
} from '../../actions';
import {DefaultHelmet, isTrialExpire, parseQueryParams} from '../../helpers';
import DropdownFilter from '../../components/dropdown-filter/dropdown-filter';
import ErrorAlert from '../../components/error-alert/error-alert';
import history from '../../configureHistory';

export default class Team extends Component {
  constructor(props, context) {
    super(props, context);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
    this.headerHeight = this.headerHeight.bind(this);

    this.state = {
      profile: null,
      companyProfile: null,
      groups: null,
      internetIssue: undefined,
      activityStreamStateHandler: null,
      headerHeight: null
    };
  }

  componentDidMount() {
    this.headerHeight();
    addEventListener('resize', this.headerHeight);
  }

  componentWillUnmount() {
    removeEventListener('resize', this.headerHeight);
  }

  componentWillMount() {
    getCompanyProfileInformation().then((res) => {
      let companyProfile = JSON.parse(res);
      this.setState({ companyProfile });
    }).catch((err) => {
      if(err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });

    getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      this.setState({
        profile
      });
      if (!profile || !profile.permissions || !(profile.permissions.includes('COMPANY') || profile.permissions.includes('VIEW_FULL_TEAM_MEMBER_DETAILS'))) {
        history.push('/dashboard');
      }
    }).catch((error) => {
      if (error.status === 0){
        this.setState({
          internetIssue: true,
        });
      }
    });
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 6e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
        internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
      });
    } else {
      clearTimeout(timer);
    }

    getAllGroups().then((res) => {
      const groups = JSON.parse(res);
      this.setState({
        groups
      });
    });

  }

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  headerHeight() {
    let { clientHeight } = this.refs.headerContainer;
    this.setState({
      headerHeight: clientHeight
    });
  }

  render() {
    const trialExpired = isTrialExpire(this.state.companyProfile);
    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        <DefaultHelmet/>
        <div className={styles['page-wrap']} style={trialExpired ? {paddingBottom: '0'} : {}}>
          <div ref="headerContainer">
            <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler}  router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          </div>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> :
            <EntityManager
              createEntity={createEntity}
              updateEntities={getEntities}
              deleteEntity={deleteEntity}
              updateEntity={updateEntity}
              getEntityImageUrl={getEntityImageUrl}
              updateEntityImage={updateEntityImage}
              removeEntityImage={removeEntityImage}
              profile={this.state.profile}
              groups={this.state.groups}
              activityStreamStateChangeHandler={this.activityStreamStateChangeHandler}
              activityStreamStateHandler={this.state.activityStreamStateHandler}
              headerHeight={this.state.headerHeight}
              companyProfile={this.state.companyProfile}
            />
          }
        </div>
        <div className={styles.footer}>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

Team.contextTypes = {
    router: PropTypes.object.isRequired
};
