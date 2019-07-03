import React, { Component } from 'react';
import { Col, Button, Panel } from 'react-bootstrap';
import styles from './plan-column.module.scss';
import { Link } from 'react-router-dom'

export default class PlanColumn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true
    }
  }

	toggle() {
    const expanded = this.state.expanded;
		this.setState({
      expanded: !expanded
		});
	}

	render() {
		const { features, button, description, name, price, discount, discount_date, primary, color, link, new_window } = this.props.plan;
		let [featuresHeading, ...items] = features;
    let currentPrice = price;
		if (discount !== '') {
    	currentPrice = price * (1 - discount / 100);
		}

		return (
			<Col sm={12} lg={ 6 } className={ styles['column'] }>
				<div className={ styles['plan-wrapper'] }>
					<div className={ styles.plan } data-primary={ primary }>
						{/* primary && <div className={ styles['plan-primary'] } style={ { backgroundColor: color } }><span>Most popular</span></div> */}
						<h2 className={ styles['plan-name'] }>{ name }</h2>
						<div className={ styles['plan-description'] }><p>{ description }</p></div>
						{ primary &&
  						<div className={ styles['plan-price'] }>
  							<div>
			                  <p>
			                    { discount !== '' && <span className={styles.totalPrice}>${ price }</span> }
			    								<span className={styles.discountedPrice}>${ currentPrice } per user/month</span>
			                  </p>
			  							</div>
			  							<div>
			                  <p>
			                    { discount_date !== '' && <span className={styles.discountPitch}>{ discount }% discount till { discount_date }</span> }
			                  </p>
  							</div>
  						</div>
						}
						{ primary && <div>
  							<p className={styles.idealPlan}>Ideal for businesses doing less than 500 tasks per month</p>
  						</div> }
						<div className={ styles['plan-button'] }>
							{new_window
								?
                <a href={ link } target='_blank'>
                  <Button style={ { backgroundColor: color } } bsSize="large" block>{ button }</Button>
                </a>
								:
                <Link to={ link }>
                  <Button style={ { backgroundColor: color } } bsSize="large" block>{ button }</Button>
                </Link>
							}
						</div>
					</div>
				</div>
				<div className={ styles['toggle-features'] }>
					<a onClick={ () => this.toggle() }>
						<i className={ `fa fa-${!this.state.expanded ? 'plus' : 'minus'}-circle` }></i> See features
					</a>
				</div>
				<Panel id={"idx_panel_" + Math.random().toString(36).substr(2, 16)} collapsible expanded={ this.state.expanded } className={ styles['features-panel'] }>
					<Panel.Collapse>
            <div className={ styles.features }>
              <div className={ styles['features-heading'] }>{ featuresHeading }</div>
              <ul className={ `${styles.features} fa-ul` }>
                { items.map(item => <li><i className="fa-li fa fa-check"></i> { item }</li>) }
              </ul>
            </div>
          </Panel.Collapse>
				</Panel>

				<div className={ styles.features }>
					<div className={ styles['features-heading'] }>{ featuresHeading }</div>
					<ul className={ `${styles.features} fa-ul` }>
						{ items.map(item => <li><i className="fa-li fa fa-check"></i> { item }</li>) }
					</ul>
				</div>

			</Col>
		);
	}

}
