import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './text-component.module.scss';
import { Col } from 'react-bootstrap';

export default class TextComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section id={this.props.data.id} className={styles.textComponentContainer}>
        {this.props.data &&
          <Col md={12}>
            {this.props.data.title && this.props.data.title !== '' &&
              <h1>
                {this.props.data.title}
              </h1>
            }
            <p>
              {this.props.data.content}
            </p>
          </Col>
        }
      </section>
    );
  }
}

TextComponent.propTypes = {
  data: PropTypes.object
};
