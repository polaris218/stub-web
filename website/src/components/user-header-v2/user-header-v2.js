import React, { Component } from 'react';
import styles from './user-header-v2.module.scss';
import {Navbar, Nav, NavDropdown, MenuItem} from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import $ from 'jquery';
import _ from 'lodash';
import history from '../../configureHistory';
import { logout } from '../../actions';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPowerOff, faRssSquare, faQuestionCircle, faCode, faUser } from '@fortawesome/fontawesome-free-solid';
import { Cookies } from 'react-cookie';
import cx from 'classnames';
import 'react-toastify/dist/ReactToastify.min.css';

export default class UserHeaderV2 extends Component {
	constructor(props) {
		super(props);

    this.state = {
			menu: [],
			showAPI: false
		};

    this.cookies = new Cookies();

		this.createMenuBasedOnPermissions = this.createMenuBasedOnPermissions.bind(this);
		this.renderMenu = this.renderMenu.bind(this);
		this.handleLogout = this.handleLogout.bind(this);
    this.storageChange = this.storageChange.bind(this);
    this.changeCompany = this.changeCompany.bind(this);
	}

	componentWillMount() {
    window.addEventListener('storage', this.storageChange);
	}

	componentDidMount() {
		this.createMenuBasedOnPermissions();
	}

	componentWillReceiveProps(nextProps) {
		if (!_.isEqual(this.props.profile, nextProps.profile)) {
			this.createMenuBasedOnPermissions(nextProps.profile, this.props.companyProfile || nextProps.companyProfile);
    } else if (!_.isEqual(this.props.companyProfile, nextProps.companyProfile)) {
      this.createMenuBasedOnPermissions(this.props.profile || nextProps.profile, nextProps.companyProfile);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.storageChange);
  }

  storageChange(event) {
    if(event.key === 'logged_out' && event.newValue === 'true') {
      history.push('/login');
    }
  }

  changeCompany(e, companyId) {
		if (this.cookies && parseInt( this.cookies.get('cidx') ) === companyId) {
			return;
		}
    this.cookies.set('cidx', companyId);
    window.location.reload();
	}

	createMenuBasedOnPermissions(profile = this.props.profile, companyProfile = this.props.companyProfile) {
		const dashboard = {
			href: '/dashboard',
			title: 'Dashboard'
		};
		const task = {
			href: '/tasks',
			title: 'Tasks'
		};
		const team = {
			href: '/crew',
			title: 'Team'
		};
		const equipment = {
			href: '/equipment',
			title: 'Equipment'
		};
		const customers = {
			href: '/customers',
			title: 'Customers'
		};
		const requests = {
			href: '/requests',
			title: 'Requests'
		};
		const reviews = {
			href: '/reviews',
			title: 'Reviews'
		};
		const settings = {
			href: '/settings',
			title: 'Settings'
		};
		const api = {
			href: '/api_info',
			title: 'API'
		};
		const reporting = {
			href: '/reporting',
			title: 'Reporting'
		};
		const links = [];
		links.push(dashboard);
		links.push(task);
		let permissions = null;
		let is_company = false;
		let showAPI = false;
		if (profile && profile.permissions) {
      permissions = profile.permissions;
			if (permissions && permissions.includes('COMPANY')) {
				is_company = true
			}
			if (!companyProfile || companyProfile.plan_id === 2) {
				showAPI = true;
			}
			if (is_company || permissions.includes('VIEW_FULL_TEAM_MEMBER_DETAILS')) {
				links.push(team)
			}
			if (is_company || permissions.includes('VIEW_FULL_EQUIPMENT_DETAILS')) {
				links.push(equipment)
			}
			if (is_company || permissions.includes('VIEW_CUSTOMER')) {
				links.push(customers)
			}
      if (is_company || permissions.includes('VIEW_WORKER_REQUEST')) {
        links.push(requests)
      }
			if (is_company || permissions.includes('VIEW_REPORTING')) {
				links.push(reporting)
			}
			links.push(reviews);

			if (is_company || permissions.includes('VIEW_SETTING')) {
				links.push(settings)
			}
			if ((is_company || permissions.includes('ACCESS_API')) && showAPI) {
				links.push(api)
			}
		} else {
      links.push(team);
      links.push(equipment);
      links.push(customers);
      links.push(requests);
      links.push(reporting);
      links.push(reviews);
      links.push(settings);
      links.push(api);
    }
		this.setState({
			menu: links,
			showAPI: showAPI
		});
	}

