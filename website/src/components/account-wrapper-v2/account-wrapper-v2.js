import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import styles from './account-wrapper-v2.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPlug, faCode } from '@fortawesome/fontawesome-free-solid';
import { changePassword, getCompanyProfileInformation, getProfileInformation, updateKeys } from '../../actions';
import NotificationManager from '../notification-manager/notification-manager';
import AccountDetails from './components/account-details/account-details';
import AccountPassword from './components/account-password/account-password';
import AccountCustomCommunication from './components/account-custom-communication/account-custom-communication';
import AccountPlan from './components/account-plan/account-plan';
import CustomMessages from './components/custom-messages/custom-messages';
import StatusDesigner from './components/status-designer/status-designer';
import AccountTeamNotifications from './components/account-team-notifications/account-team-notifications';
import GroupsMain from './components/groups-main/groups-main';
import Integrations from './components/integrations/integrations';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import cx from 'classnames';
import { AccountSummary, ApiContentManager } from '../index';
import history from '../../configureHistory';
import { error_catch } from '../../helpers/error_catch';
import { Col, Grid, Row } from 'react-bootstrap';

class AccountWrapperV2 extends Component {
  constructor(props) {
    super(props);

    this.handleImageChange = this.handleImageChange.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.updateColorCallback = this.updateColorCallback.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);

