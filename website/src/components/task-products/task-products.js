import React, { Component } from 'react';
import styles from './task-products.module.scss';
import PropTypes from "prop-types";
import Carousel from 'nuka-carousel';
import { Row, Col, Grid } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faChevronCircleRight, faChevronCircleLeft, faDotCircle} from '@fortawesome/fontawesome-free-solid';
import { faDotCircle as faDotCircleRegular} from '@fortawesome/fontawesome-free-regular';
import cx from 'classnames';
import {faCaretRight} from "@fortawesome/fontawesome-free-solid/index";

export default class TaskProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      slideIndex: 0,
      slidesToShow: window.innerWidth > 768 ? (this.props.slidesToShow ? this.props.slidesToShow : 3) : ((window.innerWidth <= 768 && window.innerWidth > 520) ? 2 : 1),
      slidesToScroll: window.innerWidth > 768 ? (this.props.slidesToScroll ? this.props.slidesToScroll :3) : ((window.innerWidth <= 768 && window.innerWidth > 520) ? 2 : 1),
      products: this.props.products,
    };

    this.renderSingleSlide = this.renderSingleSlide.bind(this);
    this.slideNext = this.slideNext.bind(this);
    this.slidePrevious = this.slidePrevious.bind(this);
    this.slideToSelected = this.slideToSelected.bind(this);
    this.updateSlidesScroll = this.updateSlidesScroll.bind(this);
    this.slideProductExceptionItem = this.slideProductExceptionItem.bind(this);
    this.setProductState = this.setProductState.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateSlidesScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateSlidesScroll);
  }

  setProductState(products) {
    const updatedProducts = products;
    if (this.state.products) {
      updatedProducts.map((product) => {
        let foundProduct = this.state.products.find((prod) => {
          return prod.id === product.id && prod.type === product.type;
        });
        if (product.exception && foundProduct && foundProduct.exception) {
          product.exception.slideToShow = foundProduct.exception.slideToShow;
        }
      });
    }
    this.setState({
      products: updatedProducts,
    })
  }

  slideProductExceptionItem(product, slideIndex) {
    if (product.exception) {
      product.exception.slideToShow = slideIndex
    }
    let products = this.state.products;
    let index = products.map((prod) => {
      return prod;
    }).indexOf(product.id);
    products[index] = product;
    this.setState({products});
  }

  updateSlidesScroll() {
    if ((this.state.slidesToShow !== 1 || this.state.slidesToScroll !== 1) && window.innerWidth <= 520) {
      this.setState({
        slidesToShow: 1,
        slidesToScroll: 1
      })
    } else if ((this.state.slidesToShow !== 2 || this.state.slidesToScroll !== 2) && (window.innerWidth > 520 && window.innerWidth <= 768)) {
      this.setState({
        slidesToShow: 2,
        slidesToScroll: 2
      })
    }  else if ((this.state.slidesToShow < (this.props.slidesToShow ? this.props.slidesToShow : 3) || this.state.slidesToScroll < (this.props.slidesToScroll ? this.props.slidesToScroll : 3)) && window.innerWidth > 768) {
      this.setState({
        slidesToShow: this.props.slidesToShow ? this.props.slidesToShow : 3,
        slidesToScroll: this.props.slidesToScroll ? this.props.slidesToScroll :3
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.products) {
      this.setProductState(nextProps.products);
    }
  }

  slideNext() {
    const currentSlide = this.state.slideIndex;
    const slidesToScroll = this.state.slidesToScroll;
    const products = this.state.products;
    const totalPages = Math.ceil((products.length) / slidesToScroll);
    this.setState({
      slideIndex: currentSlide < ((totalPages -1) * slidesToScroll) ? (currentSlide + slidesToScroll) : currentSlide
    });
  }

  slidePrevious() {
    const slidesToScroll = this.state.slidesToScroll;
    const currentSlide = this.state.slideIndex;
    this.setState({
      slideIndex: currentSlide > 0 ? (currentSlide - slidesToScroll) : currentSlide
    });
  }

  slideToSelected(slideIndex) {
    this.setState({
      slideIndex
    });
  }

  renderSingleSlide(product) {
    let productStatusClass = '';
    let productStatus = '';
    if (product.status && product.status.toUpperCase() === 'DELIVERED') {
      productStatusClass = styles.acceptedClass;
      productStatus = 'DELIVERED';
    } else if (product.status && product.status.toUpperCase() === 'EXCEPTION') {
      productStatusClass = styles.rejectedClass;
      productStatus = 'EXCEPTION';
    } else if (product.status && product.status.toUpperCase() === 'PICKED_UP') {
      productStatusClass = styles.pickedUpClass;
      productStatus = 'PICKED UP';
    }

    let productTypeClass = '';
    let productType = '';
    if (product.type && product.type.toUpperCase() === 'DELIVERY') {
      productTypeClass = styles.acceptedClass;
      productType = 'Delivery'
    } else if (product.type && product.type.toUpperCase() === 'PICKUP') {
      productTypeClass = styles.pickedUpClass;
      productType = 'Pickup'
    }

    let imagePath = "/images/empty-image-placeholder.png";
    if (product.image_path) {
      imagePath = product.image_path;
    }

    return(
        <Grid className={this.props.showProductsType ? styles.slidesConatainer : styles.slideContainer}>
          <Row>
            <Col lg={(this.props.page && (this.props.page === 'taskStatus' || this.props.page === 'rh'|| this.props.page === 'liveTrack')) ? 12 : 6} md={(this.props.page && (this.props.page === 'taskStatus' || this.props.page === 'rh'|| this.props.page === 'liveTrack')) ? 6 : 12} sm={12} className={(this.props.page && this.props.page === 'rh'|| this.props.page === 'liveTrack') ? styles.itemImageContainerOnLiveTrack : styles.itemImageContainer}>
              <a onClick={()=> window.open(imagePath, "_blank")} href={imagePath} target="_blank"><img onLoad={() => {window.dispatchEvent(new Event('resize'));}} src={imagePath} alt={product.name}/></a>
            </Col>
            <Col lg={(this.props.page && (this.props.page === 'taskStatus' || this.props.page === 'rh'|| this.props.page === 'liveTrack')) ? 12 : 6} md={(this.props.page && (this.props.page === 'taskStatus' || this.props.page === 'rh'|| this.props.page === 'liveTrack')) ? 6 : 12} sm={12}>
              {this.props.showProductsType && product.type && product.type.toUpperCase() !== 'UNKNOWN' && <b className={productTypeClass}>{productType}</b>}
              <h4>{product.name}</h4>
              {this.props.showProductStatus && product.status && product.status.toUpperCase() !== 'UNKNOWN' && <b className={productStatusClass}>{productStatus}</b>}
              {this.props.showExceptions && product.exception && product.status.toUpperCase() === 'EXCEPTION' &&
              <div className={styles.exceptionReasonsMain}><FontAwesomeIcon icon={faCaretRight} className={styles.rightCaret} />
                {product.exception && <div><ul className={styles.exceptionReasons}>
                  <li>{product.exception.message_tier_1}</li>
                  <li>{product.exception.message_tier_2}</li>
                  {product.exception.notes && <li>Notes: {product.exception.notes}</li>}
                </ul>
                  {product.exception.files && product.exception.files.length > 0 && <Carousel
                  slidesToShow={1}
                  dragging={false}
                  slidesToScroll={1}
                  slideIndex={product.exception.slideToShow ? product.exception.slideToShow : 0}
                  className={cx(styles.exceptionSlider, (!this.props.page || this.props.page !== 'rh') ? styles.sliderDotsContainer : '' )}
                  heightMode="max"
                  renderCenterRightControls={(!product.exception.files || (product.exception.files.length <= 1)) ? false :() => (
                    <span onClick={() => {this.slideProductExceptionItem(product, product.exception.slideToShow ? product.exception.slideToShow + 1 : 1)}}
                          className={cx((product.exception.slideToShow ? (product.exception.slideToShow < product.exception.files.length - 1 ? styles.slideButtons : styles.slideButtonsDisabled) : (product.exception.files.length > 1 ? styles.slideButtons : styles.slideButtonsDisabled)), styles.rightArrow)}><FontAwesomeIcon icon={faChevronCircleRight} /></span>
                  )}
                  renderBottomCenterControls={false}
                  renderCenterLeftControls={(!product.exception.files || (product.exception.files.length <= 1)) ? false : () => (
                    <span onClick={() => {this.slideProductExceptionItem(product, product.exception.slideToShow && product.exception.slideToShow - 1)}}
                          className={cx((product.exception.slideToShow ? (product.exception.slideToShow > 0 ? styles.slideButtons : styles.slideButtonsDisabled) : (styles.slideButtonsDisabled)), styles.leftArrow)}><FontAwesomeIcon icon={faChevronCircleLeft} /></span>
                  )}
                  >
                  {product.exception.files.map((file) => {
                    return (<a className={styles.exceptionFiles} onClick={()=> window.open(file.file_path, "_blank")} href={file.file_path} target="_blank"><img onLoad={() => {window.dispatchEvent(new Event('resize'));}} src={file.file_path} alt={file.filename}/></a>)
                  })}
                </Carousel>}
                </div>
                }
              </div>
              }
              {product.description && <p>{this.props.showFullDetails ? product.description : ((product.description.length > 35) ? product.description.substr(0, 35) + '...' : product.description)}</p>}
              {product.subtotal && <p>{this.props.showFullDetails ? 'Sub Total: ' + product.subtotal : ''}</p>}
            </Col>
          </Row>
        </Grid>
    );
  }

  render() {
    const products = this.state.products;
    const slidesToScroll = this.state.slidesToScroll;
    const totalPages = products && Math.ceil((products.length) / slidesToScroll);
    const slideIndex = this.state.slideIndex;
    const bottomSliderButtons = [];
    const rhClass = (this.props.page && (this.props.page === 'rh' || this.props.page === 'liveTrack')) ? styles["rh-page-color"] : "";
    for (let i = 0; i < totalPages; i++) {
      bottomSliderButtons.push(<li onClick={() => this.slideToSelected(i * slidesToScroll)} className={rhClass}><FontAwesomeIcon icon={(slideIndex === i * slidesToScroll) ? faDotCircle : faDotCircleRegular} /></li>)
    }
    return (
      <Carousel
        slidesToShow={this.state.slidesToShow}
        dragging={false}
        slidesToScroll={this.state.slidesToScroll}
        slideIndex={this.state.slideIndex}
        className={cx(styles.slider, (!this.props.page || this.props.page !== 'rh') ? styles.sliderDotsContainer : '' )}
        heightMode="max"
        renderCenterRightControls={(!products || (products.length <= this.state.slidesToShow)) ? false :() => (
          <span onClick={this.slideNext} className={(slideIndex < (totalPages - 1) * slidesToScroll) ? cx(styles.slideButtons, rhClass) : cx(styles.slideButtonsDisabled, rhClass)}><FontAwesomeIcon icon={faChevronCircleRight} /></span>
        )}
        renderBottomCenterControls={(!products || (products.length <= this.state.slidesToShow)) ? false : () => (
          <ul className={styles.sliderDots}>
            {bottomSliderButtons.map((bottomSliderButton) => {
              return (bottomSliderButton);
            })}
          </ul>
          )}
        renderCenterLeftControls={(!products || (products.length <= this.state.slidesToShow)) ? false : () => (
          <span onClick={this.slidePrevious} className={slideIndex > 0 ? cx(styles.slideButtons, rhClass) : cx(styles.slideButtonsDisabled, rhClass)}><FontAwesomeIcon icon={faChevronCircleLeft} /></span>
        )}>
        {products && products.map((product) => {
          return(this.renderSingleSlide(product))
        })
        }
      </Carousel>
    );
  }
};

TaskProducts.propTypes = {
  slidesToShow: PropTypes.number,
  slidesToScroll: PropTypes.number,
  products: PropTypes.array,
  page: PropTypes.string,
  showProductStatus: PropTypes.bool,
  showFullDetails: PropTypes.bool
};
