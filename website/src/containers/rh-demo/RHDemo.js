import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl } from 'react-bootstrap';
import moment from 'moment';
import styles from './RHDemo.module.scss';
import { UserHeaderV2, SlimFooterV2, ActivityStream }  from '../../components';
import {
  getProfileInformation,
  getEntities,
  getTasks,
  postTask,
  deleteTask,
  getEquipments,
  getTemplates,
  report_entity_locations,
  setNewStatus,
  getCompanyProfileInformation
} from '../../actions';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { DefaultHelmet } from '../../helpers';
import history from '../../configureHistory';
import {error_catch} from '../../helpers/error_catch';

const demoTasksCustomerAddresses = [
  {
    "task_title": "Delivery Order 1",
    "address_line_1": "549 Magnolia Ave",
    "address_line_2": "",
    "city": "Larkspur",
    "state": "California",
    "country": "United States",
    "zipcode": 94939,
    "customer_first_name": "Marie",
    "customer_last_name": "Gallagher"
  },
  {
    "task_title": "Delivery Order 2",
    "address_line_1": "1495 Casa Buena Dr #401",
    "address_line_2": "",
    "city": "Corte Madera",
    "state": "California",
    "country": "United States",
    "zipcode": 94925,
    "customer_first_name": "Hazel",
    "customer_last_name": "Dryer"
  },
  {
    "task_title": "Delivery Order 3",
    "address_line_1": "50 Barbaree Way",
    "address_line_2": "",
    "city": "Tiburon",
    "state": "California",
    "country": "United States",
    "zipcode": 94920,
    "customer_first_name": "Valerie",
    "customer_last_name": "Anthony"
  },
  {
    "task_title": "Delivery Order 4",
    "address_line_1": "306 Strawberry Village",
    "address_line_2": "",
    "city": "Mill Valley",
    "state": "California",
    "country": "United States",
    "zipcode": 94941,
    "customer_first_name": "Marilyn",
    "customer_last_name": "Paris"
  },
  {
    "task_title": "Delivery Order 5",
    "address_line_1": "1 Hamilton Drive",
    "address_line_2": "",
    "city": "Mill Valley",
    "state": "California",
    "country": "United States",
    "zipcode": 94941,
    "customer_first_name": "Mary",
    "customer_last_name": "Jones"
  },
  {
    "task_title": "Delivery Order 6",
    "address_line_1": "4048 Sonoma Highway",
    "address_line_2": "",
    "city": "Napa",
    "state": "California",
    "country": "United States",
    "zipcode": 94559,
    "customer_first_name": "Patricia",
    "customer_last_name": "Brooks"
  },
  {
    "task_title": "Delivery Order 7",
    "address_line_1": "6296 Washington Street",
    "address_line_2": "",
    "city": "Napa",
    "state": "California",
    "country": "United States",
    "zipcode": 94558,
    "customer_first_name": "Jennifer",
    "customer_last_name": "Francisco"
  },
  {
    "task_title": "Delivery Order 8",
    "address_line_1": "6711 Washington Street",
    "address_line_2": "",
    "city": "Yountville",
    "state": "California",
    "country": "United States",
    "zipcode": 94599,
    "customer_first_name": "Joan",
    "customer_last_name": "Ellis"
  },
  {
    "task_title": "Delivery Order 9",
    "address_line_1": "3250 California 128",
    "address_line_2": "",
    "city": "Geyserville",
    "state": "California",
    "country": "United States",
    "zipcode": 95441,
    "customer_first_name": "Robert",
    "customer_last_name": "Stewart"
  },
  {
    "task_title": "Delivery Order 10",
    "address_line_1": "1801 East Cotati Avenue",
    "address_line_2": "",
    "city": "Rohnert Park",
    "state": "California",
    "country": "United States",
    "zipcode": 94928,
    "customer_first_name": "Daniel",
    "customer_last_name": "Wentworth"
  },
  {
    "task_title": "Delivery Order 11",
    "address_line_1": "745 Baywood Drive",
    "address_line_2": "",
    "city": "Petaluma",
    "state": "California",
    "country": "United States",
    "zipcode": 94954,
    "customer_first_name": "Louis",
    "customer_last_name": "Mendez"
  }
];

