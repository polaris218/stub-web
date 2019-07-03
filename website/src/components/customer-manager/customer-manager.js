import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Alert,
  Grid,
  Modal
} from 'react-bootstrap';
import styles from './customer-manager.module.scss';
import ErrorAlert from '../error-alert/error-alert';
import CustomerForm from '../customer-form/customer-form';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { getErrorMessage } from '../../helpers/task';
import { toast, ToastContainer } from 'react-toastify';
import cx from 'classnames';
const ArrowUp   = (<span>▴</span>);
const ArrowDown = (<span>▾</span>);

export default class CustomerManager extends Component {
  constructor(props) {
    super(props);
    this.removeCustomer = this.removeCustomer.bind(this);
    this.createCustomer = this.createCustomer.bind(this);
    this.scrollHandle = this.scrollHandle.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
    this.search = this.search.bind(this);
    this.onRowClicked = this.onRowClicked.bind(this);
    this.filterChangeCallback = this.filterChangeCallback.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.state = {
      alerts: props.alerts || [],
      customers: [],
      checksearch:null,
      customersList:null,
      searchText: null,
      sendingCustomer: false,
      updatingCustomer: false,
      fetchInProgress: false,
      fetchLast: 0,
      internetIssue: undefined,
      currPage: 0,
      itemsOnPage: 100,
      sortOrderAsc: {
        first_name: true,
        last_name: true,
        city: true,
        zipcode: true
      },
      lastSorted: '',
      customerFilter: 'group',
      toggleModal: false,
      spinner: false,
    };

    this.previousFilterText = '';
  }

  toggleModal(e, customer = null) {
    e.preventDefault();
    e.stopPropagation();
    let toggleModal = this.state.toggleModal;
    this.setState({toggleModal: !toggleModal, selectedCustomer: customer});
  }

