import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import styles from './landing-navigation-alt.module.scss';

class LandingNavigation extends Component {
  componentDidMount() {
    const navigationElement = this.refs.navigaton;
    const offset = 100;
    let outOfOffset = false;

    $(window).on('scroll', () => {
      const scrollTop = $(window).scrollTop();

      if (scrollTop >= offset) {
        if (!outOfOffset) {
          outOfOffset = true;
          $(navigationElement).addClass(styles['navigation--fixed']);
        }
      } else {
        outOfOffset = false;
        $(navigationElement).removeClass(styles['navigation--fixed']);
      }
    });
  }

  openMenu() {
    $(this.refs.line).toggleClass(styles['navbar__hamburger-line--open']);
    $(this.refs.menu).toggleClass(styles['navbar__column-menu--open']);
  }

  renderNavigation(navigation) {
    return navigation.map((item) => {
      if (item.href) {
        return (
          <li key={item.href} className={styles['navbar__item']}>
            {item.target === '_blank' ?
              <a href={item.href} target="_blank"> { item.text } </a>
              :
              <Link to={item.href}> { item.text } </Link>
            }
          </li>
        );
      }
      if (item.modal) {
        return (
          <li key={item.href} className={styles['navbar__item']}>
            <a onClick={() => this.props.openSubscribeModal()}> { item.text } </a>
          </li>
        );
      }
    });
  }

  render() {
    const { data } = this.props;
    const navigation = data && data.navigation;
    const shopifyStyle = {
      marginTop: '-19px',
      marginLeft: '10px'
    };

    return (
      <section className={styles.navigation} ref="navigaton">
        <Grid className={styles['navigation__container']}>
          <div className={styles.navbar}>
            <div className={classNames(styles['navbar__column'], 'navbar__column--s')}>
                <span className={styles['navbar__brand']}>
                  <span className={styles['navbar__brand-logo']}>
                    <Link to="/">
                      <img className={styles['navbar__brand-image']} src="/images/logo.png" alt="Logo" />
                    </Link>
                  </span>
                </span>
            </div>
            <div className={styles['navbar__hamburger']} onClick={::this.openMenu}>
              <div className={styles['navbar__hamburger-line']} ref="line" />
            </div>
            <div className={classNames(styles['navbar__column'], styles['navbar__column-menu'])} ref="menu">
              <nav className={styles['navbar__box']}>
                <div className={styles['navbar__box-column']}>
                  <ul className={styles['navbar__items']}>
                    { this.renderNavigation(navigation) }
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </Grid>
      </section>
    );
  }
}

LandingNavigation.propTypes = {
  openSubscribeModal: PropTypes.func,
  data: PropTypes.object.isRequired
};

export default LandingNavigation;