const demoTasks = [
  {
    "Title": "Delivery Order 1",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "8:30",
    "EndTime": "9:30",
    "Customer": "",
    "Team1": "Lois Villalpando",
    "Team2": "Eddie Weinberger",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Washer and dryer are extremely tight. Please use care when moving"
  },
  {
    "Title": "Delivery Order 2",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "9:30",
    "EndTime": "10:30",
    "Customer": "",
    "Team1": "Lois Villalpando",
    "Team2": "Eddie Weinberger",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "Delivery Order 3",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "10:30",
    "EndTime": "11:30",
    "Customer": "",
    "Team1": "Lois Villalpando",
    "Team2": "Eddie Weinberger",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "Delivery Order 4",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "11:30",
    "EndTime": "12:30",
    "Customer": "",
    "Team1": "Lois Villalpando",
    "Team2": "Eddie Weinberger",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Client will need to be away from the house for the majority of the move. In case of questions, they can be reached at the number in the Arrivy customer record"
  },
  {
    "Title": "Delivery Order 5",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "13:00",
    "EndTime": "14:00",
    "Customer": "",
    "Team1": "Lois Villalpando",
    "Team2": "Eddie Weinberger",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#FF6900",
    "Instructions": "There are 3 guitars that need to be moved in a humidity-controlled crate"
  },
  {
    "Title": "Delivery Order 6",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "8:30",
    "EndTime": "9:30",
    "Customer": "",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Scissors lift will be needed to access equipment from southwest bedroom"
  },
  {
    "Title": "Delivery Order 7",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "9:30",
    "EndTime": "10:30",
    "Customer": "",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "Delivery Order 8",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "10:30",
    "EndTime": "11:30",
    "Customer": "",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Client will need to be away from the house for the majority of the move. In case of questions, they can be reached at the number in the Arrivy customer record"
  },
  {
    "Title": "Delivery Order 9",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "13:00",
    "EndTime": "14:00",
    "Customer": "",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Use special crates for artwork in living room"
  },
  {
    "Title": "Delivery Order 10",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "14:00",
    "EndTime": "15:00",
    "Customer": "",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#FCB900",
    "Instructions": "There are 3 guitars that need to be moved in a humidity-controlled crate"
  },
  {
    "Title": "Delivery Order 11",
    "StartDate": "",
    "EndDate": "",
    "StartTime": "15:00",
    "EndTime": "16:00",
    "Customer": "",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#FCB900",
    "Instructions": "Use special crates for artwork in living room"
  }
];

const locationReports = [
  {
    "lat":38.004836,
    "lng":-122.545781
  },
  {
    "lat":38.001743,
    "lng":-122.53759
  },
  {
    "lat":37.989974,
    "lng":-122.529491
  },
  {
    "lat":37.978473,
    "lng":-122.520392
  },
  {
    "lat":37.966836,
    "lng":-122.518333
  },
  {
    "lat":37.955061,
    "lng":-122.508719
  },
  {
    "lat":37.941389,
    "lng":-122.515414
  },
  {
    "lat":37.937033,
    "lng":-122.535191
  }
];

