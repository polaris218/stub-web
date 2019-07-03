import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const getCustomers = (page = 1, per_page = 200) =>
  ajaxPromise({
    url: `/api/customers?page=${page}&items_per_page=${per_page}`,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });

export const searchCustomers = (searchText, page = 0, per_page = 200) =>
  ajaxPromise({
    url: `/api/customers/search?search=${searchText}&page=${page}&items_per_page=${per_page}`,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });

export const createCustomer = ({ first_name, last_name, company_name, email, phone, mobile_number, notes, address_line_1, address_line_2, city, state, country, zipcode, extra_fields, notifications, additional_addresses }) =>
  ajaxPromise({
    url: '/api/customers/new',
    type: 'POST',
    data: { first_name, last_name, company_name, email, phone, mobile_number, notes, address_line_1, address_line_2, city, state, country, zipcode, extra_fields, notifications , additional_addresses}
  }).catch((error) => {
    error_catch(error);
  });

export const deleteCustomer = (id) =>
  ajaxPromise({
    url: '/api/customers/' +  id,
    type: 'DELETE',
  }).catch((error) => {
    error_catch(error);
  });

export const updateCustomer = (customer) =>
  ajaxPromise({
    url: '/api/customers/' + customer.id,
    type: 'PUT',
    data: customer
  }).catch((error) => {
    error_catch(error);
  });
