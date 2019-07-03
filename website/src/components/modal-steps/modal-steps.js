import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { findDOMNode } from 'react-dom';
import { Modal, Button, Form, FormControl, FormGroup, Grid, ControlLabel, Col, Row, Dropdown, MenuItem } from 'react-bootstrap';
import styles from './modal-steps.module.scss';
import { global_country } from '../globalcountryname.js';
import companyTypes from '../../helpers/company_types';
import Autocomplete from 'react-google-autocomplete';
import Select from 'react-select';
import $ from "jquery";
import {getTimezoneOptions} from "../../helpers";
import { toast } from 'react-toastify';

export default class ModalSteps extends Component {

  static propTypes = {
    updateProfileInformation: PropTypes.func.isRequired,
    profile:  PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      step: 0,
      isOpen: true,
      form: {},
      timezonesOptions: [],
    };

    this.steps = [this.renderStep1, this.renderStep2, this.renderStep3];
    this.updateAddress = this.updateAddress.bind(this);
    this.handleGroupTimezoneChange = this.handleGroupTimezoneChange.bind(this);
    this.populateTimezonesOptions = this.populateTimezonesOptions.bind(this);

    if (props.profile && props.profile.owned_company_id) {
      this.steps = [this.renderDriverStep1];
    }

    try {
      let step = 0;
      if (props.profile && !props.profile.owned_company_id) {
        step = +localStorage.getItem('modal-step') || 0;
      }
      this.setState({ step });
    } catch (e) {
      console.log('no localStorage');
    }
  }
  componentWillMount() {
    this.populateTimezonesOptions();
	}

  populateTimezonesOptions() {
    const timezones = getTimezoneOptions();
    const timezonesOptions = [];
    timezones.map((timezone) => {
      timezonesOptions.push(timezone);
    });
    this.setState({
      timezonesOptions
    })
  }

  updateAddress(place) {
    const address = place.formatted_address;
    let country = '';
    place.address_components.forEach(function (item) {
      const item_name = item.types[0];
      if (item_name === 'country') {
        country = item.short_name;
      }
    });
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    let { form } = this.state;
    form["address"] = address;
    form["country"] = country;
    form["exact_location"] = lat + "," + lng;
    $(findDOMNode(this.refs.address)).val(address);
    $(findDOMNode(this.refs.country)).val(country);
    this.setState({ form });
  }

  changeCompanyType(value) {
    let form = this.state.form;
    form['company_type'] = value;
    this.setState({ form });
  }

  handleGroupTimezoneChange(timezone) {
  	const form = this.state.form;
    form.timezone = timezone.value;
    this.setState({ form });
  }

  renderCompanyTypeDropdownList(list) {
    const item = list.find((itemC) => itemC.value === this.state.form.company_type) || list[0];
    return (
			<Dropdown id={item.value} name="company_type" className={styles['user-plan']} onSelect={ ::this.changeCompanyType }>
				<Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
					<div className={styles['user-plan-info']}>
						<span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
						<small className={styles['user-plan-calls']}>{item.details}</small>
					</div>
				</Dropdown.Toggle>
				<Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            return (
							<MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value}>
								<div className={styles['user-plan-info']}>
									<span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
									<small className={styles['user-plan-calls']}>{itemC.details}</small>
								</div>
							</MenuItem>
            );
          })}
				</Dropdown.Menu>
			</Dropdown>
    );
  }

  renderStep1 = () => {
    const country_options = global_country.map((data) => {
      return (<option key={'id-' + data.ISO2} value={data.ISO2}>{data.country}</option>);
    });

    return (
			<div className={ styles.step }>
				<h5 className={ styles['step-title'] }>Let's set up your profile</h5>
				<Grid className={ styles['form-grid'] }>
					<Row>
						<Col mdOffset={2} md={8}>
							<Grid className={ styles['form-grid'] }>
								<Row>
									<Form horizontal className="custom-form" onSubmit={ ::this.updateAccountDetails }>
										<FormGroup>
											<Col componentClass={ ControlLabel } sm={3}>
												COMPLETE ADDRESS
											</Col>
											<Col sm={9}>
												<div id="locationField">
													<Autocomplete
														onPlaceSelected={(place) => {
                              this.updateAddress(place);
                            }}
														placeholder="Find address here..."
														types={['geocode']}
														ref="address"
														name="address"
														onChange={ ::this.onFieldChange }
														value={this.state.form.address}
													/>
												</div>
											</Col>
										</FormGroup>
										<FormGroup>
											<Col componentClass={ ControlLabel } sm={3}>
												COUNTRY
											</Col>
											<Col sm={9}>
												<FormControl name="country" ref="country" componentClass="select" placeholder="Country" onChange={ ::this.onFieldChange } value={ this.state.form.country }>
													<option default>--Select Country--</option>
                          {country_options}
												</FormControl>
											</Col>
										</FormGroup>
										<FormGroup>
											<Col componentClass={ ControlLabel } sm={3}>
												PRIMARY PHONE
											</Col>
											<Col sm={9}>
												<FormControl name="mobile_number" onChange={ ::this.onFieldChange }  />
											</Col>
										</FormGroup>
										<FormGroup>
											<Col componentClass={ ControlLabel } sm={3}>
												BUSINESS
											</Col>
											<Col sm={9}>
                        { this.renderCompanyTypeDropdownList(companyTypes) }
											</Col>
										</FormGroup>
                    <FormGroup>
                      <Col componentClass={ ControlLabel } sm={3}>
                        TIMEZONE*
                      </Col>
                      <Col sm={9}>
                        <Select
                          onChange={this.handleGroupTimezoneChange}
                          id='timezone'
                          isMulti={false}
                          placeholder={'Select group timezone...'}
                          options={this.state.timezonesOptions}
                          value={this.state.timezonesOptions.find((el) => { return el.value === this.state.form.timezone; })}
                          isSearchable
                        />
                      </Col>
                    </FormGroup>
										<FormGroup>
											<Col componentClass={ ControlLabel } sm={3}>
												INTRO
											</Col>
											<Col sm={9}>
												<FormControl placeholder='Optional' name="intro" onChange={ ::this.onFieldChange }  />
											</Col>
										</FormGroup>
									</Form>
								</Row>
							</Grid>
						</Col>
					</Row>
				</Grid>
			</div>
    );
  }

  renderStep2() {
    return (
			<div className={ styles.step }>
				<div className={ styles['step-title'] }>Install mobile apps</div>
				<div className={ styles['apps-header'] }>
					Install the apps for iPhone/iPad and Android to keep connected on the go.
				</div>
				<div className="text-center">

					<ul className={ styles['apps-description'] }>
						<li>It helps see your team's location</li>
						<li>Report & Check work status on the go</li>
						<li>Enables live estimates for you and your customers</li>
					</ul>
				</div>
				<div className={ styles['apps-buttons'] }>
					<a href="https://play.google.com/store/apps/details?id=com.insac.can.pinthatpoint&hl=en" target="_blank"><img src="/images/google_badge.png" /></a>
					<a href="https://itunes.apple.com/us/app/pinthatpoint-go/id1177367972?ls=1&mt=8" target="_blank"><img src="/images/appstore_badge.png" /></a>
				</div>
			</div>
    );
  }

  renderStep3() {
    return (
			<div className={ styles.step }>
				<div className={ styles['step-title'] }>Add your team members</div>
				<div className="text-center">
					<p className= { styles['team-step'] }>Go to Team tab and simply add name and email of your team member. We'll send an invite to your team member to join Arrivy and start working!</p>
				</div>
				<div className= { styles['player'] }>
					<img src="images/help/add_new_team_member_low.gif" />
				</div>
			</div>
    );
  }


  renderDriverStep1() {
    return (
			<div className={ styles.step }>
				<div className={ styles['step-title'] }>Thanks for accepting your company's invite.</div>
				<div className={ styles['step-title'] }>Now let's install mobile apps</div>
				<div className={ styles['apps-header'] }>
					Install the apps for iPhone/iPad and Android to keep connected with your tasks and customers on the go.
				</div>
				<div className="text-center">

					<ul className={ styles['apps-description'] }>
						<li>Report & Check work status and notes on the go</li>
						<li>Automatically share location with your business and customers</li>
						<li>Enables live arrival estimates for your business and your customers</li>
					</ul>
				</div>
				<div className={ styles['apps-buttons'] }>
					<a href="https://play.google.com/store/apps/details?id=com.insac.can.pinthatpoint&hl=en" target="_blank"><img src="/images/google_badge.png" /></a>
					<a href="https://itunes.apple.com/us/app/pinthatpoint-go/id1177367972?ls=1&mt=8" target="_blank"><img src="/images/appstore_badge.png" /></a>
				</div>
			</div>
    );
  }


  stepDone() {
    let { step } = this.state;
    const isLastStep = step + 1 === this.steps.length;

    if (isLastStep) {
      this.close();
    } else {
      if (step === 0 && this.steps[0] === this.renderStep1) {
      	if (!this.state.form.timezone) {
          const alert = {
            text: 'Timezone is required',
            options: {
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastErrorAlert,
              autoClose: 8000
            }
          };
          this.props.createToastNotification(alert);
      		return;
				}
        this.updateAccountDetails();
      }
      this.nextStep();
    }
  }

  nextStep() {
    const step = this.state.step + 1;
    this.setState({ step });
    try {
      localStorage.setItem('modal-step', step);
    } catch (e) {
      console.log('LocalStorage Not Available');
      console.log(e);
    }
  }

  onFieldChange(e) {
    let { form } = this.state;
    form[e.target.name] = e.target.value;
    this.setState({ form });
  }

  updateAccountDetails(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.props.updateProfileInformation(this.state.form);
  }

  close() {
    this.setState({ isOpen: false });
  }

  render() {
    const { step, isOpen } = this.state;
    const isLastStep = step + 1 === this.steps.length;

    return (
			<Modal className={ styles.modal } backdrop='static' show={ isOpen } onHide={ ::this.close }>
        {/*<ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>*/}
				<img className={ styles.background } src="/images/new-icon-without-a.png"></img>
				<Modal.Header className={ styles.header }>
					<Modal.Title bsClass={ styles.title }>Welcome to Arrivy</Modal.Title>
				</Modal.Header>
				<Modal.Body>
          { this.steps[step]() }
				</Modal.Body>
				<Modal.Footer className={ styles.footer }>
          { false && <Button bsStyle='link' onClick={ ::this.nextStep }>Skip</Button> }
					<Button className='btn-submit' onClick={ ::this.stepDone }>
            { step + 1 }/{ this.steps.length } { isLastStep ? 'Done' : 'Next' }
					</Button>
				</Modal.Footer>
			</Modal>
    );
  }
}
