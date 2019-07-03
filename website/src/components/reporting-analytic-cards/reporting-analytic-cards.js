import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './reporting-analytic-cards.module.scss';
import { Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { format_number } from '../../helpers/reporting';

export default class ReportingAnalyticsCards extends Component {
  constructor(props) {
    super(props);

    this.renderCards = this.renderCards.bind(this);
  }

  renderCards() {
    let renderedCards = null;
    if (this.props && this.props.cardsData && this.props.cardsData.length > 0) {
      renderedCards = this.props.cardsData.map((cardData) => {
        const tooltip = <Tooltip id="tooltip">{(cardData.tooltipText) ? cardData.tooltipText : null}</Tooltip>;
        return (
          <div>
            {cardData.tooltipText ?
              <OverlayTrigger placement="top" overlay={tooltip}>
                <Col md={this.props.singleCardWidth} xs={12} className={styles.customColumnPadding}
                  style={{ paddingBottom: (!this.props.isTime) ? '15px' : '0px' }}>
                  <div className={cx(styles.reportingBlock, styles.block)}
                    style={{ border: '1px solid ' + cardData.color, backgroundColor: cardData.color + '' }}>
                  <span>
                    <FontAwesomeIcon icon={cardData.icon}/>
                  </span>
                    <span className={styles.countValue}>
                    {format_number(cardData.value, 2)}
                  </span>
                    <span className={styles.countCounter}>
                    {cardData.title}
                      {this.props.isTime &&
                      <small>(In HOURS)</small>
                      }
                  </span>
                  </div>
                </Col>
              </OverlayTrigger>
              :
              <Col md={this.props.singleCardWidth} xs={12} className={styles.customColumnPadding}
                style={{ paddingBottom: (!this.props.isTime) ? '15px' : '0px' }}>
                <div className={cx(styles.reportingBlock, styles.block)}
                  style={{ border: '1px solid ' + cardData.color, backgroundColor: cardData.color + '' }}>
                  <span>
                    <FontAwesomeIcon icon={cardData.icon}/>
                  </span>
                  <span className={styles.countValue}>
                    {format_number(cardData.value, 2)}
                  </span>
                      <span className={styles.countCounter}>
                    {cardData.title}
                        {this.props.isTime &&
                        <small>(In HOURS)</small>
                        }
                  </span>
                </div>
              </Col>
            }
          </div>
        );
      });
    }
    return renderedCards;
  }

  render() {
    return (
      <div>
        {
          this.renderCards()
        }
      </div>
    );
  }
}

ReportingAnalyticsCards.propTypes = {
  cardsData: PropTypes.array,
  singleCardWidth: PropTypes.number,
  isTime: PropTypes.bool
};
