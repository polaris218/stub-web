import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
//import Scrollchor from 'react-scrollchor';
import styles from './guide.module.scss';
import Waypoint from 'react-waypoint';
import classNames from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/fontawesome-free-regular';

const example = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Maecenas ac tincidunt erat, eget tristique nibh. Mauris laoreet,
  lorem eget porttitor lobortis, erat magna faucibus ligula, at aliquet enim justo id libero.
  Donec porta mi quis lorem volutpat, quis ornare ante tristique. Proin justo nunc,
  pretium id egestas vitae, tristique vel massa. Nam vel mattis arcu, sit amet iaculis
  libero. Vestibulum ac lorem at libero imperdiet congue in vel lectus. Integer quis risus
  faucibus, mattis massa malesuada, luctus sem. Aliquam velit nisi, venenatis et ante at,
  pulvinar mollis eros. Nunc ut urna sed lectus volutpat lacinia. Morbi faucibus mauris ut
  augue semper suscipit. Morbi elit eros, rutrum efficitur faucibus eget, luctus quis arcu.
  Cras urna neque, sodales ut vestibulum a, aliquet eu ipsum. Integer a enim ut risus lacinia
  cursus a convallis lectus.
  Integer varius nunc turpis, et fringilla sem ornare vel. Nunc id elit purus. Nunc sodales
  id nisi eget ultricies. Cras tristique fermentum semper. Nunc fermentum, eros vel
  venenatis ultrices, enim diam sagittis enim, in sodales metus augue vitae nibh. Cras
  et congue nisi. Donec at egestas arcu. Aliquam eget libero a nunc ullamcorper ullamcorper.

  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Maecenas ac tincidunt erat, eget tristique nibh. Mauris laoreet,
  lorem eget porttitor lobortis, erat magna faucibus ligula, at aliquet enim justo id libero.
  Donec porta mi quis lorem volutpat, quis ornare ante tristique. Proin justo nunc,
  pretium id egestas vitae, tristique vel massa. Nam vel mattis arcu, sit amet iaculis
  libero. Vestibulum ac lorem at libero imperdiet congue in vel lectus. Integer quis risus
  faucibus, mattis massa malesuada, luctus sem. Aliquam velit nisi, venenatis et ante at,
  pulvinar mollis eros. Nunc ut urna sed lectus volutpat lacinia. Morbi faucibus mauris ut
  augue semper suscipit. Morbi elit eros, rutrum efficitur faucibus eget, luctus quis arcu.
  Cras urna neque, sodales ut vestibulum a, aliquet eu ipsum. Integer a enim ut risus lacinia
  cursus a convallis lectus.
  Integer varius nunc turpis, et fringilla sem ornare vel. Nunc id elit purus. Nunc sodales
  id nisi eget ultricies. Cras tristique fermentum semper. Nunc fermentum, eros vel
  venenatis ultrices, enim diam sagittis enim, in sodales metus augue vitae nibh. Cras
  et congue nisi. Donec at egestas arcu. Aliquam eget libero a nunc ullamcorper ullamcorper.

  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Maecenas ac tincidunt erat, eget tristique nibh. Mauris laoreet,
  lorem eget porttitor lobortis, erat magna faucibus ligula, at aliquet enim justo id libero.
  Donec porta mi quis lorem volutpat, quis ornare ante tristique. Proin justo nunc,
  pretium id egestas vitae, tristique vel massa. Nam vel mattis arcu, sit amet iaculis
  libero. Vestibulum ac lorem at libero imperdiet congue in vel lectus. Integer quis risus
  faucibus, mattis massa malesuada, luctus sem. Aliquam velit nisi, venenatis et ante at,
  pulvinar mollis eros. Nunc ut urna sed lectus volutpat lacinia. Morbi faucibus mauris ut
  augue semper suscipit. Morbi elit eros, rutrum efficitur faucibus eget, luctus quis arcu.
  Cras urna neque, sodales ut vestibulum a, aliquet eu ipsum. Integer a enim ut risus lacinia
  cursus a convallis lectus.
  Integer varius nunc turpis, et fringilla sem ornare vel. Nunc id elit purus. Nunc sodales
  id nisi eget ultricies. Cras tristique fermentum semper. Nunc fermentum, eros vel
  venenatis ultrices, enim diam sagittis enim, in sodales metus augue vitae nibh. Cras
  et congue nisi. Donec at egestas arcu. Aliquam eget libero a nunc ullamcorper ullamcorper.

  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Maecenas ac tincidunt erat, eget tristique nibh. Mauris laoreet,
  lorem eget porttitor lobortis, erat magna faucibus ligula, at aliquet enim justo id libero.
  Donec porta mi quis lorem volutpat, quis ornare ante tristique. Proin justo nunc,
  pretium id egestas vitae, tristique vel massa. Nam vel mattis arcu, sit amet iaculis
  libero. Vestibulum ac lorem at libero imperdiet congue in vel lectus. Integer quis risus
  faucibus, mattis massa malesuada, luctus sem. Aliquam velit nisi, venenatis et ante at,
  pulvinar mollis eros. Nunc ut urna sed lectus volutpat lacinia. Morbi faucibus mauris ut
  augue semper suscipit. Morbi elit eros, rutrum efficitur faucibus eget, luctus quis arcu.
  Cras urna neque, sodales ut vestibulum a, aliquet eu ipsum. Integer a enim ut risus lacinia
  cursus a convallis lectus.
  Integer varius nunc turpis, et fringilla sem ornare vel. Nunc id elit purus. Nunc sodales
  id nisi eget ultricies. Cras tristique fermentum semper. Nunc fermentum, eros vel
  venenatis ultrices, enim diam sagittis enim, in sodales metus augue vitae nibh. Cras
  et congue nisi. Donec at egestas arcu. Aliquam eget libero a nunc ullamcorper ullamcorper.

  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Maecenas ac tincidunt erat, eget tristique nibh. Mauris laoreet,
  lorem eget porttitor lobortis, erat magna faucibus ligula, at aliquet enim justo id libero.
  Donec porta mi quis lorem volutpat, quis ornare ante tristique. Proin justo nunc,
  pretium id egestas vitae, tristique vel massa. Nam vel mattis arcu, sit amet iaculis
  libero. Vestibulum ac lorem at libero imperdiet congue in vel lectus. Integer quis risus
  faucibus, mattis massa malesuada, luctus sem. Aliquam velit nisi, venenatis et ante at,
  pulvinar mollis eros. Nunc ut urna sed lectus volutpat lacinia. Morbi faucibus mauris ut
  augue semper suscipit. Morbi elit eros, rutrum efficitur faucibus eget, luctus quis arcu.
  Cras urna neque, sodales ut vestibulum a, aliquet eu ipsum. Integer a enim ut risus lacinia
  cursus a convallis lectus.
  Integer varius nunc turpis, et fringilla sem ornare vel. Nunc id elit purus. Nunc sodales
  id nisi eget ultricies. Cras tristique fermentum semper. Nunc fermentum, eros vel
  venenatis ultrices, enim diam sagittis enim, in sodales metus augue vitae nibh. Cras
  et congue nisi. Donec at egestas arcu. Aliquam eget libero a nunc ullamcorper ullamcorper.