  scrollHandle(){
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
      if (this.isFetchAvailable()) {
        this.updateCustomers();
      }
    }
  }

  componentDidMount() {
    this.updateCustomers();
    window.addEventListener('scroll' , this.scrollHandle)
  }

  componentWillUnmount(){
    window.removeEventListener('scroll' , this.scrollHandle)
  }

  isFetchAvailable() {
    if (this.state.fetchInProgress) {
      return false;
    }

    const now = new Date().getTime();
    if ((now - this.state.fetchLast) < 1000) {
      return false;
    }

    return true;
  }

  getEmptyCustomerText() {
    return <div className={styles.messageBox}>No customers to show</div>;
  }
  getEmptySearchResultText() {
    return <div className={styles.messageBox}>No customers found</div>;
  }

  filterChangeCallback(filter) {
    this.setState({
      customerFilter: filter
    });
  }

  updateCustomers(newId, searchText = '', stopSearch = false) {
    if(this.state.timer){
      clearTimeout(this.state.timer);
    }

    this.setState({
      fetchInProgress: true
    });
    const realSearchText = searchText || this.state.searchText;
    const searchContinues = this.state.searchText && !searchText;
    if (realSearchText && !stopSearch) {
      this.props.searchCustomers(searchText || this.state.searchText, searchContinues ? this.state.currPage : 0, this.state.itemsOnPage).then(result => {
        let jsonCustomers = JSON.parse(result);
        const currCustomers = this.state.customers;
        let customers = [];
        let nextPage;
        if (searchContinues) {
          currCustomers.forEach(customer => {
            jsonCustomers = jsonCustomers.filter(item => item.id !== customer.id);
          });
          customers = currCustomers.concat(jsonCustomers);
          nextPage = Math.floor(customers.length / this.state.itemsOnPage) + 1;
        } else {
          customers = jsonCustomers;
          nextPage = 1;
        }
        this.setState({
          customers,
          currPage: nextPage,
          fetchInProgress: false,
          internetIssue: undefined,
          fetchLast: new Date().getTime(),
          searchText: realSearchText
        });
      }).catch((err) => {
        if(err.status === 0) {
          this.setState({
            internetIssue: true,
            fetchInProgress: false,
          });
        }
      });
      const timer = setTimeout(() => {
        this.updateCustomers();
      }, 6e4);
      if (this.setTimer && !document.hidden) {
        this.setState({
          timer,
          internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
        });
      } else {
        clearTimeout(timer);
      }
    } else {
      this.props.updateCustomers(this.state.currPage, this.state.itemsOnPage).then(result => {
        let jsonCustomers = JSON.parse(result);
        const currCustomers = stopSearch ? [] : this.state.customers;
        currCustomers.forEach(customer => {
          jsonCustomers = jsonCustomers.filter(item => item.id !== customer.id);
        });
        if (newId) {
          jsonCustomers = jsonCustomers.map(item => {
            return { ...item, new: newId === item.id };
          });
        }
        const customers = currCustomers.concat(jsonCustomers);
        const nextPage = stopSearch ? 1 : Math.floor(customers.length / this.state.itemsOnPage) + 1;
        this.setState({
          customers,
          currPage: nextPage,
          fetchInProgress: false,
          internetIssue: undefined,
          fetchLast: new Date().getTime(),
          searchText: ''
        });
      }).catch((err) => {
        if(err.status === 0) {
          this.setState({
            internetIssue: true,
            fetchInProgress: false
          });
        }
      });
      const timer = setTimeout(() => {
        this.updateCustomers();
      }, 6e4);
      if (this.setTimer && !document.hidden) {
        this.setState({
          timer,
          internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
        });
      } else {
        clearTimeout(timer);
      }
    }
  }

  removeAlert(idx) {
    this.setState({
      alerts: this.state.alerts.filter((alert, id) => {
        return id !== idx;
      })
    });
  }

  addAlert(alert) {
    const alerts = this.state.alerts,
    removeAlert = this.removeAlert.bind(this);
    alert['timeout'] = function(idx) {
      setTimeout(() => {
        removeAlert(idx);
      }, 1e4);
    };
    alerts.push(alert);
    this.setState({
      alerts
    });
  }

  removeCustomer() {
    const customer = this.state.selectedCustomer;
    this.setState({spinner: true});
    if (this.props.deleteCustomer && customer) {
      this.props.deleteCustomer(customer.id)
        .then(() => {
          const customers = this.state.customers.filter(item => customer.id !== item.id)
          this.setState({ customers, toggleModal: false, spinner: false})
          setTimeout(() => {
            const customerDeleted = {
              text: 'Customer ' +  customer.first_name + ' was removed',
              options: {
                type: toast.TYPE.SUCCESS,
                position: toast.POSITION.BOTTOM_LEFT,
                className: styles.toastSuccessAlert,
                autoClose: 8000
              }
            };
            this.createToastAlert(customerDeleted);
            this.updateCustomers();
          }, 1e2);
        });
    }
  }


  createCustomer({ first_name, last_name, company_name, email, phone, mobile_number, notes, address_line_1, address_line_2, city, state, country, zipcode, extra_fields, notifications, additional_addresses  }) {
    this.setState({ sendingCustomer: true });
    this.props.createCustomer({ first_name, last_name, company_name, email, phone, mobile_number, notes, address_line_1, address_line_2, city, state, country, zipcode, extra_fields, notifications , additional_addresses })
      .then(result => {
        const jsonResult = JSON.parse(result);
        this.setState({ sendingCustomer: false });
        this.refs.Customerform.close();
        setTimeout(() => {
          this.updateCustomers(jsonResult.id);
	        const customerAdded = {
              text: 'Customer ' + first_name + ' was added!',
              options: {
                type: toast.TYPE.SUCCESS,
                position: toast.POSITION.BOTTOM_LEFT,
                className: styles.toastSuccessAlert,
                autoClose: 8000
              }
	        };
	        this.createToastAlert(customerAdded);
        }, 1e2);
      })
      .catch((err) => {
        this.setState({ sendingCustomer: false });
        const errorResponse = JSON.parse(err.responseText);
	      const customerAddError = {
            text: getErrorMessage(errorResponse),
            options: {
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastErrorAlert,
              autoClose: 8000
            }
	      };
	      this.createToastAlert(customerAddError);
      });
  }

  updateCustomer({ id, first_name, last_name, company_name, email, phone, mobile_number,  notes, address_line_1, address_line_2, city, state, country, zipcode, extra_fields, notifications, group_id, additional_addresses }) {
    this.setState({ updatingCustomer: true });
    this.props.updateCustomer({ id, first_name, last_name, company_name, email, phone, mobile_number, notes, address_line_1, address_line_2, city, state, country, zipcode, extra_fields, notifications, group_id, additional_addresses })
      .then(() => {
        const customers = this.state.customers.map(item => {
          if (item.id === id) {
            const address = address_line_1 + ' ' + address_line_2 + ' ' + city + ' ' + state + ' ' + zipcode;
            return { id, first_name, last_name, company_name, email, phone, mobile_number, notes, address, address_line_1, address_line_2, city, state, country, zipcode, group_id, extra_fields: JSON.parse(extra_fields), notifications: JSON.parse(notifications) ,additional_addresses: JSON.parse(additional_addresses) };
          } else {
            return item;
          }
        });
        this.refs.Customerform.close();
        setTimeout(() => {
          const customerUpdated = {
            text: 'Customer ' + first_name + ' was modified!',
            options: {
              type: toast.TYPE.SUCCESS,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastSuccessAlert,
              autoClose: 8000
            }
          };
          this.createToastAlert(customerUpdated);
        }, 1e2);
        this.setState({
          customers,
          updatingCustomer: false
        }, () => { this.updateCustomers(); });
      })
      .catch((res) => {
        this.setState({ updatingCustomer: false });
        const error = JSON.parse(res.responseText);
	      const customerUpdateError = {
            text: getErrorMessage(error),
            options: {
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastErrorAlert,
              autoClose: 8000
            }
	      };
	      this.createToastAlert(customerUpdateError);
      });
  }
  sortCustomers(customers, col_name, asc = false) {
    customers.sort((a, b) => {
      if (!a[col_name] || !b[col_name]) {
        return -1;
      }
      const lc_a = a[col_name].toLowerCase();
      const lc_b = b[col_name].toLowerCase();
      if (asc || this.state.sortOrderAsc[col_name]) {
        if (lc_a > lc_b) {
          return 1;
        }
        if (lc_a < lc_b) {
          return -1;
        }
      } else {
        if (lc_a < lc_b) {
          return 1;
        }
        if (lc_a > lc_b) {
          return -1;
        }
      }

      return 0;
    });
  }
  invertSortOrder(col_name) {
    const sortOrderAsc  = this.state.sortOrderAsc;
    const customers     = this.state.customers;
    let lastSorted      = this.state.lastSorted;
    sortOrderAsc[col_name]  = !sortOrderAsc[col_name];
    lastSorted = col_name;

    this.sortCustomers(customers, col_name, sortOrderAsc[col_name]);
    this.setState({ sortOrderAsc, lastSorted, customers });
  }

  search(term) {
    if (!term || term.length >= 3) {
      let stopSearch = false;
      if (this.state.searchText && !term) {
        stopSearch = true;
      }
      this.updateCustomers(null, term.toLowerCase(), stopSearch);
    } else {
      const searchWarning = {
        text: 'You should enter at least 3 symbols to perform search.',
        options: {
          type: toast.TYPE.WARNING,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastWarningAlert,
          autoClose: 8000
        }
      };
      this.createToastAlert(searchWarning);
    }
  }
  getArrow(col_name) {
    if (this.state.lastSorted === col_name) {
      return this.state.sortOrderAsc[col_name] ? ArrowUp : ArrowDown;
    } else {
      return null;
    }
  }
  onRowClicked(e, customer) {
    const className = e.target.className;
    if (className.indexOf('action') !== -1) return;

    this.refs.Customerform.edit(customer);
  }

  renderCustomer(customer, index) {
    this.can_edit = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY'))is_company = true;
      if (is_company || permissions.includes('EDIT_CUSTOMER'))this.can_edit = true;
    }

    return (
      <tbody>
      <tr className={customer.new ? styles["new-customer"] : '' } key={index} onClick={this.can_edit ? e => this.onRowClicked(e, customer) : ''}>
        <td>{customer.first_name}</td>
        <td>{customer.last_name}</td>
        <td>{customer.address}</td>
        <td>{customer.city}</td>
        <td>{customer.state}</td>
        <td>{customer.zipcode}</td>
        <td>{customer.email}</td>
        <td>{customer.mobile_number}</td>
        <td>{customer.phone}</td>
        {this.can_delete &&
        <td>
          <a href="javascript:void(0)" className={styles.action} onClick={(e) => this.toggleModal(e, customer)}>Remove</a>
        </td>
        }
      </tr>
      <tr className={styles.emptyRow}><td colSpan={10}/></tr>
      </tbody>
    );
  }

  createToastAlert(alert) {
    toast(alert.text, alert.options);
  }

  render() {
    this.can_delete = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY'))is_company = true;
      if (is_company || permissions.includes('DELETE_CUSTOMER'))this.can_delete = true;
    }

    const unfilteredCustomers = this.state.customers;
    let customers = [];
    if (this.props.profile && this.props.profile.group_id !== null && this.state.customerFilter === 'group') {
      customers = unfilteredCustomers.filter(customer => {
        return customer.group_id === this.props.profile.group_id
      });
    } else {
      customers = this.state.customers;
    }
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>;

    const headers = ['First Name', 'Last Name', 'Address', 'City', 'State', 'Zip Code', 'Email', 'Mobile Number', 'Phone Number', 'Actions'].map((header, idx) => {
      switch (header) {
        case 'First Name':
          return (<th key={idx} className={styles.sortable} onClick={() => this.invertSortOrder('first_name')}>
            { header }
            { this.getArrow('first_name') }
          </th>);
        case 'Last Name':
          return (<th key={idx} className={styles.sortable} onClick={() => this.invertSortOrder('last_name')}>
            { header }
            { this.getArrow('last_name') }
          </th>);
        case 'City':
          return (<th key={idx} className={styles.sortable} onClick={() => this.invertSortOrder('city')}>
            { header }
            { this.getArrow('city') }
          </th>);
        case 'Zip Code':
          return (<th key={idx} className={styles.sortable} onClick={() => this.invertSortOrder('zipcode')}>
            { header }
            { this.getArrow('zipcode') }
          </th>);
        default:
          return <th key={idx}>{header}</th>;
      }
    }),
    updateCustomers = this.updateCustomers.bind(this);

    if (!customers) {
      this.state.customersList = (<tr>
        <td colSpan="6">
          <SavingSpinner title="Loading" size={8} borderStyle="none" />
        </td>
      </tr>);
    } else if (customers.length === 0) {
      this.state.customersList = (<tr className={styles.emptyRow}>
        <td colSpan="10">
          {this.getEmptyCustomerText()}
        </td>
      </tr>);
    } else {
      this.state.customersList = (customers.map((customer, i) => {
        return this.renderCustomer(customer, i);
      }));
      this.state.customersList = this.state.customersList.filter(item => item !== null);
      if (!this.state.customersList.length) {
        this.state.customersList = (<tr className={styles.emptyRow}>
          <td colSpan="6">
            {this.getEmptySearchResultText()}
          </td>
        </tr>);
      }
    }

    return (
      <Grid>
        <div className={styles['customer-manager']}>
          <ErrorAlert errorText="No internet connection" showError={this.state.internetIssue}/>
          <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
          <CustomerForm
          createCustomer={this.createCustomer}
          updateCustomer={this.updateCustomer}
          search={this.search}
          ref="Customerform"
          sendingCustomer={this.state.sendingCustomer}
          updatingCustomer={this.state.updatingCustomer}
          profile={this.props.profile}
          companyProfile={this.props.companyProfile}
          filterChangeCallback={this.filterChangeCallback}
          createToastAlert={this.createToastAlert}
          />

          {this.state.alerts && this.state.alerts.map((alert, idx) => {
            alert.timeout(idx);
            return (<Alert key={idx} bsStyle={alert.bsStyle}><strong>{alert.content}</strong></Alert>);
          })}

          {(!this.state.fetchInProgress || (this.state.customers && this.state.customers.length > 0)) && <div className={styles.customersTableWrapper}><Table className={styles.customersTable} responsive>
            <thead>
              <tr>{headers}</tr>
            </thead>
            <tbody>
              <tr className={styles.emptyRow}><td colSpan={10} /></tr>
            </tbody>
            {this.state.customersList}
          </Table></div>}
          <div className={styles.spinner}>{this.state.fetchInProgress && <SavingSpinner title="Loading" borderStyle="none" />}</div>

          <Modal dialogClassName={cx(styles.modalPrimary, styles.modalDelete)} show={this.state.toggleModal} onHide={this.toggleModal} keyboard={false} backdrop={'static'}>
            <Modal.Header className={styles.modalHeader}>
              <Modal.Title className={styles.modalTitle}>Delete Customer</Modal.Title>
              <i className={styles.closeIcon} onClick={this.toggleModal}>{crossIcon}</i>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
              <div className={styles.box}>
                <div className={styles.boxBody}>
                  <div className={styles.boxBodyInner}>
                    <p>Are you sure that you want to delete {this.state.selectedCustomer && this.state.selectedCustomer.first_name}?</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={this.removeCustomer} disabled={this.state.spinner} className={cx(styles.btn, styles['btn-secondary'])}>
                  {this.state.spinner ? <SavingSpinner color="#ffffff" borderStyle="none" /> : 'Delete'}
                </button>
                <button type="button" onClick={this.toggleModal} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </Grid>
    );
  }
}

CustomerManager.propTypes = {
  createCustomer: PropTypes.func.isRequired,
  updateCustomers: PropTypes.func.isRequired,
  searchCustomers: PropTypes.func.isRequired,
  deleteCustomer: PropTypes.func.isRequired,
  updateCustomer: PropTypes.func.isRequired
};
