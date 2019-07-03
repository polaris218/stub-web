import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const createBraintreeCustomer = (payment_method_nonce) =>
  ajaxPromise({
    url: '/_braintree/subscription',
    type: 'POST',
    data: {'nonce': payment_method_nonce}
  }).catch((error) => {
    error_catch(error);
  });


export const getActiveSubscriptions = () =>
  ajaxPromise({
      url: '/_braintree/subscription'
  }).catch((error) => {
    error_catch(error);
  })


export const getClientToken = () =>
  ajaxPromise({
      url: '/_braintree/client_token'
  }).catch((error) => {
    error_catch(error);
  })

export const deleteActiveSubscription = (subscription_id) =>
  ajaxPromise({
      url: '/_braintree/subscription/' + subscription_id,
      method: 'DELETE'
  }).catch((error) => {
  error_catch(error);
  })

export const adminRemoveSubscription = (subscription) =>
  ajaxPromise({
    url: '/_braintree/subscription/' + subscription.subscription_id + '/' + subscription.owner,
    method: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  })

export const adminChangeSubscription = (subscription) =>
  ajaxPromise({
    url: '/_braintree/subscription/' + subscription.subscription_id,
    data: subscription,
    method: 'PUT'
  }).catch((error) => {
    error_catch(error);
  })

export const getAdminListTransactions = (subscription_id) =>
  ajaxPromise({
    url: '/_braintree/transactions'
  }).catch((error) => {
  error_catch(error);
  })

export const createTransaction = (subscription_id, amount) =>
  ajaxPromise({
    url: '/_braintree/transactions',
    method: 'POST',
    data: {'amount': amount,
           'subscription_id': subscription_id}
  }).catch((error) => {
    error_catch(error);
  })

export const removeTransaction = (transaction_id) =>
  ajaxPromise({
    url: '/_braintree/transactions/' + transaction_id,
    method: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  })
