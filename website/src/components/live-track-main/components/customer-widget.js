import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './customer-widget.module.scss';

export default class CustomerWidget extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const { task } = this.props;
    return (
      <div id="customerWidget">
        {(task.customer_name || task.customer_address) && (task.customer_name !== '' || task.customer_address !== '') ?
          <div className={styles['customer-widget-container']}>
            <h4 className={styles['customer-widget-title']}>Customer</h4>
            <div>
              <h4 style={{ marginLeft: '5px' }}>{ task.customer_name }</h4>
              <div style={{ padding:'5px' }}>
                { task.customer_company_name ? <p className={styles['details-field']}> { task.customer_company_name } </p> : null }
                <p className={styles['details-field']}> { task.customer_address } </p>
                { task.customer_phone ? <p className={styles['details-field']}> { task.customer_phone } </p> : null }
                { task.customer_email ? <p className={styles['details-field']}> { task.customer_email } </p> : null }
              </div>
            </div>
          </div>
          :
          <div className={styles.customerDetailsEmptyMessage}>
            Customer details not found.
          </div>
        }
      </div>
    );
  }
}

CustomerWidget.propTypes = {
  task: PropTypes.object.isRequired
};
