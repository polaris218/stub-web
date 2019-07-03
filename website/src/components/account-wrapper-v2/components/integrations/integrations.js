import React, {Component} from 'react';
import styles from './integrations.module.scss';
import Apps from './components/apps/apps';
import SamsaraIntegrations from './components/samsara-integrations/samsara-integrations';
import ExternalIntegrationWrapper from "./components/external-integration-wrapper/external-integration-wrapper";
import {getIntegrationsList} from "../../../../actions/external-integrations";
import {getAllGroups, getTemplates} from "../../../../actions";
import {supportedIntegrationsList} from '../../../../helpers/external-integrations';

export default class Integrations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active_part: props.activeIntegrationsPart,
      profile: null,
      externalIntegrations: null,
      groups: null,
      timer: null,
      templates: null
    };

    this.onDeleteIntegration = this.onDeleteIntegration.bind(this);
    this.onAddUpdateIntegration = this.onAddUpdateIntegration.bind(this);
    this.getExternalIntegrations = this.getExternalIntegrations.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
  }

  componentDidMount() {
    this.setTimer = true;
    document.addEventListener('visibilitychange', this.visibilityChanged);
    Promise.all([this.props.getProfileInformation(true), getIntegrationsList(), getAllGroups(), getTemplates()]).then(([data, external_integrations, allGroups, allTemplates]) => {
      const profile = JSON.parse(data);
      const externalIntegrations = JSON.parse(external_integrations);
      const groups = JSON.parse(allGroups);
       allTemplates = JSON.parse(allTemplates);
      const templates = allTemplates.filter((template) => template.type === 'TASK' )

      this.setState({profile, externalIntegrations, groups, templates});
    });

    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 6e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
      });
    } else {
      clearTimeout(timer);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.activeIntegrationsPart, nextProps.activeIntegrationsPart)) {
      this.setState({
        active_part: nextProps.activeIntegrationsPart
      })
    }
  }

  //
  getExternalIntegrations(resetTimer = true) {
    if (resetTimer && this.state.timer) {
      clearTimeout(this.state.timer);
      const timer = setTimeout(() => {
        this.startDataLoad();
      }, 3e4);
      if (this.setTimer && !document.hidden) {
        this.setState({
          timer,
        });
      } else {
        clearTimeout(timer);
      }
    }
    getIntegrationsList().then((res) => {
      const externalIntegrations = JSON.parse(res);
      this.setState({externalIntegrations});
    }).catch((err) => {
      console.log(err);
    })
  }
  getAllGroups(){
    getAllGroups().then((res)=>{
      const groups = JSON.parse(res);
      this.setState({groups});
    }).catch((err)=>{

    })
  }

  onDeleteIntegration(integrationId) {
    const externalIntegrations = (this.state.externalIntegrations && Array.isArray(this.state.externalIntegrations))
      ? this.state.externalIntegrations.filter((externalIntegration) => {
        return externalIntegration.id !== integrationId
      })
      : null;
    this.setState({
      externalIntegrations
    });
  }

  onAddUpdateIntegration(integrationInfo, action = "added") {
    const externalIntegrations = (this.state.externalIntegrations && Array.isArray(this.state.externalIntegrations))
      ? this.state.externalIntegrations
      : [];
    switch (action) {
      case "added": {
        //todo
        externalIntegrations.push(integrationInfo);
        break;
      }
      case "updated": {
        for (let i = 0; i < externalIntegrations.length; i++) {
          if (externalIntegrations[i].id && integrationInfo.id && externalIntegrations[i].id === integrationInfo.id) {
            externalIntegrations[i] = integrationInfo;
            break;
          }
        }
        break;
      }
      default: {
        break;
      }
    }
    this.setState({
      externalIntegrations
    },()=>{
      this.getExternalIntegrations(true);
    });
  }

  componentWillUnmount() {
    this.setTimer = false;
    this.clearAsyncUpdate();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
  }

  clearAsyncUpdate() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }

  visibilityChanged() {
    if (document.hidden) {
      this.clearAsyncUpdate();
    } else {
      this.clearAsyncUpdate();
      this.startAsyncUpdate();
    }
  }

  startAsyncUpdate() {
    this.startDataLoad();
  }

  startDataLoad(resetTimeout = false){
    if (this.state.timer && resetTimeout) {
      clearTimeout(this.state.timer);
    }
    const timer = setTimeout(()=>{
      this.startDataLoad();
    },3e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
      });
    } else {
      clearTimeout(timer);
    }
    this.getExternalIntegrations(false);
    this.getAllGroups();
  }

  render() {
    const active_page = this.state.active_part;
    const apps = (
      <Apps
        slackOAuthFlow={this.props.slackOAuthFlow}
        profile={this.state.profile}
        externalIntegrations={this.state.externalIntegrations}
      />
    );

    const samsara = (
      <SamsaraIntegrations
        getProfileInformation={this.props.getProfileInformation}
        updateProfileInformation={this.props.updateProfileInformation}
        createToastAlert={this.props.createToastAlert}
        externalIntegrations={this.state.externalIntegrations}
      />
    );
    const moverbase = (
      <ExternalIntegrationWrapper
        createToastAlert={this.props.createToastAlert}
        externalIntegrations={this.state.externalIntegrations}
        onDeleteIntegration={this.onDeleteIntegration}
        onAddUpdateIntegration={this.onAddUpdateIntegration}
        getExternalIntegrations={this.getExternalIntegrations}
        profile={this.state.profile}
        groups={this.state.groups}
        integrationInfo={supportedIntegrationsList['MOVERBASE'].integrationInfo}
        inputFieldsCount={1}
        inputFieldsInfo={supportedIntegrationsList['MOVERBASE'].inputFieldsInfo}
        templates={this.state.templates}
      />
    );
    const current_rms = (
      <ExternalIntegrationWrapper
        createToastAlert={this.props.createToastAlert}
        externalIntegrations={this.state.externalIntegrations}
        onDeleteIntegration={this.onDeleteIntegration}
        onAddUpdateIntegration={this.onAddUpdateIntegration}
        getExternalIntegrations={this.getExternalIntegrations}
        profile={this.state.profile}
        groups={this.state.groups}
        integrationInfo={supportedIntegrationsList['CURRENT_RMS'].integrationInfo}
        inputFieldsCount={2}
        inputFieldsInfo={supportedIntegrationsList['CURRENT_RMS'].inputFieldsInfo}
        templates={this.state.templates}

      />
    );

    const vonigo = (
      <ExternalIntegrationWrapper
        createToastAlert={this.props.createToastAlert}
        externalIntegrations={this.state.externalIntegrations}
        onDeleteIntegration={this.onDeleteIntegration}
        onAddUpdateIntegration={this.onAddUpdateIntegration}
        getExternalIntegrations={this.getExternalIntegrations}
        profile={this.state.profile}
        groups={this.state.groups}
        integrationInfo={supportedIntegrationsList['VONIGO'].integrationInfo}
        inputFieldsCount={4}
        inputFieldsInfo={supportedIntegrationsList['VONIGO'].inputFieldsInfo}
        templates={this.state.templates}

      />
    );
    const moverSuite = (
      <ExternalIntegrationWrapper
        createToastAlert={this.props.createToastAlert}
        externalIntegrations={this.state.externalIntegrations}
        onDeleteIntegration={this.onDeleteIntegration}
        onAddUpdateIntegration={this.onAddUpdateIntegration}
        getExternalIntegrations={this.getExternalIntegrations}
        profile={this.state.profile}
        groups={this.state.groups}
        integrationInfo={supportedIntegrationsList['MOVERS_SUITE'].integrationInfo}
        inputFieldsCount={4}
        inputFieldsInfo={supportedIntegrationsList['MOVERS_SUITE'].inputFieldsInfo}
        templates={this.state.templates}

      />
    );

    return (
      <div>
        {(() => {
          switch (active_page) {
            case 0:
            case 'apps':
              return apps;
            case 1:
            case 'samsara':
              return samsara;
            case 7:
            case 'moverbase':
              return moverbase;
            case 8:
            case 'current_rms':
              return current_rms;
            case 9:
            case 'vonigo':
              return vonigo;
            case 10:
            case 'movers_suite':
              return moverSuite;
            default:
              return apps;
          }
        })()}
      </div>
    );
  }
}
