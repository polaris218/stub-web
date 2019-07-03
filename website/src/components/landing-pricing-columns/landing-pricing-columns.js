import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Grid, Col } from 'react-bootstrap';
import styles from './landing-pricing-columns.module.scss';
import PlanColumn from './plan-column';

export default class LandingPricingColumns extends Component {

	static propTypes = {
		plans: PropTypes.array
	}

	render() {
		const { plans } = this.props;

		return (
			<section>
				<Grid className={styles['container']}>
					<Row className={styles['plans']}>
						<Col mdOffset={2} md={8} sm={12}>
							<Row>
								{ plans.map(plan => <PlanColumn plan={ plan } />) }
							</Row>
						</Col>
					</Row>
				</Grid>
			</section>
		)
	}
}
