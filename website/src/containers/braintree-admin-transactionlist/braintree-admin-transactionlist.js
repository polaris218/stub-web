import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';
import moment from 'moment';
import {Table, Button, Grid} from 'react-bootstrap';
import {routeToLogin} from '../../helpers/route';
import {
  getProfileInformation, getAdminListTransactions, createTransaction,
  removeTransaction, getCompanyProfileInformation
} from '../../actions';
import styles from './braintree-admin-transactionlist.module.scss';
import {Header, LocationMap} from '../../components';
import {UserHeaderV2, ActivityStream, PaymentManager, SlimFooterV2} from '../../components';

export default class BraintreeAdminTransactionList extends Component {
  constructor(props, context) {
    super(props, context);

    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
    this.getHeaders = this.getHeaders.bind(this);
    const {location} = this.props;
    this.state = {
      transactions: null,
      activityStreamStateHandler: null,
      companyProfile: null,
      internetIssue: undefined,
    };
    //this.settleTransaction = this.settleTransaction.bind(this);
  }

  removeTransaction(transaction) {
    removeTransaction(transaction.transaction_id).then((res) => {
      this.updateTransactions();
    }).catch((e) => {
      this.updateTransactions();
    })
  }

  updateTransactions() {
    getAdminListTransactions(this.state.subscription_id).then((transactions) => {
      this.setState({
        transactions: JSON.parse(transactions).list
      });
    });
  }

  componentWillMount() {
    getCompanyProfileInformation().then((res) => {
      let companyProfile = JSON.parse(res);
      this.setState({companyProfile});
    }).catch((err) => {
      if (err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });

    getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      let permissions = null;
      let is_company = false;
      let view_activity_stream = false;
      if (profile) {
        if (profile && profile.permissions) {
          permissions = profile.permissions
        }
        if (permissions && permissions.includes('COMPANY')) {
          is_company = true
        }
        if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
          view_activity_stream = true;
        }
      }
      this.setState({profile, view_activity_stream});
      this.updateTransactions();
    }).catch((error) => {
      if (error.status === 401) {
        routeToLogin(this.props.location, this.context.router);
      }
    });
  }

  renderTransaction(transaction, headers) {
    const removeTransaction = () => {
      this.removeTransaction(transaction)
    };

    let baseCharges = transaction.amount;
    if (transaction.additional_charges) {
      Object.keys(transaction.additional_charges).forEach((key) => {
        const price = transaction.additional_charges[key]['price'];
        const discount = transaction.additional_charges[key]['discount'];
        baseCharges = baseCharges - (price - (discount ? (price * (discount / 100)) : 0));

      });
    }

    const data = [];
    data.push(<td>{moment.utc(transaction.created).local().format('MMMM DD, YYYY hh:mm A')}</td>);
    data.push(<td>${transaction.amount.toFixed(2)}</td>);
    data.push(<td>{transaction.status}</td>);
    data.push(<td>{transaction.result}</td>);
    data.push(<td>{transaction.owner}</td>);
    data.push(<td>{transaction.transaction_id}</td>);
    data.push(<td>${baseCharges.toFixed(2)}</td>);
    // Total 7 static headers
    if (headers.length > 7) {
      for (let i = 7; i < headers.length; i++) {
        data.push(<td></td>);
      }
    }
    let index = -1;
    transaction.additional_charges && Object.keys(transaction.additional_charges).forEach((key) => {
      index = headers.indexOf(key);
      if (index !== -1) {
        const price = transaction.additional_charges[key]['price'];
        const discount = transaction.additional_charges[key]['discount'];
        data[index] = <td>${(price - (discount ? (price * (discount / 100)) : 0)).toFixed(2)}</td>
      }
    });

    return (
      <tr key={transaction.transaction_id}>
        {data}
      </tr>

    );
  }


  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  getHeaders() {
    const headers = [];
    headers.push('Created');
    headers.push('Amount');
    headers.push('Status');
    headers.push('Result');
    headers.push('Owner');
    headers.push('ID');
    headers.push('Base Charges');

    const transactionsWithAdditionalCharges = this.state.transactions && this.state.transactions.filter((singleTransaction) => {
      return !!singleTransaction.additional_charges;
    });

    transactionsWithAdditionalCharges && transactionsWithAdditionalCharges.map((transaction) => {
      Object.keys(transaction.additional_charges).forEach((key) => {
        if (headers.indexOf(key) === -1) {
          headers.push(key);
        }
      })
    });

    return headers;
  }

  render() {
    let transactionList = '';
    const headers = this.getHeaders();
    if (!this.state.transactions) {
      transactionList = '';
    } else if (this.state.transactions.length) {
      transactionList = (this.state.transactions.map((transaction) => {
        return this.renderTransaction(transaction, headers);
      }));
    }

    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <div className={styles['page-wrap']}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router}
                        profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          <ActivityStream showActivities={this.state.view_activity_stream}
                          onStateChange={activityStreamStateHandler => {
                            this.activityStreamStateChangeHandler(activityStreamStateHandler)
                          }}/>
          <Grid>
            <h3>
              <span>Transactions</span>
            </h3>

            <Table responsive>
              <thead>
              <tr>
                {headers.map((headerName) => {
                  return <th>{headerName}</th>
                })}
              </tr>
              </thead>
              <tbody>
              {transactionList}
              </tbody>
            </Table>
          </Grid>
        </div>
        <div className={styles.footer}>
          <SlimFooterV2/>
        </div>
      </div>
    )
  }
}


BraintreeAdminTransactionList.contextTypes = {
  router: PropTypes.object.isRequired
};
