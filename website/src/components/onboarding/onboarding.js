import React, { Component } from 'react';
import styles from './onboarding.module.scss';
import cx from 'classnames';
import { Button, Modal } from 'react-bootstrap';
import Welcome from './components/welcome/welcome';
import AccountDetails from './components/account-detail/account-detail';
import TaskForm from './components/task-form/task-form';
import Tabs from './components/tabs/tabs';
import MobileApps from './components/mobile-apps/mobile-apps';
import Alerts from './components/alerts/alerts';
import API from './components/api/api';
import Finish from './components/finish/finish';
import Joyride from 'react-joyride';
import Team from './components/team/team';
import Calendar from './components/calendar/calendar';
import Dashboard from './components/dashboard/dashboard';
import Activity from './components/activity/activity';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { toast } from 'react-toastify';


export default class OnBoarding extends Component {
  constructor(props, context) {
    super(props, context);

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.prevStep = this.prevStep.bind(this);
    this.team = this.team.bind(this);
    this.taskForm = this.taskForm.bind(this);
    this.calendar = this.calendar.bind(this);
    this.dashboard = this.dashboard.bind(this);
    this.activity = this.activity.bind(this);
    this.callback = this.callback.bind(this);
    this.backToModal = this.backToModal.bind(this);
    this.updateInternalForm = this.updateInternalForm.bind(this);

    this.state = {
      isOpen: true,
      forceHideModal: false,
      step: 0,
      joyrideOverlay: true,
      joyrideType: 'continuous',
      steps: [
        {
          text: this.team(),
          selector: '#sidebar-Team',
          position: 'bottom',
          style: {
            backgroundColor: '#ffffff',
            color: '#fff',
            mainColor: '#00d494',
            width: '50%',
            beacon: {
              inner: '#c4ff9e',
              outer: '#c4ff9e',
            }
          },
        }, {
          text: this.taskForm(),
          selector: '#sidebar-Tasks',
          position: 'bottom',
          style: {
            backgroundColor: '#ffffff',
            color: '#fff',
            mainColor: '#00d494',
            width: '50%',
            beacon: {
              inner: '#c4ff9e',
              outer: '#c4ff9e'
            }
          }
        }, {
          text: this.calendar(),
          selector: '#menu-item-Tasks',
          position: 'bottom',
          style: {
            backgroundColor: '#ffffff',
            color: '#fff',
            mainColor: '#00d494',
            width: '50%',
            beacon: {
              inner: '#c4ff9e',
              outer: '#c4ff9e'
            }
          }
        }, {
          text: this.dashboard(),
          selector: '#sidebar-Dashboard',
          position: 'bottom',
          style: {
            backgroundColor: '#ffffff',
            color: '#fff',
            mainColor: '#00d494',
            width: '50%',
            beacon: {
              inner: '#c4ff9e',
              outer: '#c4ff9e'
            }
          }
        }, {
          text: this.activity(),
          selector: '#activityStreamBtnContainer',
          position: 'bottom',
          style: {
            backgroundColor: '#ffffff',
            color: '#fff',
            mainColor: '#00d494',
            width: '50%',
            beacon: {
              inner: '#ffc548',
              outer: '#ffc548',
            }
          }
        },
      ],
    }
  }

