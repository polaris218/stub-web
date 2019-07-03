import React, { Component } from 'react';
import styles from './apps.module.scss';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Grid } from 'react-bootstrap';
import {extractIntegrationInfo} from "../../../../../../helpers/external-integrations";

export default class Apps extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let samsara_button = this.props.profile && this.props.profile.samsara_integration_info && this.props.profile.samsara_integration_info.samsara_access_token ? 'Installed' : 'Install';
    let moverbaseIntegrationInfo =  extractIntegrationInfo("MOVERBASE", this.props.externalIntegrations);
    let currentRmsIntegrationInfo = extractIntegrationInfo("CURRENT_RMS", this.props.externalIntegrations);
    let vonigoIntegrationInfo = extractIntegrationInfo("VONIGO", this.props.externalIntegrations);
    let moversSuiteIntegrationInfo = extractIntegrationInfo("MOVERS_SUITE", this.props.externalIntegrations);
    let moverbase_button = moverbaseIntegrationInfo && moverbaseIntegrationInfo.authentication_keys ? 'Installed' : 'Install';
    let current_rms_button = currentRmsIntegrationInfo && currentRmsIntegrationInfo.authentication_keys ? 'Installed' : 'Install';
    let vonigo_button = vonigoIntegrationInfo && vonigoIntegrationInfo.authentication_keys ? 'Installed' : 'Install';
    let movers_suite_button = moversSuiteIntegrationInfo && moversSuiteIntegrationInfo.authentication_keys ? 'Installed' : 'Install';
    return (
      <Grid>
        <div className={cx(styles.box)}>
          <h3 className={cx(styles.boxTitle)}>Apps & Integrations</h3>
          <p className={cx(styles.reach_out)}>If you don’t see an app that you would like to see here, please reach us at <a href="mailto:support@arrivy.com">support@arrivy.com</a>.</p>
          <div className={cx(styles.boxBody)}>
            <div className={cx(styles.boxBodyInner)}>
              <div className={cx(styles.appBoxWrapper)}>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-sla.png" alt="Slack" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Slack</h4>
                    <p>Get live progress of tasks & orders on your team's slack channel and keep connected with your business in real-time.</p>
                  </div>
                  <div className={styles.footer}>
                    <button className={cx(styles.btn, styles['btn-secondary'])} onClick={this.props.slackOAuthFlow}>Install</button>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-sam.png" alt="Samsara" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Samsara</h4>
                    <p>Get Samsara Fleet & Sensor data in Arrivy Equipment Tab. The integration allows you to easily map your Arrivy Equipment to Samsara entities.</p>
                  </div>
                  <div className={styles.footer}>
                    <Link className={cx(styles.btn, styles['btn-secondary'])} to={'/settings/integrations/samsara'}>{samsara_button}</Link>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-mov.png" alt="Moveboard" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Moveboard</h4>
                    <p>Elromco MoveBoard users can manage customer experience through the last mile using Arrivy’s mapping and automated communications technology. </p>
                  </div>
                  <div className={styles.footer}>
                    <a className={cx(styles.btn, styles['btn-secondary'])} href="https://help.arrivy.com/arrivy-elromco-moveboard/" target="_blank">Install</a>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-sugar.png" alt="SugarCRM" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>SugarCRM</h4>
                    <p>Create Arrivy tasks for leads & contacts in SugarCRM and manage them with Arrivy Experience.</p>
                  </div>
                  <div className={styles.footer}>
                    <a className={cx(styles.btn, styles['btn-secondary'])} href="https://help.arrivy.com/arrivy-sugarcrm/" target="_blank">Install</a>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-zap.png" alt="Zapier" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Zapier</h4>
                    <p>Leverage Arrivy’s Zapier integration to connect to hundreds of different applications and easily create tasks in Arrivy.</p>
                  </div>
                  <div className={styles.footer}>
                    <a className={cx(styles.btn, styles['btn-secondary'])} href="mailto:support@arrivy.com?subject=Inquire about Zapier integraton">Contact Us</a>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-zoho.png" alt="ZohoCRM" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>ZohoCRM</h4>
                    <p>Easily create Arrivy tasks for leads & contacts in Zoho and provide an engaging experience to your customers & a connected experience to support & crew members.</p>
                  </div>
                  <div className={styles.footer}>
                    <a className={cx(styles.btn, styles['btn-secondary'])} href="mailto:support@arrivy.com?subject=Inquire about ZohoCRM integration">Contact Us</a>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-salesforce.png" alt="Salesforce" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Salesforce</h4>
                    <p>Connect your Salesforce account with Arrivy. Easily create Arrivy tasks for leads & contacts in Salesforce and track them. Provide your customers with an engaging experience and fully connect your support & remote teams.</p>
                  </div>
                  <div className={styles.footer}>
                    <a className={cx(styles.btn, styles['btn-secondary'])} href="mailto:support@arrivy.com?subject=Inquire about Salesforce integration">Contact Us</a>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-moverbase.png" alt="Moverbase" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Moverbase</h4>
                    <p>Moverbase has all the features you need to help you run an efficient moving company. Now Moverbase users can power the last mile using Arrivy's customer engagement and communications functionality.</p>
                  </div>
                  <div className={styles.footer}>
                    <Link className={cx(styles.btn, styles['btn-secondary'])} to={'/settings/integrations/moverbase'}>{moverbase_button}</Link>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-current_rms.png" alt="Current RMS" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Current RMS</h4>
                    <p>Rental business powered by the Current RMS rental management solution can now automate their customer communications and manage field crews with Arrivy.</p>
                  </div>
                  <div className={styles.footer}>
                    <Link className={cx(styles.btn, styles['btn-secondary'])} to={'/settings/integrations/current_rms'}>{current_rms_button}</Link>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-vonigo.png" alt="Vonigo" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>Vonigo</h4>
                    <p>Create your service appointments in Vonigo and synchronize them with Arrivy to manage the last-mile.</p>
                  </div>
                  <div className={styles.footer}>
                    <Link className={cx(styles.btn, styles['btn-secondary'])} to={'/settings/integrations/vonigo'}>{vonigo_button}</Link>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-movers_suite.png" alt="MoversSuite" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>MoversSuite</h4>
                    <p>MoversSuite is software built for the moving industry, integrating customer service, move management, dispatch and accounting. Arrivy helps MoversSuite users deliver a perfect customer experience.</p>
                  </div>
                  <div className={styles.footer}>
                    <Link className={cx(styles.btn, styles['btn-secondary'])} to={'/settings/integrations/movers_suite'}>{movers_suite_button}</Link>
                  </div>
                </div>
                <div className={cx(styles.appBox)}>
                  <figure>
                    <img src="/images/lending/integrations/integ-diy.png" alt="DIY" />
                  </figure>
                  <div className={cx(styles.content)}>
                    <h4>DIY</h4>
                    <p>Feeling adventurous? Learn how to build a custom integration using our developer portal. Reach out to us at <a href="mailto:support@arrivy.com">support@arrivy.com</a> for any questions regarding the integration.</p>
                  </div>
                  <div className={styles.footer}>
                    <Link className={cx(styles.btn, styles['btn-secondary'])} to={'/developer_portal'} target="_blank">Learn</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Grid>
    );
  }
}