`;

/*
export default class Guide extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.wayPointIn = this.wayPointIn.bind(this);
    this.wayPointOut = this.wayPointOut.bind(this);
  }

  wayPointIn(url) {
    this.setState({ [url]: true });
  }

  wayPointOut(url) {
    this.setState({ [url]: false });
  }

  render() {
    return (
      <div>
        <div className={styles.guideBanner}>
          <h2>Guide</h2>
          <h3>This is a guide</h3>
        </div>
        <Row>
          <Col md={8} sm={8} xs={12}>
            <section id="takeaways">
              <Waypoint
                onEnter={() => this.wayPointIn('takeaways')}
                onLeave={() => this.wayPointOut('takeaways')}
              />
              <div className={styles.title}>Getting started for new users</div>
              <p>Welcome aboard! We've put together this guide to help you get started.</p>
              <div className={styles.takeaway}>
                <h3>Takeaways</h3>
                <hr/>
                <div className={styles.tkitem}>
                  <div className={styles.tkicon}>
                    <FontAwesomeIcon icon={faCheckSquare} color="#25ab95" />
                  </div>
                  <div className={styles.tkText}>
                    Welcome aboard! We've put together this guide to help you get started. Welcome aboard! We've put together this guide to help you get started.
                  </div>
                </div>
                <div className={styles.tkitem}>
                  <div className={styles.tkicon}>
                    <FontAwesomeIcon icon={faCheckSquare} color="#25ab95" />
                  </div>
                  <div className={styles.tkText}>
                    Welcome aboard! We've put together this guide to help you get started. Welcome aboard! We've put together this guide to help you get started.
                  </div>
                </div>
                <div className={styles.tkitem}>
                  <div className={styles.tkicon}>
                    <FontAwesomeIcon icon={faCheckSquare} color="#25ab95" />
                  </div>
                  <div className={styles.tkText}>
                    Welcome aboard! We've put together this guide to help you get started. Welcome aboard! We've put together this guide to help you get started.
                  </div>
                </div>
                <div className={styles.tkitem}>
                  <div className={styles.tkicon}>
                    <FontAwesomeIcon icon={faCheckSquare} color="#25ab95" />
                  </div>
                  <div className={styles.tkText}>
                    Welcome aboard! We've put together this guide to help you get started. Welcome aboard! We've put together this guide to help you get started.
                  </div>
                </div>
                <div className={styles.tkitem}>
                  <div className={styles.tkicon}>
                    <FontAwesomeIcon icon={faCheckSquare} color="#25ab95" />
                  </div>
                  <div className={styles.tkText}>
                    Welcome aboard! We've put together this guide to help you get started. Welcome aboard! We've put together this guide to help you get started.
                  </div>
                </div>
              </div>
            </section>
            <hr/>
            <section id="example-2">
              <Waypoint
                onEnter={() => this.wayPointIn('example-2')}
                onLeave={() => this.wayPointOut('example-2')}
              />
              <div className={styles.title}>
                Example 2
              </div>
              {example}
            </section>
            <hr/>
            <section id="example-3">
              <Waypoint
                onEnter={() => this.wayPointIn('example-3')}
                onLeave={() => this.wayPointOut('example-3')}
              />
              <div className={styles.title}>
                Example 3
              </div>
              {example}
            </section>
          </Col>
          <Col xsHidden sm={4} md={4}>
            <div className={styles.links}>
              <Scrollchor
                to="takeaways"
                className={classNames(styles.linkItem, {
                  [styles.activeLink]: this.state.takeaways
                })}
              >
                Example 1
              </Scrollchor>
              <Scrollchor
                to="example-2"
                className={classNames(styles.linkItem, {
                  [styles.activeLink]: this.state['example-2']
                })}
              >
                Example 2
              </Scrollchor>
              <Scrollchor
                to="example-3"
                className={classNames(styles.linkItem, {
                  [styles.activeLink]: this.state['example-3']
                })}
              >
                Example 3
              </Scrollchor>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}


  Guide.propTypes = {
    createEntity: PropTypes.func.isRequired,
    sendingEntity: PropTypes.bool.isRequired
  };
*/
