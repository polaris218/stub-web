import React, {Component} from 'react';
import styles from './landings-pages.module.scss';
import { Footer2v } from '../../components';

import { Footer3v }  from '../../components/index';
import landingPageDataTryGetBook from '../../landingv2-data.json';

import {subscribe} from '../../actions/subscribe';
import {Grid, Button, Glyphicon, Modal, Row, Col, Form, FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import landingPageData from '../../landingv2-data.json';

export default class TryGetBookPage extends Component {
  constructor(props, context) {
    super(props, context);
    this.getTheBook = this.getTheBook.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.downloadTheBook = this.downloadTheBook.bind(this);

    this.state = {
      form_data: {
        name: '',
        company: '',
        email: '',
        business: '',
        phone: ''
      },
      name_valid: true,
      company_valid:true,
      email_valid:true,
      business_valid:true,
      phone_valid:true,
      show_modal: false,
      show_errors:false
    };
  }

  getTheBook(e){
    e.preventDefault();
    let form_data = this.state.form_data,
        errors_fields = [],
        email_pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
        phone_pattern = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
    Object.keys(form_data).map( (key, index) => {
      switch (key){
        case 'email':
          if(form_data[key].length === 0 || !email_pattern.test(form_data[key])){
            this.setState({email_valid:false});
            errors_fields.push(key);
          }else{
            this.setState({email_valid:true});
          }
          break;
        case 'phone':
          if(form_data[key].length === 0 || !phone_pattern.test(form_data[key])){
            this.setState({phone_valid:false});
            errors_fields.push(key);
          }else{
            this.setState({email_valid:true});
          }
          break;
        case 'name':
          if(form_data[key].length < 1){
            this.setState({name_valid:false});
            errors_fields.push(key);
          }else{
            this.setState({name_valid:true});
          }
          break;
        case 'company':
          if(form_data[key].length < 1){
            this.setState({company_valid:false});
            errors_fields.push(key);
          }else{
            this.setState({company_valid:true});
          }
          break;
        case 'business':
          if(form_data[key].length < 1){
            this.setState({business_valid:false});
            errors_fields.push(key);
          } else{
            this.setState({business_valid:true});
          }
          break;
      }
    });
    if(errors_fields.length > 0){
      this.setState({show_errors:true});
    }else{
      this.setState({show_errors:false});
      subscribe({fullname: form_data.name, email: form_data.email, type:form_data.business, phone: form_data.phone,
        details: 'details empty', company: form_data.company});
      this.showModal();
    }
  }

  showModal(e){
    this.setState({showModal:true});
  }

  closeModal(){
    this.setState({showModal:false});
  }

  downloadTheBook(e){
    e.preventDefault();
    window.open(e.target.href);
  }

  handleInputChange(e){
    let new_form_data = Object.assign({}, this.state.form_data);
    new_form_data[e.target.name] = e.target.value;
    this.setState({form_data: new_form_data});
  }

  render() {
    let have_errors = this.state.show_errors;

    return (
      <div className={styles['full-height']}>
        <div className={styles['page-wrap']}>
          <div className={styles['b-order-book']}>
            <div className={styles['container']}>
              <div className={styles['logo']}>
                <a href="/"><img src="/images/lending/try-pages/461581c3-logo-white_05l01s05k01r000000.png"/></a>
              </div>
              <div style={{marginTop: '80px'}}>
                <h1>CUSTOMER REVIEWS: THE SECRET SAUCE</h1>
                <p>Arrivy makes home service businesses more profitable and their customers happier by
                  automating coordination and communications</p>
                <Row className={styles['book-cover'] + ' ' + (!have_errors ? '' : styles['have_errors'])}>
                  <Col xs={12} sm={5}>
                    <img src="/images/lending/try-pages/b483f629-book-1-01-copy_0bi0fk0bi0fk000000.png"/>
                  </Col>
                  <Col xs={12} sm={7}>
                    <h2>Get your free copy.</h2>
                    <div className={styles['error-block']} >
                      <ul>
                        {!this.state.name_valid &&(
                          <li>Name is required</li>
                        )}
                        {!this.state.email_valid &&(
                          <li>Valid email address is required</li>
                        )}
                        {!this.state.phone_valid &&(
                          <li>Valid phone number is required</li>
                        )}
                        {!this.state.company_valid &&(
                          <li>Company name is required</li>
                        )}
                        {!this.state.business_valid &&(
                          <li>Business type is required</li>
                        )}
                      </ul>
                    </div>
                    <Form onSubmit={this.getTheBook}>
                      <FormGroup>
                        <Col componentClass={ControlLabel} sm={4}>Name*</Col>
                        <Col sm={8}>
                          <FormControl className={styles[(this.state.name_valid ? "valid" : "error")]} name="name" type="text" value={this.state.name} onChange={(e) => this.handleInputChange(e)}/>
                        </Col>
                      </FormGroup>
                      <FormGroup>
                        <Col componentClass={ControlLabel} sm={4}>Company*</Col>
                        <Col sm={8}>
                          <FormControl className={styles[(this.state.company_valid ? "valid" : "error")]} name="company" type="text" value={this.state.company} onChange={(e) => this.handleInputChange(e)}/>
                        </Col>
                      </FormGroup>
                      <FormGroup>
                        <Col componentClass={ControlLabel} sm={4}>Email*</Col>
                        <Col sm={8}>
                          <FormControl className={styles[(this.state.email_valid ? "valid" : "error")]} name="email" type="text" value={this.state.email} onChange={(e) => this.handleInputChange(e)}/>
                        </Col>
                      </FormGroup>
                      <FormGroup>
                        <Col componentClass={ControlLabel} sm={4}>Business type*</Col>
                        <Col sm={8}>
                          <FormControl className={styles[(this.state.business_valid ? "valid" : "error")]} name="business" type="text" value={this.state.business} onChange={(e) => this.handleInputChange(e)}/>
                        </Col>
                      </FormGroup>
                      <FormGroup>
                        <Col componentClass={ControlLabel} sm={4}>Phone Number*</Col>
                        <Col sm={8}>
                          <FormControl className={styles[(this.state.phone_valid ? "valid" : "error")]} name="phone" type="text" value={this.state.phone} onChange={(e) => this.handleInputChange(e)}/>
                        </Col>
                      </FormGroup>
                      <FormGroup>
                        <Col smOffset={4} sm={8}>
                          <button value='Submit'>Get the book</button>
                        </Col>
                      </FormGroup>
                    </Form>
                    <p className={styles['small']}>We will never sell your email address to any 3rd party or send you
                      nasty spam.</p>
                  </Col>
                </Row>
              </div>
            </div>
          </div>

          <div className={styles['b-white-part']}>
            <div className={styles['container']}>
              <h2>WHAT DRIVES GOOD REVIEWS?</h2>
              <div className={styles['text=part']}>
                <img src="/images/lending/try-pages/6b794cb5-startup-photos_06f06f06f06e002002.jpg"/>
                <p>For home service businesses like plumbers, garage door installation companies, movers and
                  housecleaners, success or failure is often measured by number of YELP reviews. YELP, and to a lesser
                  extent—Facebook, Angies List and Google—have become a proxy for walking over to your neighbor’s house
                  andasking, “Can you recommend a good gardener?”</p>
                <p>But, what are the elements that drive good reviews? It’s not just good service… You need to think
                  about how to differentiate your business—both in your marketing and in your services.</p>
              </div>
            </div>
          </div>

          <div className={styles['b-blue-part']}>
            <div className={styles['container']}>
              <div className={styles['image-cont']}>
                <img src="/images/lending/try-pages/b1938101-devices_0ee05x0ee05x000000.png"/>
              </div>
              <div className={styles['text-part']}>
                <p>DOWNLOAD THE ARRIVY WHITE PAPER TO LEARN ABOUT DRIVING YOUR COMPETITIVE ADVANTAGE
                  THROUGH CUSTOMER ENGAGEMENT.</p>
              </div>
            </div>
          </div>

          <Footer3v data={landingPageDataTryGetBook} />
        </div>
        <Modal className={styles['modal']} show={this.state.showModal} onHide={this.closeModal} bsSize="small">
          <Modal.Header closeButton>
            <Modal.Title>Thank You!</Modal.Title>
          </Modal.Header>
          <Modal.Body className={styles['modal-body']}>
            <p>Your form has been submitted.</p>
            <div>
              <a onClick={(e) => this.downloadTheBook(e)} href="/external-content/arrivy-whitepaper.pdf">
                Please download the whitepaper from this location
              </a>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
