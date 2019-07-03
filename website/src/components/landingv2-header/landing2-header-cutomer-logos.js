import React, { Component } from 'react';

import { Grid } from 'react-bootstrap';
import styles from './landing2-header-customer-logos.module.scss';

export default class Landingv2HeaderCustomerLogos extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
  }

  render() {
    const {data} = this.props;
    const dataItem = data["headerTexts"];

    return (
      <div>
        <div className={styles['header-customer-section']}>
          <Grid className={styles['form-grid']}>
            <p>{dataItem["cusomter_intro_text"]}</p>
            <div className={styles['customer_icon_section']}>
              <div><img src='/images/customer_logos/image_1.png' /></div>
              <div><img src='/images/customer_logos/image_2.png' /></div>
              <div><img src='/images/customer_logos/image_3.png' /></div>
              <div><img src='/images/customer_logos/image_4.png' /></div>
            </div>
          </Grid>
        </div>
        <div className={styles['header-bottom']}>
          <Grid className={ styles['form-grid'] }>
          <div className= {styles['header-bottom-title']}><p>{dataItem["header_bottom_title"]}</p></div>
            {/*<ul className={styles['header-bottom-ul']}>
               {this.renderHeaderBottom(data["header-bottom-part-1"])}
             </ul>*/}
          </Grid>
        </div>
      </div>
    )
  }
}