    this.state = {
      active_part: (props.pageParams.page_id != undefined) ? props.pageParams.page_id : 'account_details',
      active_integrations_part: (props.pageParams.part_id != undefined) ? props.pageParams.part_id : 'apps',
      imageEditable: true,
      imageRemovable: true,
      loadingImage: false,
      teamMembers: 1,
      profile: null,
      errorText: null,
      companyProfile: null,
      internetIssue: undefined,
      contentLoaded: false
    };
  }

  updateColorCallback(updatedColor){
    this.setState({
      profile: {
        ...this.state.profile,
        color: updatedColor,
        errorText: null
      }
    });
  }

  componentDidMount() {
    this.getData();
  }

  componentWillReceiveProps(nextProps) {
  	if (!_.isEqual(this.props.pageParams, nextProps.pageParams)) {
			this.setState({
				active_part: nextProps.pageParams.page_id,
        active_integrations_part: nextProps.pageParams.part_id,
			})
	  }
  }

  getData(){
    Promise.all([this.props.getProfileInformation(true), this.props.getUserProfileInformation()]).then(([company, user]) => {
      const profile = JSON.parse(company);
      const { image_path, image_id } = profile;
      const userProfile = JSON.parse(user);
      this.setState({ userProfile, profile, profileImageUrl: image_path, image_id: image_id, contentLoaded: true });
    });
  }

  onChangeField(event) {
    this.state[event.target.id] = event.target.value;
    this.state.detailsNotifications = [];
    this.setState(this.state);
  }

  handleImageChange(e) {
    if (this.state.loadingImage === false) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({loadingImage: true});

      const image = e.target.files[0];
      if (typeof image !== 'undefined' && (image.type === 'image/jpeg' || image.type === 'image/jpg' || image.type === 'image/svg' || image.type === 'image/png' || image.type === 'image/gif')) {
        const reader = new FileReader();
        reader.readAsDataURL(image);

        reader.onloadend = () => {
          this.setState({ profileImageUrl: reader.result, profileImage: image });

          this.props.getImageUrl().then((response) => {
            const data = new FormData();
            data.append('file-0', image);
            const {upload_url} = JSON.parse(response);
            this.props.updateProfileImage(upload_url, data).then((response2) => {
              const data2 = JSON.parse(response2);
              const {file_id} = data2;
              this.setState({
                imageRemovable: file_id ? true : false, image_id: file_id,
                loadingImage: false,
              });
            });
          });
        };
      } else {
        this.setState({
	        loadingImage: false
        }, () => {
	        const imageUploadError = {
		        text: 'Please upload a valid image file',
		        options: {
			        type: toast.TYPE.ERROR,
			        position: toast.POSITION.BOTTOM_LEFT,
			        className: styles.toastErrorAlert,
			        autoClose: 8000
		        }
	        };
	        this.createToastAlert(imageUploadError);
        });
      }
    }
  }

  removeImage() {
    if (this.state.image_id && this.state.loadingImage === false) {
      this.setState({loadingImage: true});
      this.props.removeProfileImage(this.state.image_id).then((response) => {
        const {message} = JSON.parse(response);
        if (message === 'Deleted.') {
          this.setState({imageRemovable: false, image_id: null, profileImageUrl: null, loadingImage: false});
        }
      });
    }
  }

	createToastAlert(alert) {
  	toast(alert.text, alert.options);
	}

  render() {
    const active_page = this.state.active_part;
    let plain_part = (
      <AccountPlan
        getProfileInformation={this.props.getProfileInformation}
        getEntities={this.props.getEntities}
        updatePlan={this.props.updatePlan}
        createToastAlert={this.createToastAlert}
      />
    );

    let integration_part = (
      <Integrations
        getCustomCommunication={this.props.getCustomCommunication}
        getProfileInformation={this.props.getProfileInformation}
        updateCustomCommunication={this.props.updateCustomCommunication}
        updateProfileInformation={this.props.updateProfileInformation}
        slackOAuthFlow={this.props.slackOAuthFlow}
        createToastAlert={this.createToastAlert}
        activeIntegrationsPart={this.state.active_integrations_part}
      />
    );

    let basic_settings_part = (
      <AccountCustomCommunication
        getCustomCommunication={this.props.getCustomCommunication}
        getProfileInformation={this.props.getProfileInformation}
        updateCustomCommunication={this.props.updateCustomCommunication}
        updateProfileInformation={this.props.updateProfileInformation}
        slackOAuthFlow={this.props.slackOAuthFlow}
        createToastAlert={this.createToastAlert}
      />
    );

    let team_notification = (
      <AccountTeamNotifications
        getProfileInformation={this.props.getProfileInformation}
        updateProfileInformation={this.props.updateProfileInformation}
        createToastAlert={this.createToastAlert}
      />
    );

    let password_part = (
      <div id="password_part">
        <AccountPassword
	        changePassword={changePassword}
	        createToastAlert={this.createToastAlert}
          profile={this.state.userProfile}
        />
      </div>
    );

    let account_part = (
      <div id="account_part">
        <AccountDetails
          getProfileInformation={this.props.getProfileInformation}
          getEntities={this.props.getEntities}
          updateProfileInformation={this.props.updateProfileInformation}
          pageParams={this.props.pageParams}
          updateColorCallback = {this.updateColorCallback}
          error={this.state.errorText}
          createToastAlert={this.createToastAlert}
          loadingImage={this.state.loadingImage}
          profileImageUrl={this.state.profileImageUrl}
          imageEditable={this.state.imageEditable}
          imageRemovable={this.state.imageRemovable}
          removeImage={this.removeImage}
          handleImageChange={this.handleImageChange}
          companyProfile={this.props.companyProfile}
        />
      </div>
    );

    const custom_messages = (
      <div id="custom_messages">
        <CustomMessages
	        getProfileInformation={this.props.getProfileInformation}
	        createToastAlert={this.createToastAlert}
        />
      </div>
    );

    const status_designer = (
      <div id="status_designer">
        <StatusDesigner
	        getProfileInformation={this.props.getProfileInformation}
          updateProfileInformation={this.props.updateProfileInformation}
	        createToastAlert={this.createToastAlert}
          companyProfile={this.props.companyProfile}
        />
      </div>
    );

    const groups_container = (
      <div id="groups">
        <GroupsMain
	        profile={this.state.profile}
          companyProfile={this.props.companyProfile}
	        getProfileInformation={this.props.getProfileInformation}
	        createToastAlert={this.createToastAlert}
        />
      </div>
    );

    const api = (
      <div id="api">
        <Grid>
          <div className={styles.box}>
            <h3 className={styles.boxTitle}>Account Summary</h3>
            <div className={styles.boxBody}>
              <div className={styles.boxBodyInner}>
                <AccountSummary getProfileInformation={getProfileInformation} updateKeys={updateKeys} />
                <ApiContentManager doc_id={active_page} base_path={active_page} />
              </div>
            </div>
          </div>
        </Grid>
      </div>
    );

    if (!!this.state.userProfile && !!this.state.userProfile.permissions) {
      let is_company = false;
      if (this.state.userProfile.permissions.includes('COMPANY'))is_company = true;
      if (!(is_company || this.state.userProfile.permissions.includes('VIEW_ACCOUNT_SETTING'))) account_part = null;
      if (!(is_company || this.state.userProfile.permissions.includes('VIEW_PLAN_SETTING'))) plain_part = null;
      if (!(is_company || this.state.userProfile.permissions.includes('VIEW_CUSTOMER_SETTING'))) integration_part = null;
      if (!(is_company || this.state.userProfile.permissions.includes('VIEW_PASSWORD_SETTING'))) password_part = null;
    }

    const can_view_settings = this.state.userProfile && this.state.userProfile.permissions && (this.state.userProfile.permissions.includes('COMPANY') || this.state.userProfile.permissions.includes('VIEW_SETTING'));
    if (this.state.contentLoaded && !can_view_settings && active_page !== 3 && active_page !== 'password_reset') {
      history.push('/dashboard');
    }

    const fullWidthClass = !can_view_settings ? styles.fullWidth : '';
    const accountIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.4 16.07" className={cx(styles.accountIcon)}><circle className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" cx="3.42" cy="3.42" r="3.42" transform="translate(3.78 0.75)"/><path className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" d="M.75,15.32a6.45,6.45,0,1,1,12.9,0"/></svg>,
          planIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.97 15.9" className={cx(styles.planIcon)}><path className={cx(styles.a)} d="M11.47,1.5V14.4H1.5V1.5h9.97m.5-1.5H1A1,1,0,0,0,0,1V14.9a1,1,0,0,0,1,1H11.97a1,1,0,0,0,1-1V1a1,1,0,0,0-1-1Z"/><line className={cx(styles.b)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" x2="5.61" transform="translate(3.68 4.35)"/><path className={cx(styles.c)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" fillRule="evenodd" d="M5.03,9.54l.95,1.74L7.94,8"/></svg>,
          integrationIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.5 18.5" className={cx(styles.integrationIcon)}><path className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" d="M5.66,1.54a8.5,8.5,0,1,0,7.16-.01"/><line className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" y1="7.5" transform="translate(9.25 0.75)"/><path className={cx(styles.b)} d="M8.952,7.75h2.232a.452.452,0,0,1,.387.675L10.455,10.36,9.339,12.3a.448.448,0,0,1-.774,0L7.449,10.36,6.333,8.425A.446.446,0,0,1,6.72,7.75Z" transform="translate(0.298 0.265)"/></svg>,
          notificationsIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.79 15.8" className={cx(styles.notificationsIcon)}><path className={cx(styles.a)} d="M6.9,2.65a1.471,1.471,0,0,0,.92.69A3.672,3.672,0,0,1,10.57,6.9v3.45a2.057,2.057,0,0,0,.52,1.37H2.7a2.1,2.1,0,0,0,.52-1.37V6.9A3.672,3.672,0,0,1,5.97,3.34a1.528,1.528,0,0,0,.93-.69M6.9,0A1.3,1.3,0,0,0,5.6,1.29v.59A5.194,5.194,0,0,0,1.72,6.9v3.45a.578.578,0,0,1-.57.58A1.135,1.135,0,0,0,0,12.07a1.157,1.157,0,0,0,1.15,1.15H12.64a1.15,1.15,0,0,0,0-2.3.572.572,0,0,1-.57-.58V6.9A5.173,5.173,0,0,0,8.19,1.89v-.6A1.293,1.293,0,0,0,6.9,0ZM8.91,13.79H4.89a2.01,2.01,0,1,0,4.02,0Z"/></svg>,
          groupIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.68 14.8" className={cx(styles.groupIcon)}><circle className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" cx="2.83" cy="2.83" r="2.83" transform="translate(3.25 0.75)"/><path className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" d="M.75,12.79a5.33,5.33,0,1,1,10.66,0"/><circle className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" cx="2.61" cy="2.61" r="2.61" transform="translate(11.41 2.95)"/><path className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" d="M11.61,9.77a4.913,4.913,0,0,1,7.32,4.28"/><path className={cx(styles.a)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5px" d="M9.1,11.9"/></svg>,
          messageIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.77 16.49" className={cx(styles.messageIcon)}><path className={cx(styles.a)} fill="none" strokeWidth="1.5px" strokeMiterlimit="10" strokeLinejoin="round" strokeLinecap="round" d="M14.31.75H2.47A1.72,1.72,0,0,0,.75,2.47V9.84a1.72,1.72,0,0,0,1.72,1.72H9.64l3.83,4.18.54-4.18h.29a1.72,1.72,0,0,0,1.72-1.72V2.47A1.705,1.705,0,0,0,14.31.75Z"/></svg>,
          templateIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 16.19" className={cx(styles.templateIcon)}><path className={cx(styles.a)} d="M13.5,1.5v4H1.5v-4h12M14,0H1A1,1,0,0,0,0,1V6A1,1,0,0,0,1,7H14a1,1,0,0,0,1-1V1a1,1,0,0,0-1-1Z"/><path className={cx(styles.a)} d="M5.5,10.69v4h-4v-4h4M6,9.19H1a1,1,0,0,0-1,1v5a1,1,0,0,0,1,1H6a1,1,0,0,0,1-1v-5a1,1,0,0,0-1-1Z"/><path className={cx(styles.a)} d="M13.5,10.69v4h-4v-4h4m.5-1.5H9a1,1,0,0,0-1,1v5a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1v-5a1,1,0,0,0-1-1Z"/></svg>,
          lockIcon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16.75" viewBox="0 0 16 16.75" className={cx(styles.lockIcon)}><line className={cx(styles.a)} y2="1.67" transform="translate(8 10.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none"/><path d="M3.73,5.09a4.271,4.271,0,1,1,8.54,0" fill="none" className={cx(styles.a)} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" fillRule="evenodd"/><path className={cx(styles.b)} d="M14.5,5.91v9.34H1.5V5.91h13m.5-1.5H1a1,1,0,0,0-1,1V15.75a1,1,0,0,0,1,1H15a1,1,0,0,0,1-1V5.41a1,1,0,0,0-1-1Z" /></svg>;

    return (
      <div className={cx(styles['settings-wrapper'], fullWidthClass)}>
	      <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        { (can_view_settings ) &&
          <nav className={styles['settings-sidebar']}>
            <ul>
              <li className={styles.sidebarTitle}>Settings</li>
              <li data-active={typeof active_page === 'undefined' || active_page === 0 || active_page === 'account_details'} style={{display: account_part ? 'block' : 'none' }}>
                <Link to={'/settings/account_details'}>
                  <i className={styles['icon']}>{accountIcon}</i>
                  <span>Account Details</span>
                </Link>
              </li>
              <li data-active={active_page === 1 || active_page === 'plan_details'} style={{display: plain_part ? 'block' : 'none' }}>
                <Link to={'/settings/plan_details'}>
                  <i className={styles['icon']}>{planIcon}</i>
                  <span>Plan Details</span>
                </Link>
              </li>
              <li data-active={active_page === 9 || active_page === 'basic_settings'} style={{display: integration_part ? 'block' : 'none' }}>
                <Link to={'/settings/basic_settings'}>
                  <i className={styles['icon']}><FontAwesomeIcon icon={faPlug} /></i>
                  <span>Basic Settings</span>
                </Link>
              </li>
              <li data-active={active_page === 2 || active_page === 'integrations'} style={{display: integration_part ? 'block' : 'none' }}>
                <Link to={'/settings/integrations'}>
                  <i className={styles['icon']}>{integrationIcon}</i>
                  <span>Apps & Integrations</span>
                </Link>
              </li>
              <li data-active={active_page === 6 || active_page === 'team_notification'} style={{display: team_notification ? 'block' : 'none' }}>
                <Link to={'/settings/team_notification'}>
                  <i className={styles['icon']}>{notificationsIcon}</i>
                  <span>Team Notifications</span>
                </Link>
              </li>
              <li data-active={active_page === 8 || active_page === 'groups'} style={{display: team_notification ? 'block' : 'none' }}>
                <Link to={'/settings/groups'}>
                  <i className={styles['icon']}>{groupIcon}</i>
                  <span>Groups</span>
                </Link>
              </li>
              <li data-active={active_page === 5 || active_page === 'customer_messages'}>
                <Link to={'/settings/customer_messages'}>
                  <i className={styles['icon']}>{messageIcon}</i>
                  <span>Customer Messages</span>
                </Link>
              </li>
              <li data-active={active_page === 4 || active_page === 'status_designer'}>
                <Link to={'/settings/status_designer'}>
                  <i className={styles['icon']}>{templateIcon}</i>
                  <span>Templates & Statuses</span>
                </Link>
              </li>
              <li data-active={active_page === 3 || active_page === 'password_reset'} style={{display: password_part ? 'block' : 'none' }}>
                <Link to={'/settings/password_reset'}>
                  <i className={styles['icon']}>{lockIcon}</i>
                  <span>Change Password</span>
                </Link>
              </li>
              {!this.state.profile || this.state.profile.plan_id === 1 &&
              <li data-active={active_page === 7 || active_page === 'api_info'}>
                <Link to={'/settings/api_info'}>
                  <i className={styles['icon']}><FontAwesomeIcon icon={faCode} /></i>
                  <span>API</span>
                </Link>
              </li>}
            </ul>
          </nav>
        }
        <div className={cx(styles['settings-content'], fullWidthClass)}>
          <div className={cx(styles['settings-content-inner'])}>
            {(() => {
              switch (active_page) {
                case 0:
                  return account_part;
                case 'account_details':
                  return account_part;
                case 1:
                  return plain_part;
                case 'plan_details':
                  return plain_part;
                case 2:
                  return integration_part;
                case 'integrations':
                  return integration_part;
                case 3:
                  return password_part;
                case 'password_reset':
                  return password_part;
                case 4:
                  return status_designer;
                case 'status_designer':
                  return status_designer;
                case 5:
                  return custom_messages;
                case 'customer_messages':
                  return custom_messages;
                case 6:
                  return team_notification;
                case 'team_notification':
                  return team_notification;
                case 7:
                  return api;
                case 'api_info':
                  return api;
                case 8:
                  return groups_container;
                case 'groups':
                  return groups_container;
                case 9:
                  return basic_settings_part;
                case 'basic_settings':
                  return basic_settings_part;
                default:
                  return account_part;
              }
            })()}
          </div>
        </div>
      </div>
    );
  }
}

AccountWrapperV2.propTypes = {
  getProfileInformation: PropTypes.func.isRequired,
  getUserProfileInformation: PropTypes.func.isRequired,
  getEntities: PropTypes.func.isRequired,
  updateProfileInformation: PropTypes.func.isRequired,
  updateProfileImage: PropTypes.func.isRequired,
  getImageUrl: PropTypes.func.isRequired,
  updatePlan: PropTypes.func.isRequired,
  removeProfileImage: PropTypes.func.isRequired,
  getCustomCommunication: PropTypes.func.isRequired,
  updateCustomCommunication: PropTypes.func.isRequired,
  currentActivePart: PropTypes.number,
  pageParams: PropTypes.object,
};

 export default DragDropContext(HTML5Backend)(AccountWrapperV2);