const demoFiles = [
  {
    "task_title": "Delivery Order 1",
    "filename": "1-chair.jpg",
    "file_path":"/images/demo/rh/1-chair.jpg"
  },
  {
    "task_title": "Delivery Order 2",
    "filename": "6-sectional.jpg",
    "file_path":"/images/demo/rh/6-sectional.jpg"
  },
  {
    "task_title": "Delivery Order 3",
    "filename": "5-bed.jpg",
    "file_path":"/images/demo/rh/5-bed.jpg"
  },
  {
    "task_title": "Delivery Order 4",
    "filename": "2-dresser.jpg",
    "file_path":"/images/demo/rh/2-dresser.jpg"
  },
  {
    "task_title": "Delivery Order 5",
    "filename": "1-ottoman.jpg",
    "file_path":"/images/demo/rh/1-ottoman.jpg"
  },
  {
    "task_title": "Delivery Order 6",
    "filename": "2-bed.jpg",
    "file_path":"/images/demo/rh/2-bed.jpg"
  },
  {
    "task_title": "Delivery Order 7",
    "filename": "3-side-chair.jpg",
    "file_path":"/images/demo/rh/3-side-chair.jpg"
  },
  {
    "task_title": "Delivery Order 8",
    "filename": "3-arm-chair.jpg",
    "file_path":"/images/demo/rh/3-arm-chair.jpg"
  },
  {
    "task_title": "Delivery Order 9",
    "filename": "3-table.jpg",
    "file_path":"/images/demo/rh/3-table.jpg"
  },
  {
    "task_title": "Delivery Order 10",
    "filename": "4-sectional.jpg",
    "file_path":"/images/demo/rh/4-sectional.jpg"
  },
  {
    "task_title": "Delivery Order 11",
    "filename": "5-bed.jpg",
    "file_path":"/images/demo/rh/5-bed.jpg"
  },
];