	renderMenu() {
		const menu = $.extend(true, [], this.state.menu);
		const renderedMenu = menu.map((item) => {
			return (
				<li id={'sidebar-' + item.title}>
					<NavLink id={'menu-item-' + item.title} activeClassName={styles.active} to={item.href}>{item.title}</NavLink>
				</li>
			);
		});
		return renderedMenu;
	}

	handleLogout(e) {
		e.preventDefault();
		e.stopPropagation();
		this.props.activityStreamLogoutHandler();
		setTimeout(() => {
      logout().then(() => {
        localStorage.removeItem('logged_in');
        try {
          localStorage.setItem('logged_out', 'true');
        } catch (e) {
          console.log('LocalStorage Not Available');
          console.log(e);
        }
        let cookies = new Cookies();
        if (cookies && cookies.get('auth')) {
          cookies.remove('auth');
        }
        if (cookies && cookies.get('cidx')) {
          cookies.remove('cidx');
        }
        history.push('/login');
      }).catch(err => {
        console.log(err);
      });
		}, 1e3);
	}

  dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    let _MS_PER_DAY = 1000 * 60 * 60 * 24;
    let utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    let utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  displayTrialStrip(profile){
    if (!profile || (profile.owned_company_id) || profile.plan_id === 2 || (!profile.subscription_info)) {
      return null;
    }
    const billing_type = profile.billing_info.billing_type;
    let trial_expiration_date = profile.subscription_info.trial_expiration_date;
    let current_date = profile.subscription_info.current_date;
    trial_expiration_date = new Date(trial_expiration_date);
    let today = new Date(current_date);
    const isTrial = today <= trial_expiration_date;

    if(billing_type === 'NotFound') {
      if (isTrial) {
        const trialDaysLeft = this.dateDiffInDays(today, trial_expiration_date);
        return <li role="presentation" className={styles['navbar-subscribe-link']}><span>{trialDaysLeft} Days <span>left in trial</span></span> <Link to="/payment_setup">Subscribe</Link></li>;
      } else {
        return <li role="presentation" className={styles['navbar-subscribe-expired-link']}>Trial Expired <Link to="/payment_setup">Subscribe</Link></li>;
      }
    }

    return null;
  }

