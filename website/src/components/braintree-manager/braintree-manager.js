import React, { Component } from 'react';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { Button, Row, Col, Table } from 'react-bootstrap';
import { BraintreePaymentMethodForm } from '../../components';
import { createBraintreeCustomer, getActiveSubscriptions, deleteActiveSubscription, getClientToken } from '../../actions';


export default class PaymentManager extends Component {
  constructor(props) {
    super(props);

    this.updateSubscriptions = this.updateSubscriptions.bind(this);
    this.onDeleteSubscription = this.onDeleteSubscription.bind(this);
    this.onCreateCustomer = this.onCreateCustomer.bind(this);

    this.state = {
        subscriptions: null,
        clientToken: 'eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiIxNmM3ZDU4MjI1OTQ0OTIxZTg5MTFhNWZiNTAwNWU1NGViNjQ2NDBhMzAzZmE4MDU1MTgxNjQ1Y2U3OTRlNjRifGNyZWF0ZWRfYXQ9MjAxNi0xMS0xOFQxMjo1NjowMS41OTM5OTU0NDIrMDAwMFx1MDAyNm1lcmNoYW50X2lkPTR2cGQ1OTRuODR2dHNzeTNcdTAwMjZwdWJsaWNfa2V5PXZ4bXM5OGM3dmJiamZ4bXYiLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvNHZwZDU5NG44NHZ0c3N5My9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzLzR2cGQ1OTRuODR2dHNzeTMvY2xpZW50X2FwaSIsImFzc2V0c1VybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC52ZW5tby5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tLzR2cGQ1OTRuODR2dHNzeTMifSwidGhyZWVEU2VjdXJlRW5hYmxlZCI6dHJ1ZSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1lIjoiTXVoaW8iLCJjbGllbnRJZCI6bnVsbCwicHJpdmFjeVVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS9wcCIsInVzZXJBZ3JlZW1lbnRVcmwiOiJodHRwOi8vZXhhbXBsZS5jb20vdG9zIiwiYmFzZVVybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXNzZXRzVXJsIjoiaHR0cHM6Ly9jaGVja291dC5wYXlwYWwuY29tIiwiZGlyZWN0QmFzZVVybCI6bnVsbCwiYWxsb3dIdHRwIjp0cnVlLCJlbnZpcm9ubWVudE5vTmV0d29yayI6dHJ1ZSwiZW52aXJvbm1lbnQiOiJvZmZsaW5lIiwidW52ZXR0ZWRNZXJjaGFudCI6ZmFsc2UsImJyYWludHJlZUNsaWVudElkIjoibWFzdGVyY2xpZW50MyIsImJpbGxpbmdBZ3JlZW1lbnRzRW5hYmxlZCI6dHJ1ZSwibWVyY2hhbnRBY2NvdW50SWQiOiJtdWhpbyIsImN1cnJlbmN5SXNvQ29kZSI6IlVTRCJ9LCJjb2luYmFzZUVuYWJsZWQiOmZhbHNlLCJtZXJjaGFudElkIjoiNHZwZDU5NG44NHZ0c3N5MyIsInZlbm1vIjoib2ZmIn0=',
        loading_client_token: true
    };
  }

  componentWillMount() {
    getClientToken().then((res)=> {
      res = JSON.parse(res);
      this.setState({
        clientToken: res.client_token,
        loading_client_token: false
      });
    }).catch((error) => {
      console.log(error);
      // TODO: Something goes wrong: Show message about that!
    })
  }

  onDeleteSubscription() {
      this.setState({
        subscriptions: null
      })
      deleteActiveSubscription(this.state.subscriptions[0].subscription_id).then((res) => {
          this.updateSubscriptions();
      }).catch((error) => {
          console.log(error);
          // TODO: Something goes wrong: Show message about that!
      })
  }

  onCreateCustomer(nonce) {
    this.setState({
        subscriptions: null
    })
    createBraintreeCustomer(nonce).then((res) => {
      window.location = '/settings/plan_details'
    }).catch((error) => {
      console.log(error);
    })
  }

  componentDidMount() {
    this.updateSubscriptions();
  }

  updateSubscriptions() {
    getActiveSubscriptions().
    then((subscriptions) => {
      this.setState({
        subscriptions: JSON.parse(subscriptions).list
      });
    });
  }

  renderSubscription(subscription) {
    return (
        <tr key={subscription.subscription_id}>
          <td>{subscription.payment_method && subscription.payment_method.billing_type}</td>
          <td>{subscription.payment_method && subscription.payment_method.billing_info}</td>
          <td>{subscription.subscription_date}</td>
        </tr>
      )
  }

  render() {
      if (!this.state.subscriptions || !this.props.profile || this.state.loading_client_token) {
          this.state.subscriptionsList = (
              <SavingSpinner title="" size={8} borderStyle="none" />
          );
      } else if (!this.state.subscriptions.length) {
          this.state.subscriptionsList = (
            <div>
                <BraintreePaymentMethodForm
                  clientToken={this.state.clientToken}
                  createCustomer={this.onCreateCustomer}
                  getEntities={this.props.getEntities}
                  profile={this.props.profile}
                  total_amount={this.props.total_amount}
                />
            </div>
          )
      } else {
          this.state.subscriptionsList = (this.state.subscriptions.map((subscription) => {
            return this.renderSubscription(subscription);
          }))

          this.state.subscriptionsList = (
              <div>
                  <Table>
                    <thead>
                      <tr>
                        <th>Billing Type</th>
                        <th>Billing Info</th>
                        <th>Billing Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {this.state.subscriptionsList}
                    </tbody>

                  </Table>
                  <Button type="button" onClick={this.onDeleteSubscription}>Delete</Button>
              </div>

          )
      }

      return (
          <div>{this.state.subscriptionsList}</div>
      )
  }
}