export default class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);

    this.createNewTasks = this.createNewTasks.bind(this);
    this.deleteTasks = this.deleteTasks.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.lookup_entity = this.lookup_entity.bind(this);
    this.lookup_equipment = this.lookup_equipment.bind(this);
    this.sync_api_calls = this.sync_api_calls.bind(this);
    this.report_entity_locations = this.report_entity_locations.bind(this);
    this.report_entity_locations_rec = this.report_entity_locations_rec.bind(this);
    this.sleep = this.sleep.bind(this);
    this.reportStatuses = this.reportStatuses.bind(this);
    this.reportStatusInChain = this.reportStatusInChain.bind(this);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);

    this.state = {
      entities_loded: false,
      templates_loded: false,
      account_email :'',
      account_name : '',
      customer_info: {
        customer_name: '',
        customer_email: '',
        customer_phone: ''
      },
      companyProfile: null,
      internetIssue: undefined,
    };
  }

  componentWillMount() {
    getCompanyProfileInformation().then((res) => {
      let companyProfile = JSON.parse(res);
      this.setState({ companyProfile });
    }).catch((err) => {
      if(err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });

    getProfileInformation()
    .then((res) => {
      const profile = JSON.parse(res);
      let permissions = null;
      let is_company = false;
      let view_activity_stream = false;
      if (profile) {
        if (profile && profile.permissions) {
          permissions = profile.permissions
        }
        if (permissions && permissions.includes('COMPANY')) {
          is_company = true
        }
        if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
          view_activity_stream = true;
        }
      }
      this.setState({
        account_email: profile.email,
        account_name: profile.fullname,
        profile: profile,
        view_activity_stream
      });
      if (!profile || !profile.permissions || !(profile.permissions.includes('COMPANY') || profile.permissions.includes('ADMIN_TASKS'))) {
        history.push('/dashboard');
      }
    })
    .catch((error) => {
      error_catch(error);
    });
  }

  componentDidMount() {
    getEntities().then((res) => {
      const parsed_res = JSON.parse(res);
      this.setState({
        entities: parsed_res,
        entities_laoded: true
      });
    });

    getEquipments().then((res) => {
      const parsed_res = JSON.parse(res);
      this.setState({
        equipments: parsed_res
      });
    });

    getTemplates().then((res) => {
      const parsed_res = JSON.parse(res);
      const default_template = parsed_res.find((template) => {
        return template.is_default;
      });
      this.setState({
        default_template: default_template.id.toString(),
        templates_loded: true
      });
    });
  }

  createNewTasks() {
    let tasks = [];

    this.setState({
      serverCallText: 'Creating New Tasks',
      serverCallInProgress: true
    });

    demoTasks.map((demoTask) => {
      const start_date = moment();
      const end_date = moment();
      const start_time = demoTask.StartTime.split(':');
      const end_time = demoTask.EndTime.split(':');
      start_date.set('hour', parseInt(start_time[0]));
      start_date.set('minute', parseInt(start_time[1]));
      end_date.set('hour', parseInt(end_time[0]));
      end_date.set('minute', parseInt(end_time[1]));

      const task = {
        start_datetime: start_date.format(),
        end_datetime: end_date.format(),
        title: demoTask.Title
      };

      task.enable_time_window_display = true;
      task.time_window_start = 60;

      let entity_ids = '';


      task.details = demoTask.Instructions;
      task.extra_fields = JSON.stringify({
        task_color: demoTask.Color
      });

      if (demoTask.Team1 != 'NA') {
        const teamMember1 = this.lookup_entity(demoTask.Team1);
        if(teamMember1) {
          entity_ids = teamMember1.id.toString();
        }
      }

      if (demoTask.Team2 != 'NA') {
        const teamMember2 = this.lookup_entity(demoTask.Team2);
        if(teamMember2) {
          entity_ids = entity_ids + ', ' + teamMember2.id.toString();
        }
      }

      task.entity_ids = entity_ids;

      if (demoTask.Equip != 'NA') {
        const equipment = this.lookup_equipment(demoTask.Equip);
        if(equipment) {
          task.resource_ids = equipment.id.toString();
        }
      }

      task.template = this.state.default_template;

      demoTasksCustomerAddresses.map((customer_address) => {
        if (demoTask.Title === customer_address.task_title) {
          task.customer_first_name = customer_address.customer_first_name;
          task.customer_last_name = customer_address.customer_last_name;
          task.customer_address_line_1 = customer_address.address_line_1;
          task.customer_address_line_2 = customer_address.address_line_2;
          task.customer_city = customer_address.city;
          task.customer_state = customer_address.state;
          task.customer_country = customer_address.country;
          task.customer_zipcode = customer_address.zipcode;
        }
      });

      if (task.title === 'Delivery Order 1') {

        let infoAdded = false;
        if (this.state.customer_info.customer_name !== '') {
          task.customer_first_name = this.state.customer_info.customer_name;
          task.customer_last_name = '';
          infoAdded = true;
        }
        if (this.state.customer_info.customer_email !== '') {
          task.customer_email = this.state.customer_info.customer_email;
          infoAdded = true;
        }
        if (this.state.customer_info.customer_phone !== '') {
          task.customer_mobile_number = this.state.customer_info.customer_phone;
          infoAdded = true;
        }

        if (infoAdded) {
          task.title = task.title + ' - Customer Info Added';
        }
      }

      tasks.push(task);

    });

    this.sync_api_calls(0, tasks)
  }

  /*sync_api_calls(counter, tasks) {
    const total_tasks = tasks.length;
    if (counter <= total_tasks) {
      const promises = [];

      tasks.map((next_task) =>
        promises.push(postTask(next_task).then((res) => {
          console.log('Task Added');
          let resp = JSON.parse(res);
          next_task.id = resp.id;
        }).catch((error) => {
          console.log('An error occurred while adding a task')
        }))
      );

      Promise.all(promises).then((res) => {
        this.setState({
          tasks
        },() => this.reportStatusInChain(0));
      });
    }
  }*/

  sync_api_calls(counter, tasks) {
    const total_tasks = tasks.length;
    if (counter >= total_tasks) {
      this.setState({
          tasks
        },() => this.reportStatusInChain(0));
      return;
    }

    const next_task = tasks[counter];

    postTask(next_task).then((res) => {
      console.log('Task Added');
      let resp = JSON.parse(res);
      next_task.id = resp.id;

      this.setState({
        serverCallText: 'Creating New Tasks ' + (counter + 1)
      });

      setTimeout(()=>this.sync_api_calls(++counter, tasks), 1000);
    }).catch((error) => {
      console.log('An error occurred while adding a task')
      setTimeout(()=>this.sync_api_calls(++counter, tasks), 1000);
    });
  }


  reportStatuses(){
    const promises = [];

    this.state.tasks.map(task => {
      console.log(task.title);
      const task_id = task.id;
      const status = {
        type: 'CUSTOM',
        title: 'CUSTOM',
        time: moment().format(),
        reporter_name: this.state.profile.fullname,
        reporter_id: this.state.profile.owner
      };
      let status_files = {};
      demoFiles.map((file) => {
        if (task.title === file.task_title) {
          status_files.filename = file.filename;
          status_files.file_path = file.file_path;
        }
      });
      let files = [];
      files.push(status_files);
      let extra_fields = {
        'visible_to_customer': true,
        'notes': 'Product(s) to be delivered.',
        'files': files
      };
      status.extra_fields = JSON.stringify(extra_fields);
      status.source = 'web';
      setNewStatus({task_id, status}).then((res) => {
          console.log('New Status Reported');
        }).catch((res) => {
          console.log('Error occurred while reporting new status');
      });
    });

    Promise.all(promises).then((res) => {
      this.setState({
        serverCallText: 'All done',
        serverCallInProgress: false
      });
    });
  }

  reportStatusInChain(counter) {
    console.log('Hi');

    if (counter >= this.state.tasks.length) {
      this.setState({
        serverCallText: 'All done',
        serverCallInProgress: false
      });

      return;
    }

    this.setState({
      serverCallText: 'Uploading product images',
    });

    let task = this.state.tasks[counter];

    const task_id = task.id;

    if (task_id == 'undefined') {
      setTimeout(() => reportStatusInChain(++counter), 1000);
      return;
    }

    //HACK: Setting reporter_id as null doesn't send out the notification to the customer. This is intentionally done for the demo.
    const status = {
      type: 'CUSTOM',
      title: 'CUSTOM',
      time: moment().format(),
      reporter_name: this.state.profile.fullname,
      reporter_id: null
    };

    let status_files = {};
    demoFiles.map((file) => {
      if (task.title.indexOf(file.task_title) !== -1) {
        status_files.filename = file.filename;
        status_files.file_path = file.file_path;
      }
    });
    let files = [];
    files.push(status_files);
    let extra_fields = {
      'visible_to_customer': true,
      'notes': 'Product(s) to be delivered.',
      'files': files
    };
    status.extra_fields = JSON.stringify(extra_fields);
    status.source = 'web';

    const reportStatusInChain = this.reportStatusInChain;
    setNewStatus({task_id, status}).then((res) => {
        console.log('New Status Reported');
        setTimeout(() => reportStatusInChain(++counter), 1000);
      }).catch((res) => {
        console.log('Error occurred while reporting new status');
        setTimeout(() => reportStatusInChain(++counter), 1000);
    });

  }

  lookup_entity(entity_name) {
    let entity = null;
    entity = this.state.entities.find((e) => {
      return e.name == entity_name;
    });
    return entity;
  }

  lookup_equipment(equipment_name) {
    let equipment = null;
    equipment = this.state.equipments.find((e) => {
      return e.name == equipment_name;
    });

    return equipment;
  }

  deleteTasks() {
    const min_unit = 60 * 1000;
    const hour_unit = 60 * min_unit;
    const day_unit = 24 * hour_unit;

    const startDate = new Date().getTime() -  day_unit;
    const endDate = new Date().getTime() +  day_unit;

    const promises = [];

    this.setState({
      serverCallText: 'Deleting Tasks',
      serverCallInProgress: true
    });

    getTasks({ startDate, endDate, viewType: 'week' }).then((res) => {
      const parsed_res = JSON.parse(res);
      for (const task of parsed_res) {
        promises.push(deleteTask(task.id));
      }


      Promise.all(promises).then((res) => {
        this.setState({
          serverCallText: 'All done',
          serverCallInProgress: false
        });
      });
    });
  }

  handleFieldChange(e) {
    e.preventDefault();
    e.stopPropagation();
    let customer_info = { ...this.state.customer_info };
    customer_info[e.target.name] = e.target.value;
    this.setState({
      customer_info
    });
  }

  sleep(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  report_entity_locations() {
    const entity = this.lookup_entity('Eddie Weinberger');
    if (entity) {

      this.setState({
        serverCallText: 'Moving Eddie',
        serverCallInProgress: true
      });

      const entity_id = entity.id;
      this.report_entity_locations_rec(entity_id, 0);
    }
  }


  report_entity_locations_rec(entity_id, counter) {
    if (counter >= locationReports.length) {
      this.setState({
        serverCallText: 'All done',
        serverCallInProgress: false
      });

      return;
    }

    const location = locationReports[counter];

    const payload = {
      'lat': location.lat,
      'lng': location.lng,
      'entity': entity_id,
      'time': moment().format()
    };
    let location_payload = [];
    location_payload.push(payload);

    report_entity_locations(JSON.stringify(location_payload)).then((res) => {
      console.log('Location reports saved');
      this.setState({
        serverCallText: 'Reported location '+ (counter+1)
      });

      setTimeout(()=> this.report_entity_locations_rec(entity_id, ++counter), 4000);
    }).catch((error) =>{
      console.log('Error occurred in location reporting')
    });
  }

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  render() {
    const initial_load_complete = this.state.entities_laoded && this.state.templates_loded;

    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <DefaultHelmet/>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        <div className={styles['page-wrap']}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile} />

          { !initial_load_complete && <div className={styles.savingSpinnerContainer} style={{padding: '20px 20px'}}><SavingSpinner title='Validating account information' fontSize={14} borderStyle="none" /></div>}

          { initial_load_complete && <div className={styles.pageContentContainer} style={{padding: '0px 20px'}}>
            <h3>Demo Setup Page</h3>

            <p>Click 'Create Schedule' to create 11 tasks assigned to two separate teams. If you would like to see Arrivy SMS & Email notifications please provide the customer name, email and sms information below. It will be set on the first task. This is an optional step.</p>

            <div className={styles.formArea}>
              <FormControl name="customer_name" type="text" placeholder="Customer Name" value={this.state.customer_info.customer_name} onChange={(e) => this.handleFieldChange(e)}/>
              <FormControl name="customer_email" type="text" placeholder="Customer Email" value={this.state.customer_info.customer_email} onChange={(e) => this.handleFieldChange(e)}/>
              <FormControl name="customer_phone" type="text" placeholder="Customer Phone" value={this.state.customer_info.customer_phone} onChange={(e) => this.handleFieldChange(e)}/>
            </div>

            <Button onClick={this.createNewTasks}> Create Schedule </Button>
            <Button style={{marginLeft: '10px'}}onClick={this.deleteTasks}> Delete Schedule </Button>
            <div className={styles.spinnerStyle}>
              {this.state.serverCallInProgress && <SavingSpinner title={this.state.serverCallText} fontSize={14} borderStyle="none"/>}
              {!this.state.serverCallInProgress && <span className={styles.successText}>{this.state.serverCallText}</span>}
            </div>

            <h4>Move Driver (Eddie)</h4>
            <p>After clicking 'On our way' from the app you can simulate the location of the driver by clicking the button below. Simuation will take up to 30 seconds and if you have the customer view open you will see the driver move quickly towards the destination. Keep an eye on incoming notifications on the dashboard. Again, this is an optional step.</p>
            <Button onClick={this.report_entity_locations}> Move Driver </Button>

          </div> }
        </div>
        <div>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

Dashboard.contextTypes = {
  router: PropTypes.object.isRequired
};