  updateInternalForm(profileData) {
    this.setState({profileLoader: true});
    this.props.updateProfileInformation(profileData).then((res) => {
      const profile = JSON.parse(res);
      this.props.updateProfile(profile);
      const step = this.state.step + 1;
      this.setState({profile, profileLoader: false, step});
    }).catch((err) => {
      const error = JSON.parse(err.responseText);
      const alert = {
        text: error.description,
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastNotification(alert);
      this.setState({profileLoader: false});
    });
  }

  openModal() {
    this.setState({isOpen: true, forceHideModal: false});
  }

  closeModal(increaseStep = false) {
    const step = increaseStep ? this.state.step + 1 : this.state.step;
    this.setState({isOpen: false, step, forceHideModal: increaseStep});
  }

  nextStep() {
    let step = this.state.step;
    let is_company = this.props.userProfile && this.props.userProfile.permissions.includes('COMPANY');

    if (step === 0 && !is_company) {
      step = step + 2;
      this.setState({step});
      return false;
    }

    if (step === 1) {
      this.configurationFormRef.updateAccountDetails();
      return;
    }
    if (step === 2) {
      this.joyride && this.joyride.start(true);
      this.closeModal(true);
      return;
    }
    step = step + 1;
    this.setState({ step });
  }

  prevStep() {
    let step = this.state.step;
    let is_company = this.props.userProfile && this.props.userProfile.permissions.includes('COMPANY');
    if (step === 2 && !is_company){
      step = step - 2;
      this.setState({ step });
      return false;
    }

    if (step === 3) {
      this.joyride && this.joyride.start(true);
      this.closeModal();
      return;
    }
    step = step - 1;
    this.setState({ step });
  }

  backToModal () {
    this.joyride && this.joyride.reset();
    this.openModal();
    const step = this.state.step - 1;
    this.setState({ step });
  }


  callback(data) {
    if (data.action === 'close' || data.action === 'skip') {
      this.joyride.reset();
    }
    if (data.action !== 'close' && data.action !== 'skip' && data.type === 'finished') {
      this.joyride.reset();
      this.openModal();
    }
  }

  steps(step) {
    if (step === 0) {
      return (<Welcome />);
    } else if (step === 1) {
      return (<AccountDetails ref={(configurationFormRef) => {this.configurationFormRef = configurationFormRef;}} updateProfileInformation={this.updateInternalForm} profile={this.props.profile} userProfile={this.props.userProfile} createToastNotification={this.props.createToastNotification} />);
    } else if (step === 2) {
      return (<Tabs />);
    } else if (step === 3) {
      return (<MobileApps />);
    } else if (step === 4) {
      return (<Alerts />);
    } else if (step === 5) {
      return (<API />);
    } else if (step === 6) {
      return (<Finish />);
    }
    return;
  }

  team() {
    return (<Team backToModal={this.backToModal} />);
  }

  taskForm() {
    return (<TaskForm />);
  }

  calendar() {
    return (<Calendar />);
  }

  dashboard() {
    return (<Dashboard />);
  }

  activity() {
    return (<Activity />);
  }

  render() {
    const { step, isOpen, forceHideModal } = this.state;
    let showSkipButton = false;
    if (step > 1 && step < 6) {
      showSkipButton = true;
    }

    return (
      <div>
        <div className={cx(styles.joyrideWrapper)}>
          <Joyride
            ref={c => (this.joyride = c)}
            debug={false}
            steps={this.state.steps}
            type={this.state.joyrideType}
            locale={{
              back: (<span>Back</span>),
              close: (<span>Close</span>),
              last: (<span>Next</span>),
              next: (<span>Next</span>),
              skip: (<span>Skip</span>)
            }}
            showSkipButton
            showOverlay={this.state.joyrideOverlay}
            disableOverlay
            callback={this.callback}
          />
        </div>
        {!forceHideModal &&
        <Modal className={cx(styles['modal-step'])} backdrop='static' show={isOpen} onHide={this.closeModal}>
          <Modal.Body className={cx(styles.body)}>
            {this.steps(step)}
          </Modal.Body>
          <Modal.Footer className={cx(styles.footer)}>
            <div>
              {showSkipButton && <Button onClick={this.closeModal} className={cx(styles.btn, styles['btn-skip'])}>Skip</Button>}
            </div>
            <div>
              {step !== 0 && <Button onClick={this.prevStep} className={cx(styles.btn, styles['btn-light'])} disabled={this.state.profileLoader}>Back</Button>}
              {step === 6 ? <Button onClick={this.closeModal} className={cx(styles.btn, styles['btn-secondary'])}>Finish</Button> : <Button onClick={this.nextStep} className={cx(styles.btn, styles['btn-secondary'])} disabled={this.state.profileLoader}>{this.state.profileLoader ? <SavingSpinner title="" borderStyle="none" /> : 'Next'}</Button>}
            </div>
          </Modal.Footer>
        </Modal>}
      </div>
    );
  }
}
