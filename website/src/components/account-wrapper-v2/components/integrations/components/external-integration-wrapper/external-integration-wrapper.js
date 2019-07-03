import React, {Component} from 'react';
import styles from '../external-integration-details/external-integration-details.module.scss';
import {Grid} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import cx from 'classnames';
import ExternalIntegrationDetails from '../external-integration-details/external-integration-details';
import {extractIntegrationInfo} from '../../../../../../helpers/external-integrations';

export default class ExternalIntegrationWrapper extends Component {
  constructor(props) {
    super(props);

    this.onTabClick = this.onTabClick.bind(this);
    this.showNewIntegrationForm = this.showNewIntegrationForm.bind(this);
    this.shouldDisableTabs = this.shouldDisableTabs.bind(this);

    this.state = {
      selectedTab: 0,
      hasMultiple: false,
      tabsStates: null,
      addNewIntegration: false,
      disableTabs: false

    };
  }

  componentDidMount() {
    let hasMultiple = this.state.hasMultiple;
    if (this.props.integrationInfo && this.props.integrationInfo.is_group_based && this.props.groups && this.props.groups.length > 1) {
      hasMultiple = true;
    }
    this.setState({
      hasMultiple
    });
  }

  componentWillMount() {
    //todo ??
  }

  componentWillReceiveProps(nextProps, nextContext) {
    //todo
    let hasMultiple = this.state.hasMultiple;
    if (nextProps.integrationInfo && nextProps.integrationInfo.is_group_based && nextProps.groups && nextProps.groups.length > 1) {
      hasMultiple = true;
    }
    this.setState({
      hasMultiple
    });
  }

  onTabClick(index) {
    this.setState({
      selectedTab: index,
    });
  }

  showNewIntegrationForm(show) {
    let selectedTab = this.state.selectedTab;
    if (!show){
      const externalIntegrations = this.props.externalIntegrations && this.props.externalIntegrations.filter((integration) => integration.integration_type === this.props.integrationInfo.type);
      if (externalIntegrations) {
        selectedTab = externalIntegrations.length;
      }
    }
    this.setState({
      addNewIntegration: show,
      selectedTab
    });
  }

  shouldDisableTabs(value) {
    this.setState({
      disableTabs: value
    })
  }

  render() {

    const externalIntegrations = this.props.externalIntegrations && this.props.externalIntegrations.filter((integration) => integration.integration_type === this.props.integrationInfo.type);

    return (
      <div id="integration_part" className={styles.integrationsWrapper}>
        <Grid>
          <div className={styles.box}>
            <h3 className={styles.boxTitle}><Link to={'/settings/integrations'}>Apps &
              Integrations</Link><span>{this.props.integrationInfo.title}</span></h3>
            <div className={cx(styles.boxBody)}>
              {!this.state.hasMultiple && <ExternalIntegrationDetails
                createToastAlert={this.props.createToastAlert}
                externalIntegrations={extractIntegrationInfo(this.props.integrationInfo.type, this.props.externalIntegrations)}
                onDeleteIntegration={this.props.onDeleteIntegration}
                onAddUpdateIntegration={this.props.onAddUpdateIntegration}
                getExternalIntegrations={this.props.getExternalIntegrations}
                profile={this.props.profile}
                groups={this.props.groups}
                integrationInfo={this.props.integrationInfo}
                inputFieldsCount={this.props.inputFieldsCount}
                inputFieldsInfo={this.props.inputFieldsInfo}
                shouldDisableTabs={this.shouldDisableTabs}
                templates={this.props.templates}
              />}

              {this.state.hasMultiple &&
              <div className={styles.collapseWrapper}>
                {externalIntegrations && externalIntegrations.length > 0 && externalIntegrations.map((info, index) => {
                  return this.props.integrationInfo.type === info.integration_type ?
                    (
                      <div key={index} className={styles.collapse}>
                        <div className={styles.collapseTitle}>
                          {/*To Do: Get the title from integration info or default title from integration info*/}
                          <h3 className={this.state.selectedTab === index  ? styles.active : this.state.disableTabs ? styles.disable : ''}
                            onClick={!this.state.disableTabs ? () => this.onTabClick(index): ''}>{info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.external_integration_group_name ? info.data_fetch_additional_settings.external_integration_group_name : this.props.integrationInfo.title}</h3>
                        </div>
                        {this.state.selectedTab === index && <div className={styles.collapseBody}>
                          <ExternalIntegrationDetails
                            createToastAlert={this.props.createToastAlert}
                            externalIntegrations={info}
                            onDeleteIntegration={this.props.onDeleteIntegration}
                            onAddUpdateIntegration={this.props.onAddUpdateIntegration}
                            getExternalIntegrations={this.props.getExternalIntegrations}
                            profile={this.props.profile}
                            groups={this.props.groups}
                            integrationInfo={this.props.integrationInfo}
                            inputFieldsCount={this.props.inputFieldsCount}
                            inputFieldsInfo={this.props.inputFieldsInfo}
                            showNewIntegrationForm={this.showNewIntegrationForm}
                            shouldDisableTabs={this.shouldDisableTabs}
                            templates={this.props.templates}
                          />
                        </div>}
                      </div>) : '';
                })}
                </div>
              }
              {this.state.hasMultiple && (this.state.addNewIntegration || externalIntegrations && externalIntegrations.length === 0) ?
                <ExternalIntegrationDetails
                  createToastAlert={this.props.createToastAlert}
                  externalIntegrations={null}
                  onDeleteIntegration={this.props.onDeleteIntegration}
                  onAddUpdateIntegration={this.props.onAddUpdateIntegration}
                  getExternalIntegrations={this.props.getExternalIntegrations}
                  profile={this.props.profile}
                  groups={this.props.groups}
                  integrationInfo={this.props.integrationInfo}
                  inputFieldsCount={this.props.inputFieldsCount}
                  inputFieldsInfo={this.props.inputFieldsInfo}
                  showNewIntegrationForm={this.showNewIntegrationForm}
                  shouldDisableTabs={this.shouldDisableTabs}
                  templates={this.props.templates}
                />
                : this.state.hasMultiple && <div className={cx(styles.boxBodyInner, 'text-right')}>
                  <button onClick={() => this.showNewIntegrationForm(true)} type="button" className={cx(styles.btn, styles['btn-secondary'])}>{this.props.integrationInfo.addGroupText?this.props.integrationInfo.addGroupText:"Add new Group"}</button>
                </div>}
            </div>
          </div>
        </Grid>
      </div>
    );
  }
}