	render() {
    let showAPI = false;
    if (this.props.companyProfile && this.props.companyProfile.plan_id === 2) {
      showAPI = true;
    }
    const trialStrip = this.displayTrialStrip(this.props.profile);

    let placeholderImageURL = '/images/user-default.svg',
				userName = '',
    		userEmailPhone = '';

    if (this.props.profile && this.props.profile.image_path) {
      placeholderImageURL = this.props.profile.image_path;
    }
    if (this.props.profile && this.props.profile.fullname) {
      userName = this.props.profile.fullname;
    }
    if (this.props.profile && this.props.profile.email) {
      userEmailPhone = this.props.profile.email;
    } else if (this.props.profile && this.props.profile.mobile_number) {
      userEmailPhone = this.props.profile.mobile_number;
		}

    const selectedCompanyId = this.cookies && parseInt(this.cookies.get('cidx')) || (this.props.profile && this.props.profile.user_companies && this.props.profile.user_companies.length > 0 && this.props.profile.user_companies[0].owned_company_id);
    let selectedCompanyImage = '/images/user-default.svg';
    let selectedCompanyName = '';
    let isMultipleCompanies = false;
    if (this.props.profile && this.props.profile.user_companies) {
			selectedCompanyImage = this.props.profile.user_companies[0].company_image || '/images/user-default.svg';
      selectedCompanyName = this.props.profile.user_companies[0].company_name;
      const selectedCompany = this.props.profile.user_companies.find((user_company) => {
        return user_company.owned_company_id === selectedCompanyId;
			});
      if (selectedCompany) {
				selectedCompanyImage = selectedCompany.company_image || '/images/user-default.svg';
        selectedCompanyName = selectedCompany.company_name;
			}
			if (this.props.profile.user_companies.length > 1){
        isMultipleCompanies = true;
			}
		} else if (this.props.profile && !this.props.profile.user_companies) {
			selectedCompanyImage = this.props.profile.image_path || '/images/user-default.svg';
      selectedCompanyName = this.props.profile.fullname;
		}

    return (
			<div className={styles.userHeaderContainer}>
				<Navbar fluid collapseOnSelect>
					<Navbar.Header>
						<Navbar.Brand className={styles.logoContainer}>
							<Link to={'/'}>
								<img className={styles.logo} src='/images/logo-dark.png' alt='Arrivy' />
							</Link>
						</Navbar.Brand>
						<Navbar.Toggle />
					</Navbar.Header>
					<Navbar.Collapse>
						<Nav>
							{ this.renderMenu() }
						</Nav>
						<Nav pullRight className={styles.rightSideNav}>
              { trialStrip }
              <NavDropdown href="javascript: void(0);" id="user-nav" className={styles.userDropdown} eventKey={3} title={<div className={styles.userAvatar}><img src={selectedCompanyImage} alt={selectedCompanyName} /></div>}>
                <MenuItem className={cx(styles.userInfoContainer, isMultipleCompanies ? styles.userProfileInfo : '')} eventKey={3.1} href="javascript: void(0);">
                  <div className={styles.userInfoWrapper}>
										<div className={styles.userAvatarWrapper}>
											<img src={placeholderImageURL} alt={userName} />
										</div>
										<div className={styles.userNameWrapper}>
											<div className={styles.userName}>{userName}</div>
											<div>{userEmailPhone}</div>
										</div>
									</div>
								</MenuItem>
								{this.props.profile && this.props.profile.user_companies && this.props.profile.user_companies.length > 1 && this.props.profile.user_companies.map((user_company) => {
									return (
                    <MenuItem className={cx(styles.userInfoContainer, user_company.owned_company_id === selectedCompanyId ? styles.selectedCompany : '')} eventKey={3.1} onClick={(e) => {this.changeCompany(e, user_company.owned_company_id) }}>
                      <div className={styles.userInfoWrapper}>
                        <div className={styles.userAvatarWrapper}>
                          <img src={user_company.company_image || '/images/user-default.svg'} alt={user_company.company_name} />
                        </div>
                        <div className={styles.userNameWrapper}>
                          <div className={styles.userName}>{user_company.company_name}</div>
                          <div>{user_company.user_role}</div>
                        </div>
                      </div>
                    </MenuItem>
									);
								})}
                {showAPI && <MenuItem className={styles['navbar-link']} target="_blank" href="/developer_portal"><span className={styles.icon}><FontAwesomeIcon icon={faCode} /></span> Developer</MenuItem>}
                <li><NavLink className={styles['navbar-link']} to={"/settings/password_reset"}><span className={styles.icon}><FontAwesomeIcon icon={faUser} /></span>Profile</NavLink></li>
                <MenuItem eventKey={3.2} target="_blank" href="https://help.arrivy.com/"><span className={styles.icon}><FontAwesomeIcon icon={faQuestionCircle} /></span> Help</MenuItem>
                <MenuItem eventKey={3.3} href="https://blog.arrivy.com"><span className={styles.icon}><FontAwesomeIcon icon={faRssSquare} /></span> Blog</MenuItem>
                <MenuItem eventKey={3.4} onClick={this.handleLogout} href="#"><span className={styles.icon}><FontAwesomeIcon icon={faPowerOff} /></span> Logout</MenuItem>
              </NavDropdown>
						</Nav>
					</Navbar.Collapse>
				</Navbar>
			</div>
		);
	}

}
