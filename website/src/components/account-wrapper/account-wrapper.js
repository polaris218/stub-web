import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Image } from 'react-bootstrap';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import styles from './account-wrapper.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faInfo, faLock, faSlidersH, faPlug, faUsers, faPencilAlt, faTimesCircle, faEnvelope, faCogs, faCode } from '@fortawesome/fontawesome-free-solid';
import { AccountPassword, AccountCustomCommunication, AccountPlan, AccountDetails, CustomMessages, StatusDesigner, AccountTeamNotifications, GroupsMain,SamsaraIntegrations } from '../../components';
import { changePassword } from '../../actions';
import NotificationManager from '../notification-manager/notification-manager';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import cx from 'classnames';

class AccountWrapper extends Component {
  constructor(props) {
    super(props);

    this.handleImageChange = this.handleImageChange.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.changeActivePart = this.changeActivePart.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.updateColorCallback = this.updateColorCallback.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);

    this.state = {
      active_part: (props.pageParams.page_id != undefined) ? props.pageParams.page_id : 'account_details',
      imageEditable: true,
      imageRemovable: true,
      loadingImage: false,
      teamMembers: 1,
      profile: null,
      errorText: null
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
				active_part: nextProps.pageParams.page_id
			})
	  }
  }

  getData(){
    this.props.getProfileInformation(true).then((data) => {
      const profile = JSON.parse(data);
      const { image_path, image_id } = profile;
      this.setState({ profile, profileImageUrl: image_path, image_id: image_id });
    });
    this.props.getUserProfileInformation().then((data) => {
      const userProfile = JSON.parse(data);
      this.setState({ userProfile });
    });
  }

  onChangeField(event) {
    this.state[event.target.id] = event.target.value;
    this.state.detailsNotifications = [];
    this.setState(this.state);
  }

  updateImageClick() {
    this.refs.imageUploader.click();
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

  changeActivePart(id, e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({active_part: id, detailsNotifications: []});

    //TODO: Remove this code once we separate out the route for each of these tabs in navigation. The router will automatically take care of this
    if (window) {
      window.scrollTo(0, 0);
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
      <SamsaraIntegrations
        getCustomCommunication={this.props.getCustomCommunication}
        getProfileInformation={this.props.getProfileInformation}
        updateCustomCommunication={this.props.updateCustomCommunication}
        updateProfileInformation={this.props.updateProfileInformation}
        slackOAuthFlow={this.props.slackOAuthFlow}
        createToastAlert={this.createToastAlert}
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
        />
      </div>
    );

    const groups_container = (
      <div id="groups">
        <GroupsMain
	        profile={this.state.profile}
	        getProfileInformation={this.props.getProfileInformation}
	        createToastAlert={this.createToastAlert}
        />
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

    let backgroundStyles = null;
    if (this.state.profile !== null && this.state.profile.color !== null && this.state.profile.color !== '') {
      backgroundStyles = {
        backgroundColor: this.state.profile.color
      };
    } else {
      backgroundStyles = {
        backgroundImage: 'linear-gradient(to right, #008bf8 0%,#00d494 100%)'
      };
    }

    const showPannel = this.state.userProfile && this.state.userProfile.permissions && (this.state.userProfile.permissions.includes('COMPANY') || this.state.userProfile.permissions.includes('VIEW_SETTING'));

    const fullWidthClass = !showPannel ? styles.fullWidth : '';
    return (
      <div className={cx(styles['settings-wrapper'], fullWidthClass)}>
	      <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        {(typeof this.state.active_part === 'undefined' || this.state.active_part === 'account_details') &&
        <div className={styles['account-image-c']} style={ backgroundStyles }>
          <Grid>
            <Row className={styles['account-image'] + ' text-center'}>
              <Col xs={12} md={12}>
                <div className={styles['image']}>
                  {(this.state.loadingImage === true) ?
                    (<SavingSpinner title="Loading Image"/>) :
                    (
                      <Image src={this.state.profileImageUrl || '/images/user.png'} thumbnail responsive/>
                    )}
                </div>
                <div className={styles['image-buttons']}>
                  {this.state.imageEditable && (this.state.loadingImage === false) &&
                  <div
                    onClick={this.updateImageClick}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} className={styles['icon']}/><span>Edit</span>
                  </div>
                  }
                  {this.state.imageRemovable && (this.state.loadingImage === false) &&
                  <div
                    onClick={this.removeImage}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className={styles['icon']}/><span>Remove</span>
                  </div>
                  }
                </div>
              </Col>
              <input accept="image/png, image/jpg, image/jpeg, image/svg, image/gif" type="file" ref="imageUploader" onChange={this.handleImageChange}
                style={{ display: 'none' }}/>
            </Row>
          </Grid>
        </div>
        }
        { (showPannel ) &&
        <div className={styles['settings-sidebar']}>
          <ul>
            <li data-active={typeof active_page === 'undefined' || active_page == 0 || active_page === 'account_details'} style={{display: account_part ? 'block' : 'none' }}>
	            <Link to={'/settings/account_details'}>
		            <FontAwesomeIcon icon={faInfo} className={styles['icon']}/>
		            <span>Account<br/> Details</span>
	            </Link>
            </li>
            <li data-active={active_page == 1 || active_page === 'plan_details'} style={{display: plain_part ? 'block' : 'none' }}>
	            <Link to={'/settings/plan_details'}>
		            <FontAwesomeIcon icon={faSlidersH} className={styles['icon']}/>
		            <span>Plan<br/> Details</span>
	            </Link>
            </li>
            <li data-active={active_page == 9 || active_page === 'basic_settings'} style={{display: integration_part ? 'block' : 'none' }}>
              <Link to={'/settings/basic_settings'}>
                <FontAwesomeIcon icon={faPlug} className={styles['icon']}/>
                <span>Basic Settings</span>
              </Link>
            </li>
            <li data-active={active_page == 2 || active_page === 'integrations'} style={{display: integration_part ? 'block' : 'none' }}>
	            <Link to={'/settings/integrations'}>
		            <FontAwesomeIcon icon={faPlug} className={styles['icon']}/>
		            <span>Integrations</span>
	            </Link>
            </li>
            <li data-active={active_page == 6 || active_page === 'team_notification'} style={{display: team_notification ? 'block' : 'none' }}>
	            <Link to={'/settings/team_notification'}>
		            <FontAwesomeIcon icon={faUsers} className={styles['icon']}/>
		            <span>Team Notifications</span>
	            </Link>
            </li>
            <li data-active={active_page == 8 || active_page === 'groups'} style={{display: team_notification ? 'block' : 'none' }}>
	            <Link to={'/settings/groups'}>
		            <img src="/images/icons/team-groups.svg" alt="Groups" className={styles.iconImg} />
		            <span>Groups</span>
	            </Link>
            </li>
            <li data-active={active_page == 5 || active_page === 'customer_messages'}>
	            <Link to={'/settings/customer_messages'}>
		            <FontAwesomeIcon icon={faEnvelope} className={styles['icon']}/>
		            <span>Customer<br/>Messages</span>
	            </Link>
            </li>
            <li data-active={active_page == 4 || active_page === 'status_designer'}>
	            <Link to={'/settings/status_designer'}>
		            <FontAwesomeIcon icon={faCogs} className={styles['icon']}/>
		            <span>Templates &<br/> Statuses</span>
	            </Link>
            </li>
            <li data-active={active_page == 3 || active_page === 'password_reset'} style={{display: password_part ? 'block' : 'none' }}>
	            <Link to={'/settings/password_reset'}>
		            <FontAwesomeIcon icon={faLock} className={styles['icon']}/>
		            <span>Change<br/> Password</span>
	            </Link>
            </li>
            {!this.state.profile || this.state.profile.plan_id === 1 &&
            <li data-active={active_page == 7 || active_page === 'api_info'}>
              <Link to="/api_info">
                <FontAwesomeIcon icon={faCode} className={styles['icon']}/>
                <span>API</span>
              </Link>
            </li>}
          </ul>
        </div>
          }
        <div className={cx(styles['settings-content'], fullWidthClass)}>
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
    );
  }
}

AccountWrapper.propTypes = {
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

 export default DragDropContext(HTML5Backend)(AccountWrapper);
