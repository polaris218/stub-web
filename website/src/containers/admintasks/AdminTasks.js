import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import styles from './AdminTasks.module.scss';
import { FooterComponent, FooterConfiguration, UserHeaderV2, SlimFooterV2, ActivityStream }  from '../../components';
import { getProfileInformation, getEntities, createEntity,
        deleteEntity, getTasks, postTask, register, deleteTask, deleteIt,
        createEquipment, getEquipments, deleteEquipment,
        getCustomers, createCustomer, deleteCustomer, getCompanyProfileInformation } from '../../actions';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { DefaultHelmet } from '../../helpers';
import {error_catch} from '../../helpers/error_catch';
import {ACTIVITY_ATTRIBUTES, TASK_ATTRIBUTES} from "../../helpers/keys";


const demoEntities = [
  {
    "Name": "Jack White",
    "Position": "Mover"
  },
  {
    "Name": "Robben Sides",
    "Position": "Supervisor"
  },
  {
    "Name": "Eddie Weinberger",
    "Position": "Mover"
  },
  {
    "Name": "Victor York",
    "Position": "Mover"
  },
  {
    "Name": "George Erickson",
    "Position": "Mover"
  },
  {
    "Name": "Penny Angeles",
    "Position": "Office Mgr"
  },
  {
    "Name": "Lois Villalpando",
    "Position": "Supervisor"
  }
];

const demoEquipments =  [
  {
    "Equip": "Truck 1 (26 ft)",
    "Description": "26 ft truck"
  },
  {
    "Equip": "Truck 2 (26 ft)",
    "Description": "26 ft truck"
  },
  {
    "Equip": "Truck 3 (44 ft)",
    "Description": "44 ft truck"
  },
  {
    "Equip": "Scissors lift",
    "Description": "Scissors lift"
  }
];

const demoCustomers = [
  {
    "GivenName": "Marie",
    "Surname": "Gallagher",
    "StreeAddress": "1620 136th Pl NE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "A Plus Lawn Care"
  },
  {
    "GivenName": "Hazel",
    "Surname": "Dryer",
    "StreeAddress": "218 3rd Ave N",
    "City": "Edmonds",
    "State": "WA",
    "ZipCode": 980204,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Bluedot Lawn Care"
  },
  {
    "GivenName": "Kenneth",
    "Surname": "Luedtke",
    "StreeAddress": "4829 196th St SW",
    "City": "Lynnwood",
    "State": "WA",
    "ZipCode": 980364,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "A+ Electronics"
  },
  {
    "GivenName": "Valerie",
    "Surname": "Anthony",
    "StreeAddress": "9418 35th Ave NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981152,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "ABCO Foods"
  },
  {
    "GivenName": "Thomas",
    "Surname": "Chung",
    "StreeAddress": "3080 148th Ave SE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980074,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Access Asia"
  },
  {
    "GivenName": "Louis",
    "Surname": "Mendez",
    "StreeAddress": "17225 Aurora Ave N",
    "City": "Shoreline",
    "State": "WA",
    "ZipCode": 981332,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Adaptabiz"
  },
  {
    "GivenName": "Mary",
    "Surname": "Jones",
    "StreeAddress": "13291 SE 36th St",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980064,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Adaptas"
  },
  {
    "GivenName": "Patricia",
    "Surname": "Brooks",
    "StreeAddress": "21300 Hwy 99",
    "City": "Edmonds",
    "State": "WA",
    "ZipCode": 980264,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Ellie's"
  },
  {
    "GivenName": "Jennifer",
    "Surname": "Francisco",
    "StreeAddress": "11727 124th Ave NE",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980344,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Alexander's"
  },
  {
    "GivenName": "Joan",
    "Surname": "Ellis",
    "StreeAddress": "817 7th Ave",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980334,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "All Wound Up"
  },
  {
    "GivenName": "Robert",
    "Surname": "Stewart",
    "StreeAddress": "7900 Greenwood Ave N",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981032,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Allied Radio"
  },
  {
    "GivenName": "Brandi",
    "Surname": "Hess",
    "StreeAddress": "15025 1st Ave S",
    "City": "Burien",
    "State": "WA",
    "ZipCode": 981482,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Angel's"
  },
  {
    "GivenName": "Daniel",
    "Surname": "Wentworth",
    "StreeAddress": "1015 Olive Way",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981012,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Yellow Bus"
  },
  {
    "GivenName": "Jimmy",
    "Surname": "Sparks",
    "StreeAddress": "22020 Hwy 99",
    "City": "Edmonds",
    "State": "WA",
    "ZipCode": 980264,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Anthony's"
  },
  {
    "GivenName": "Marilyn",
    "Surname": "Paris",
    "StreeAddress": "12612 NE 124th St",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980344,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Asian Solutions"
  },
  {
    "GivenName": "Charles",
    "Surname": "Edwards",
    "StreeAddress": "200 SW Grady Way",
    "City": "Renton",
    "State": "WA",
    "ZipCode": 980574,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Audio Visions"
  },
  {
    "GivenName": "Jesus",
    "Surname": "Winters",
    "StreeAddress": "3405 Auburn Way N",
    "City": "Auburn",
    "State": "WA",
    "ZipCode": 980022,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Avant Garde Appraisal Group"
  },
  {
    "GivenName": "Don",
    "Surname": "Silva",
    "StreeAddress": "901 W Hills Blvd",
    "City": "Bremerton",
    "State": "WA",
    "ZipCode": 983123,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "BASCO"
  },
  {
    "GivenName": "Larry",
    "Surname": "Hetrick",
    "StreeAddress": "13355 Lake City Way NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981252,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Body Fate"
  },
  {
    "GivenName": "Jennifer",
    "Surname": "Rogers",
    "StreeAddress": "1400 River Rd",
    "City": "Puyallup",
    "State": "WA",
    "ZipCode": 983712,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Bold Ideas"
  },
  {
    "GivenName": "Tracy",
    "Surname": "Ferguson",
    "StreeAddress": "12420 NE 85th St",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980334,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Borders Books"
  },
  {
    "GivenName": "William",
    "Surname": "McDowell",
    "StreeAddress": "14025 1st Ave S #B",
    "City": "Burien",
    "State": "WA",
    "ZipCode": 981682,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Brilliant Home Designs"
  },
  {
    "GivenName": "Stephen",
    "Surname": "Endo",
    "StreeAddress": "15000 SE Eastgate Way",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980074,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Buena Vista Realty Service"
  },
  {
    "GivenName": "Jose",
    "Surname": "Marra",
    "StreeAddress": "2121 8th Ave",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981212,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Casual Corner"
  },
  {
    "GivenName": "Robert",
    "Surname": "Moore",
    "StreeAddress": "19470 Viking Ave NW",
    "City": "Poulsbo",
    "State": "WA",
    "ZipCode": 983703,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Chargepal"
  },
  {
    "GivenName": "William",
    "Surname": "Bridges",
    "StreeAddress": "520 W Hills Blvd",
    "City": "Bremerton",
    "State": "WA",
    "ZipCode": 983123,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Coast to Coast Hardware"
  },
  {
    "GivenName": "Gail",
    "Surname": "Bowen",
    "StreeAddress": "4607 37th Ave SW",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981262,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Computer City"
  },
  {
    "GivenName": "Carrie",
    "Surname": "Evers",
    "StreeAddress": "101 116th Ave SE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980044,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Corinthian Designs"
  },
  {
    "GivenName": "Peter",
    "Surname": "Mercado",
    "StreeAddress": "519 SW 12th St",
    "City": "Renton",
    "State": "WA",
    "ZipCode": 980574,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Country Club Markets"
  },
  {
    "GivenName": "Charlie",
    "Surname": "Marin",
    "StreeAddress": "12531 30th Ave NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981252,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Courtesy Hardware Store"
  },
  {
    "GivenName": "Roger",
    "Surname": "Dial",
    "StreeAddress": "1148 E Main St",
    "City": "Auburn",
    "State": "WA",
    "ZipCode": 980022,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Crown Auto Parts"
  },
  {
    "GivenName": "Mark",
    "Surname": "Vining",
    "StreeAddress": "24329 Hwy 99",
    "City": "Edmonds",
    "State": "WA",
    "ZipCode": 980264,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Datacorp"
  },
  {
    "GivenName": "Norma",
    "Surname": "Foerster",
    "StreeAddress": "19518 Bothell-Everett Hwy SE",
    "City": "Bothell",
    "State": "WA",
    "ZipCode": 980124,
    "EmailAddress": "",
    "TelephoneNumber": "425 555-1212",
    "Company": "Desmonds Formal Wear"
  },
  {
    "GivenName": "John",
    "Surname": "Craft",
    "StreeAddress": "15026 1st Ave S",
    "City": "Burien",
    "State": "WA",
    "ZipCode": 981488,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Destiny Planners"
  },
  {
    "GivenName": "Sandra",
    "Surname": "Chau",
    "StreeAddress": "5330 Roosevelt Way NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981052,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Druther's"
  },
  {
    "GivenName": "Ella",
    "Surname": "Callender",
    "StreeAddress": "4514 Union Bay Pl NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981052,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Alphadog Software"
  },
  {
    "GivenName": "David",
    "Surname": "Peterson",
    "StreeAddress": "13421 NE 20th St",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Egghead Software"
  },
  {
    "GivenName": "Mary",
    "Surname": "Liu",
    "StreeAddress": "5202 Leary Ave NW",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981072,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Elek-Tek"
  },
  {
    "GivenName": "William",
    "Surname": "Ramirez",
    "StreeAddress": "3606 S Sprague Ave",
    "City": "Tacoma",
    "State": "WA",
    "ZipCode": 984092,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Elm Farm"
  },
  {
    "GivenName": "Sara",
    "Surname": "Hall",
    "StreeAddress": "1430 NW Mall St #C",
    "City": "Issaquah",
    "State": "WA",
    "ZipCode": 980274,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Endicott Shoes"
  },
  {
    "GivenName": "Jose",
    "Surname": "Chartier",
    "StreeAddress": "1157 Central Ave N",
    "City": "Kent",
    "State": "WA",
    "ZipCode": 980322,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Enviro Architectural Designs"
  },
  {
    "GivenName": "David",
    "Surname": "Higgs",
    "StreeAddress": "5701 Roosevelt Way NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981052,
    "EmailAddress": "",
    "TelephoneNumber": "425 555-1212",
    "Company": "Erb Lumber"
  },
  {
    "GivenName": "Joseph",
    "Surname": "Howard",
    "StreeAddress": "20006 64th Ave W",
    "City": "Lynnwood",
    "State": "WA",
    "ZipCode": 980364,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Family Toy"
  },
  {
    "GivenName": "Michael",
    "Surname": "Robinson",
    "StreeAddress": "1531 NW Leary Way",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981072,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Fellowship Investments"
  },
  {
    "GivenName": "George",
    "Surname": "Smith",
    "StreeAddress": "16912 Juanita Dr NE",
    "City": "Kenmore",
    "State": "WA",
    "ZipCode": 980284,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Food Barn"
  },
  {
    "GivenName": "Ronald",
    "Surname": "Garner",
    "StreeAddress": "6816 Evergreen Way",
    "City": "Everett",
    "State": "WA",
    "ZipCode": 982034,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Foot Quarters"
  },
  {
    "GivenName": "Greg",
    "Surname": "Cooper",
    "StreeAddress": "20309-B Ballinger Way NE",
    "City": "Shoreline",
    "State": "WA",
    "ZipCode": 981552,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Formula Gray"
  },
  {
    "GivenName": "Wallace",
    "Surname": "Phillips",
    "StreeAddress": "21010 66th Ave W",
    "City": "Lynnwood",
    "State": "WA",
    "ZipCode": 980364,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Glicks Furniture"
  },
  {
    "GivenName": "Marilyn",
    "Surname": "Dennis",
    "StreeAddress": "15544 Aurora Ave N",
    "City": "Shoreline",
    "State": "WA",
    "ZipCode": 981332,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Golden Joy"
  },
  {
    "GivenName": "Rolando",
    "Surname": "Johnson",
    "StreeAddress": "3420 Chico Way NW",
    "City": "Bremerton",
    "State": "WA",
    "ZipCode": 983123,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Grodins"
  },
  {
    "GivenName": "Amy",
    "Surname": "Worrall",
    "StreeAddress": "7802 S Tacoma Way",
    "City": "Tacoma",
    "State": "WA",
    "ZipCode": 984092,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Handy Andy Home Improvement Center"
  },
  {
    "GivenName": "Derek",
    "Surname": "Mejias",
    "StreeAddress": "1590 NW Mall St",
    "City": "Issaquah",
    "State": "WA",
    "ZipCode": 980274,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Handy Dan"
  },
  {
    "GivenName": "Temeka",
    "Surname": "Doan",
    "StreeAddress": "205 W Galer St",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981192,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Happy Bear Investment"
  },
  {
    "GivenName": "James",
    "Surname": "Riel",
    "StreeAddress": "2318 Point Fosdick Dr",
    "City": "Gig Harbor",
    "State": "WA",
    "ZipCode": 983352,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Highland Appliance"
  },
  {
    "GivenName": "Curtis",
    "Surname": "Woods",
    "StreeAddress": "1112 Pearl St",
    "City": "Bremerton",
    "State": "WA",
    "ZipCode": 983103,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Hills Supermarkets"
  },
  {
    "GivenName": "David",
    "Surname": "Hall",
    "StreeAddress": "20201 Front St NE",
    "City": "Poulsbo",
    "State": "WA",
    "ZipCode": 983703,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Hit or Miss"
  },
  {
    "GivenName": "Cathy",
    "Surname": "Young",
    "StreeAddress": "271 Rainier Ave N",
    "City": "Renton",
    "State": "WA",
    "ZipCode": 980554,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "House 2 Home"
  },
  {
    "GivenName": "Candace",
    "Surname": "Durbin",
    "StreeAddress": "725 Auburn Way N",
    "City": "Auburn",
    "State": "WA",
    "ZipCode": 980022,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "House Of Denmark"
  },
  {
    "GivenName": "Sandra",
    "Surname": "Martines",
    "StreeAddress": "1136 NW 50th St",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981072,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "HouseWorks!"
  },
  {
    "GivenName": "Jayson",
    "Surname": "Fults",
    "StreeAddress": "3616 SW Oregon St",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981262,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Hudson's MensWear"
  },
  {
    "GivenName": "Lorraine",
    "Surname": "Manfredi",
    "StreeAddress": "1818 Rainier Ave S",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981442,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Integra Wealth"
  },
  {
    "GivenName": "Jackie",
    "Surname": "Kondo",
    "StreeAddress": "12005 NE 12th St #14",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Jack Lang"
  },
  {
    "GivenName": "Joan",
    "Surname": "Johnson",
    "StreeAddress": "18204 Bothell-Everett Hwy SE #B",
    "City": "ill Creek",
    "State": "WA",
    "ZipCode": 980124,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Jackhammer Technologies"
  },
  {
    "GivenName": "Michael",
    "Surname": "Stephens",
    "StreeAddress": "12700 Bel-Red Rd",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Jafco"
  },
  {
    "GivenName": "Wayne",
    "Surname": "George",
    "StreeAddress": "4522 Roosevelt Way NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981052,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Landskip Yard Care"
  },
  {
    "GivenName": "Charles",
    "Surname": "Butz",
    "StreeAddress": "1407 132nd Ave NE #3",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Laneco"
  },
  {
    "GivenName": "Richard",
    "Surname": "Cortez",
    "StreeAddress": "1706 12th Ave",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981222,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Libera"
  },
  {
    "GivenName": "Frances",
    "Surname": "Nixon",
    "StreeAddress": "1517 134th Ave NE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Life Map"
  },
  {
    "GivenName": "Dwight",
    "Surname": "Brownlee",
    "StreeAddress": "2925 Auburn Way N",
    "City": "Auburn",
    "State": "WA",
    "ZipCode": 980022,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Adephi"
  },
  {
    "GivenName": "Helen",
    "Surname": "Delcastillo",
    "StreeAddress": "13424 NE 20th St",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Listen Up"
  },
  {
    "GivenName": "Shannon",
    "Surname": "Mick",
    "StreeAddress": "2700 NE 55th St",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981052,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Little Tavern"
  },
  {
    "GivenName": "Michelle",
    "Surname": "Godwin",
    "StreeAddress": "13726 Lake City Way NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981252,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Potter Accessories"
  },
  {
    "GivenName": "Paul",
    "Surname": "Bresnahan",
    "StreeAddress": "11845 NE 85th St",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980334,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Locost Accessories"
  },
  {
    "GivenName": "John",
    "Surname": "Myers",
    "StreeAddress": "1815 Seabeck Hwy NW",
    "City": "Bremerton",
    "State": "WA",
    "ZipCode": 983123,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Lum's"
  },
  {
    "GivenName": "Andrea",
    "Surname": "Elliott",
    "StreeAddress": "4724 Roosevelt Way NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981052,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Madcats Music & Books"
  },
  {
    "GivenName": "Rebecca",
    "Surname": "Loftin",
    "StreeAddress": "6602 S. Tacoma Way",
    "City": "Tacoma",
    "State": "WA",
    "ZipCode": 984092,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "ManCharm"
  },
  {
    "GivenName": "Roxanne",
    "Surname": "Hayes",
    "StreeAddress": "21701 Hwy 99",
    "City": "Lynnwood",
    "State": "WA",
    "ZipCode": 980364,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Matrix Interior Design"
  },
  {
    "GivenName": "Belen",
    "Surname": "Chavez",
    "StreeAddress": "14711 15th Ave NE #A",
    "City": "Shoreline",
    "State": "WA",
    "ZipCode": 981552,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Maurice The Pants Man"
  },
  {
    "GivenName": "Yolonda",
    "Surname": "Carswell",
    "StreeAddress": "3506 S Sprague Ave",
    "City": "Tacoma",
    "State": "WA",
    "ZipCode": 984092,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Megatronic Plus"
  },
  {
    "GivenName": "Dania",
    "Surname": "Murphy",
    "StreeAddress": "411 116th Ave NE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980044,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Metro"
  },
  {
    "GivenName": "Otis",
    "Surname": "Cashman",
    "StreeAddress": "1331 Stewart St",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981092,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Modern Realty"
  },
  {
    "GivenName": "Duane",
    "Surname": "Haught",
    "StreeAddress": "9520 Greenwood Ave N",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981032,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Monk Home Improvements"
  },
  {
    "GivenName": "Gary",
    "Surname": "Harris",
    "StreeAddress": "2605 NE 55th St",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981052,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Monk House Maker"
  },
  {
    "GivenName": "Fannie",
    "Surname": "Wright",
    "StreeAddress": "20300 Hwy 99",
    "City": "Lynnwood",
    "State": "WA",
    "ZipCode": 980364,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Montana's Cookhouse"
  },
  {
    "GivenName": "Jerry",
    "Surname": "Luce",
    "StreeAddress": "21515 Hwy 99",
    "City": "Lynnwood",
    "State": "WA",
    "ZipCode": 980364,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Movie Gallery"
  },
  {
    "GivenName": "Tony",
    "Surname": "Lineberry",
    "StreeAddress": "13733 Aurora Ave N",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981332,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Murray's Discount Auto Stores"
  },
  {
    "GivenName": "Hollie",
    "Surname": "Weaver",
    "StreeAddress": "9201 35th Ave SW",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981262,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Muscle Factory"
  },
  {
    "GivenName": "Thomas",
    "Surname": "Hull",
    "StreeAddress": "2605 Auburn Way N",
    "City": "Auburn",
    "State": "WA",
    "ZipCode": 980022,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Museum Company"
  },
  {
    "GivenName": "Joanne",
    "Surname": "Pereda",
    "StreeAddress": "10633 16th Ave SW",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981462,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Music Boutique"
  },
  {
    "GivenName": "Marilyn",
    "Surname": "Heinen",
    "StreeAddress": "10218 Greenwood Ave N",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981332,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Music Den"
  },
  {
    "GivenName": "Sandra",
    "Surname": "Smith",
    "StreeAddress": "3203 NE Totten Rd",
    "City": "Poulsbo",
    "State": "WA",
    "ZipCode": 983703,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Nan Duskin"
  },
  {
    "GivenName": "Nettie",
    "Surname": "Dalton",
    "StreeAddress": "631 S Baker St",
    "City": "Tacoma",
    "State": "WA",
    "ZipCode": 984022,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Nedick's"
  },
  {
    "GivenName": "Wilber",
    "Surname": "Smith",
    "StreeAddress": "800 Rainier Ave S",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981442,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "New World"
  },
  {
    "GivenName": "Roderick",
    "Surname": "Potts",
    "StreeAddress": "17037 Aurora Ave N",
    "City": "Shoreline",
    "State": "WA",
    "ZipCode": 981332,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Northern Reflections"
  },
  {
    "GivenName": "Theodore",
    "Surname": "Wood",
    "StreeAddress": "13910 NE N Woodinville Way",
    "City": "Woodinville",
    "State": "WA",
    "ZipCode": 980724,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Oak Farm"
  },
  {
    "GivenName": "Samuel",
    "Surname": "Chamblee",
    "StreeAddress": "16622 Aurora Ave N",
    "City": "Shoreline",
    "State": "WA",
    "ZipCode": 981332,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Oklahoma Tire & Supply Company"
  },
  {
    "GivenName": "Bruce",
    "Surname": "Ojeda",
    "StreeAddress": "1100 Oyster Bay Ave S",
    "City": "Bremerton",
    "State": "WA",
    "ZipCode": 983123,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Doug's Market"
  },
  {
    "GivenName": "Oliver",
    "Surname": "Butler",
    "StreeAddress": "1546 NW Leary Way",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981072,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Olson's Market"
  },
  {
    "GivenName": "Laurie",
    "Surname": "Polley",
    "StreeAddress": "1506 S 348th St",
    "City": "Federal Way",
    "State": "WA",
    "ZipCode": 980032,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "On Cue"
  },
  {
    "GivenName": "Terry",
    "Surname": "Ruiz",
    "StreeAddress": "4209 NE Sunset Blvd",
    "City": "Renton",
    "State": "WA",
    "ZipCode": 980594,
    "EmailAddress": "",
    "TelephoneNumber": "425 555-1212",
    "Company": "P. Samuels Men's Clothiers"
  },
  {
    "GivenName": "Emily",
    "Surname": "Gilliam",
    "StreeAddress": "523 15th Ave E",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981122,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Personal & Corporate Design"
  },
  {
    "GivenName": "Jack",
    "Surname": "Horn",
    "StreeAddress": "10611 Evergreen Way S",
    "City": "Everett",
    "State": "WA",
    "ZipCode": 982044,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Plan Smart"
  },
  {
    "GivenName": "Edward",
    "Surname": "Meyer",
    "StreeAddress": "5804 119th Ave SE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980064,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Powerbod"
  },
  {
    "GivenName": "Wm",
    "Surname": "Gatton",
    "StreeAddress": "13205 NE 124th St #B-1",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980344,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Practi-Plan"
  },
  {
    "GivenName": "Polly",
    "Surname": "Sharp",
    "StreeAddress": "6801 S. Tacoma Way",
    "City": "Tacoma",
    "State": "WA",
    "ZipCode": 984092,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Price's Electronics"
  },
  {
    "GivenName": "Lindsey",
    "Surname": "Rhodes",
    "StreeAddress": "1500 18th Ave NW",
    "City": "Issaquah",
    "State": "WA",
    "ZipCode": 980274,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Price's Electronics"
  },
  {
    "GivenName": "Anthony",
    "Surname": "Banner",
    "StreeAddress": "7001 15th Ave NW",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981172,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Pro Star"
  },
  {
    "GivenName": "Steven",
    "Surname": "Chapman",
    "StreeAddress": "11503 Pacific Hwy SW",
    "City": "Lakewood",
    "State": "WA",
    "ZipCode": 984992,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Prospa-Pal"
  },
  {
    "GivenName": "Jason",
    "Surname": "Bishop",
    "StreeAddress": "1708 40th Avenue Ct E",
    "City": "Fife",
    "State": "WA",
    "ZipCode": 984242,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Rack N Sack"
  },
  {
    "GivenName": "Deborah",
    "Surname": "Wasinger",
    "StreeAddress": "35406 21st Ave SW",
    "City": "Federal Way",
    "State": "WA",
    "ZipCode": 980232,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Raleigh's"
  },
  {
    "GivenName": "Leslie",
    "Surname": "Giles",
    "StreeAddress": "18032 1st Ave S",
    "City": "Burien",
    "State": "WA",
    "ZipCode": 981482,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Record Bar"
  },
  {
    "GivenName": "Bryan",
    "Surname": "Grant",
    "StreeAddress": "301 Baker Blvd",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981882,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Red Baron Electronics"
  },
  {
    "GivenName": "Joseph",
    "Surname": "Blakey",
    "StreeAddress": "3100 Bickford Ave",
    "City": "Snohomish",
    "State": "WA",
    "ZipCode": 982903,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Red Food"
  },
  {
    "GivenName": "Gloria",
    "Surname": "Sanchez",
    "StreeAddress": "2400 Beacon Ave S",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981442,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Red Robin Stores"
  },
  {
    "GivenName": "Michael",
    "Surname": "Campbell",
    "StreeAddress": "3147 Bridgeport Way W",
    "City": "University Place",
    "State": "WA",
    "ZipCode": 984662,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Reliable Guidance"
  },
  {
    "GivenName": "Charles",
    "Surname": "Holden",
    "StreeAddress": "15632 NE Woodinville Duvall Pl",
    "City": "Woodinville",
    "State": "WA",
    "ZipCode": 980724,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Roberd's"
  },
  {
    "GivenName": "Eric",
    "Surname": "Allen",
    "StreeAddress": "11800 124th Ave NE",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980348,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Rose Records"
  },
  {
    "GivenName": "Renee",
    "Surname": "Goodwin",
    "StreeAddress": "12119 Key Peninsula Hwy N",
    "City": "Gig Harbor",
    "State": "WA",
    "ZipCode": 983292,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Royal Gas"
  },
  {
    "GivenName": "Cammy",
    "Surname": "Blevins",
    "StreeAddress": "914 W Main St",
    "City": "Monroe",
    "State": "WA",
    "ZipCode": 982723,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Sammy's Record Shack"
  },
  {
    "GivenName": "Pamala",
    "Surname": "Thompson",
    "StreeAddress": "11626 Slater Ave NE #6",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980344,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Security Sporting Goods"
  },
  {
    "GivenName": "Rebecca",
    "Surname": "Hodge",
    "StreeAddress": "1002 Airport Way S",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981342,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Sew-Fro Fabrics"
  },
  {
    "GivenName": "Hector",
    "Surname": "Shaw",
    "StreeAddress": "4949 SW Hovde Rd",
    "City": "Port Orchard",
    "State": "WA",
    "ZipCode": 983673,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Simply Save"
  },
  {
    "GivenName": "Stella",
    "Surname": "Williams",
    "StreeAddress": "9702 Sand Point Way NE",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981152,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Specialty Restaurant Group"
  },
  {
    "GivenName": "Kevin",
    "Surname": "Bigham",
    "StreeAddress": "3888 W Hwy 16",
    "City": "Bremerton",
    "State": "WA",
    "ZipCode": 983123,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Specialty Restaurant Group"
  },
  {
    "GivenName": "Mitchell",
    "Surname": "Brunet",
    "StreeAddress": "501 Auburn Way N",
    "City": "Auburn",
    "State": "WA",
    "ZipCode": 980022,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Sports West"
  },
  {
    "GivenName": "Logan",
    "Surname": "Ferri",
    "StreeAddress": "420 116th Ave NE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980044,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Sports Town USA"
  },
  {
    "GivenName": "Emma",
    "Surname": "Villanueva",
    "StreeAddress": "4820 California Ave SW",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981162,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Stop and Shop"
  },
  {
    "GivenName": "George",
    "Surname": "Agnew",
    "StreeAddress": "11853 Slater Ave NE",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980344,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Stop N Shop"
  },
  {
    "GivenName": "Nicole",
    "Surname": "Hammett",
    "StreeAddress": "834 SW 149th St",
    "City": "Burien",
    "State": "WA",
    "ZipCode": 981662,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Strategic Profit"
  },
  {
    "GivenName": "Jeffrey",
    "Surname": "Buehler",
    "StreeAddress": "7520 Aurora Ave N",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981032,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Strategy Planner"
  },
  {
    "GivenName": "Lindsey",
    "Surname": "Patrick",
    "StreeAddress": "16268 5th Ave NE",
    "City": "Shoreline",
    "State": "WA",
    "ZipCode": 981552,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Super Duper"
  },
  {
    "GivenName": "William",
    "Surname": "Rundell",
    "StreeAddress": "3810 Stone Way N",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981032,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "System Star Solutions"
  },
  {
    "GivenName": "Teresa",
    "Surname": "Auyeung",
    "StreeAddress": "4402 Bridgeport Way W",
    "City": "University Place",
    "State": "WA",
    "ZipCode": 984662,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Tape World"
  },
  {
    "GivenName": "Jim",
    "Surname": "Medina",
    "StreeAddress": "3912 S 56th St",
    "City": "Tacoma",
    "State": "WA",
    "ZipCode": 984092,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Target Realty"
  },
  {
    "GivenName": "George",
    "Surname": "Curl",
    "StreeAddress": "4114 Hoyt Ave",
    "City": "Everett",
    "State": "WA",
    "ZipCode": 982034,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Terra Nova Garden Services"
  },
  {
    "GivenName": "Nicole",
    "Surname": "Lambert",
    "StreeAddress": "430 116th Ave NE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980044,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "The Great Train Stores"
  },
  {
    "GivenName": "Michael",
    "Surname": "Lehman",
    "StreeAddress": "4601 37th Ave SW",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981262,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "The Serendipity Dip"
  },
  {
    "GivenName": "Maria",
    "Surname": "Williams",
    "StreeAddress": "18002 Bothell-Everett Hwy",
    "City": "Bothell",
    "State": "WA",
    "ZipCode": 980124,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "The White Rabbit"
  },
  {
    "GivenName": "Trevor",
    "Surname": "Glover",
    "StreeAddress": "2410 34th Ave W",
    "City": "Seattle",
    "State": "WA",
    "ZipCode": 981992,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Two Pesos"
  },
  {
    "GivenName": "Richard",
    "Surname": "Bagley",
    "StreeAddress": "1533 120th Ave NE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980054,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Unity Frankford Stores"
  },
  {
    "GivenName": "Sarah",
    "Surname": "Greenwell",
    "StreeAddress": "120 116th Ave NE",
    "City": "Bellevue",
    "State": "WA",
    "ZipCode": 980044,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "W. Bell & Co."
  },
  {
    "GivenName": "Marianne",
    "Surname": "Reed",
    "StreeAddress": "10206 16th St E",
    "City": "Edgewood",
    "State": "WA",
    "ZipCode": 983722,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Waccamaw's Homeplace"
  },
  {
    "GivenName": "Patricia",
    "Surname": "Shumate",
    "StreeAddress": "11803 NE 116th St",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980344,
    "EmailAddress": "",
    "TelephoneNumber": "",
    "Company": "Wag's"
  },
  {
    "GivenName": "Ethan",
    "Surname": "Diamond",
    "StreeAddress": "11803 NE 116th St",
    "City": "Kirkland",
    "State": "WA",
    "ZipCode": 980344,
    "EmailAddress": "ethan@diamond.com",
    "TelephoneNumber": "415 555-1212",
    "Company": "Wag's"
  }
];

const demoTasks = [
  {
    "Title": "MOVE Lorraine Manfredi",
    "StartDate": "Monday",
    "EndDate": "Monday",
    "StartTime": "9:30",
    "EndTime": "12:30",
    "Customer": "Lorraine Manfredi",
    "Team1": "Lois Villalpando",
    "Team2": "Jack White",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Sculptures are extremely fragile and valuable. Make sure you pay particular attention to securing them"
  },
  {
    "Title": "MOVE Nicole Lambert",
    "StartDate": "Monday",
    "EndDate": "Monday",
    "StartTime": "13:30",
    "EndTime": "16:30",
    "Customer": "Nicole Lambert",
    "Team1": "Lois Villalpando",
    "Team2": "Jack White",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "There are 3 guitars that need to be moved in a humidity-controlled crate"
  },
  {
    "Title": "MOVE Wilber Smith",
    "StartDate": "Monday",
    "EndDate": "Monday",
    "StartTime": "10:00",
    "EndTime": "13:00",
    "Customer": "Wilber Smith",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Norma Foerster",
    "StartDate": "Monday",
    "EndDate": "Monday",
    "StartTime": "14:30",
    "EndTime": "17:30",
    "Customer": "Norma Foerster",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Client will need to be away from the house for the majority of the move. In case of questions, they can be reached at the number in the Arrivy customer record"
  },
  {
    "Title": "MOVE Oliver Butler",
    "StartDate": "Monday",
    "EndDate": "Monday",
    "StartTime": "8:30",
    "EndTime": "16:30",
    "Customer": "Oliver Butler",
    "Team1": "Victor York",
    "Team2": "George Erickson",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "Sculptures are extremely fragile and valuable. Make sure you pay particular attention to securing them"
  },
  {
    "Title": "MOVE Mary Liu",
    "StartDate": "Tuesday",
    "EndDate": "Tuesday",
    "StartTime": "10:00",
    "EndTime": "14:00",
    "Customer": "Mary Liu",
    "Team1": "George Erickson",
    "Team2": "Victor York",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Hector Shaw",
    "StartDate": "Tuesday",
    "EndDate": "Tuesday",
    "StartTime": "9:00",
    "EndTime": "12:00",
    "Customer": "Hector Shaw",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Terry Ruiz",
    "StartDate": "Tuesday",
    "EndDate": "Tuesday",
    "StartTime": "13:00",
    "EndTime": "16:00",
    "Customer": "Terry Ruiz",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Samuel Chamblee",
    "StartDate": "Tuesday",
    "EndDate": "Tuesday",
    "StartTime": "9:30",
    "EndTime": "11:30",
    "Customer": "Samuel Chamblee",
    "Team1": "Lois Villalpando",
    "Team2": "Penny Angeles",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "Use special crates for artwork in living room"
  },
  {
    "Title": "MOVE Eric Allen",
    "StartDate": "Tuesday",
    "EndDate": "Tuesday",
    "StartTime": "12:00",
    "EndTime": "14:00",
    "Customer": "Eric Allen",
    "Team1": "Lois Villalpando",
    "Team2": "Penny Angeles",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Lindsey Patrick",
    "StartDate": "Tuesday",
    "EndDate": "Tuesday",
    "StartTime": "16:00",
    "EndTime": "18:00",
    "Customer": "Lindsey Patrick",
    "Team1": "Lois Villalpando",
    "Team2": "Penny Angeles",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "Please let the office know in the first hour, whether the move can be accomplished with a single truck"
  },
  {
    "Title": "MOVE Rolando Johnson",
    "StartDate": "Wednesday",
    "EndDate": "Wednesday",
    "StartTime": "9:30",
    "EndTime": "13:30",
    "Customer": "Rolando Johnson",
    "Team1": "Lois Villalpando",
    "Team2": "George Erickson",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Ensure that lawn sculptures are packed and moved"
  },
  {
    "Title": "MOVE Mark Vining",
    "StartDate": "Wednesday",
    "EndDate": "Wednesday",
    "StartTime": "14:00",
    "EndTime": "17:00",
    "Customer": "Mark Vining",
    "Team1": "Lois Villalpando",
    "Team2": "George Erickson",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "There are 3 guitars that need to be moved in a humidity-controlled crate"
  },
  {
    "Title": "MOVE Marilyn Heinen",
    "StartDate": "Wednesday",
    "EndDate": "Wednesday",
    "StartTime": "9:30",
    "EndTime": "13:30",
    "Customer": "Marilyn Heinen",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "There is one king bed and two queeens. Client doesn't want second queen (in spare bedroom) moved"
  },
  {
    "Title": "MOVE Steven Chapman",
    "StartDate": "Wednesday",
    "EndDate": "Wednesday",
    "StartTime": "14:00",
    "EndTime": "18:00",
    "Customer": "Steven Chapman",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Jackie Kondo",
    "StartDate": "Wednesday",
    "EndDate": "Wednesday",
    "StartTime": "8:30",
    "EndTime": "12:30",
    "Customer": "Jackie Kondo",
    "Team1": "Victor York",
    "Team2": "Jack White",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "Packers should precede movers by about two hours"
  },
  {
    "Title": "MOVE Jesus Winters",
    "StartDate": "Wednesday",
    "EndDate": "Wednesday",
    "StartTime": "14:30",
    "EndTime": "16:30",
    "Customer": "Jesus Winters",
    "Team1": "Victor York",
    "Team2": "Jack White",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Stephen Endo",
    "StartDate": "Thursday",
    "EndDate": "Thursday",
    "StartTime": "9:30",
    "EndTime": "11:30",
    "Customer": "Stephen Endo",
    "Team1": "George Erickson",
    "Team2": "Victor York",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Washer and dryer are extremely tight. Please use care when moving"
  },
  {
    "Title": "MOVE Maria Williams",
    "StartDate": "Thursday",
    "EndDate": "Thursday",
    "StartTime": "13:00",
    "EndTime": "16:00",
    "Customer": "Maria Williams",
    "Team1": "George Erickson",
    "Team2": "Victor York",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Shannon Mick",
    "StartDate": "Thursday",
    "EndDate": "Thursday",
    "StartTime": "8:30",
    "EndTime": "12:30",
    "Customer": "Shannon Mick",
    "Team1": "Robben Sides",
    "Team2": "Eddie Weinberger",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Sara Hall",
    "StartDate": "Thursday",
    "EndDate": "Thursday",
    "StartTime": "14:00",
    "EndTime": "17:00",
    "Customer": "Sara Hall",
    "Team1": "Robben Sides",
    "Team2": "Eddie Weinberger",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Client will need to be away from the house for the majority of the move. In case of questions, they can be reached at the number in the Arrivy customer record"
  },
  {
    "Title": "MOVE William Bridges",
    "StartDate": "Thursday",
    "EndDate": "Thursday",
    "StartTime": "8:30",
    "EndTime": "16:30",
    "Customer": "William Bridges",
    "Team1": "Penny Angeles",
    "Team2": "Lois Villalpando",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "There are 3 guitars that need to be moved in a humidity-controlled crate"
  },
  {
    "Title": "MOVE William Ramirez",
    "StartDate": "Friday",
    "EndDate": "Friday",
    "StartTime": "9:00",
    "EndTime": "13:00",
    "Customer": "William Ramirez",
    "Team1": "George Erickson",
    "Team2": "Lois Villalpando",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Scissors lift will be needed to access equipment from southwest bedroom"
  },
  {
    "Title": "MOVE Tracy Ferguson",
    "StartDate": "Friday",
    "EndDate": "Friday",
    "StartTime": "13:30",
    "EndTime": "17:30",
    "Customer": "Tracy Ferguson",
    "Team1": "George Erickson",
    "Team2": "Lois Villalpando",
    "Team3": "NA",
    "Equip": "Truck 1 (26 ft)",
    "Color": "#FF6900",
    "Instructions": "Please ensure that you photograph any damaged items before moving them. Use Arrivy to ensure that they are part of the client record"
  },
  {
    "Title": "MOVE Dania Murphy",
    "StartDate": "Friday",
    "EndDate": "Friday",
    "StartTime": "9:00",
    "EndTime": "13:00",
    "Customer": "Dania Murphy",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Client will need to be away from the house for the majority of the move. In case of questions, they can be reached at the number in the Arrivy customer record"
  },
  {
    "Title": "MOVE David Higgs",
    "StartDate": "Friday",
    "EndDate": "Friday",
    "StartTime": "14:00",
    "EndTime": "18:00",
    "Customer": "David Higgs",
    "Team1": "Jack White",
    "Team2": "Victor York",
    "Team3": "NA",
    "Equip": "Truck 2 (26 ft)",
    "Color": "#FCB900",
    "Instructions": "Use special crates for artwork in living room"
  },
  {
    "Title": "MOVE Deborah Wasinger",
    "StartDate": "Friday",
    "EndDate": "Friday",
    "StartTime": "9:30",
    "EndTime": "11:30",
    "Customer": "Deborah Wasinger",
    "Team1": "Penny Angeles",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "There are 3 guitars that need to be moved in a humidity-controlled crate"
  },
  {
    "Title": "MOVE David Peterson",
    "StartDate": "Friday",
    "EndDate": "Friday",
    "StartTime": "12:30",
    "EndTime": "17:30",
    "Customer": "David Peterson",
    "Team1": "Penny Angeles",
    "Team2": "Robben Sides",
    "Team3": "NA",
    "Equip": "Truck 3 (44 ft)",
    "Color": "#00bfd8",
    "Instructions": "Use special crates for artwork in living room"
  },
  {
    "StartDate": "Monday",
    "StartTime": "8:30",
    "ActivityType": "CALL",
    "Title": "Confirm Norma Foerster move Instructions",
    "Instructions": "Call Norma and ensure that someone will be at the house when movers arrive",
    "Customer": "Norma Foerster",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",

  },
  {
    "StartDate": "Monday",
    "StartTime": "13:00",
    "ActivityType": "APPOINTMENT",
    "Title": "Lunch",
    "Instructions": "After Wilbur Smith appt",
    "Customer": "",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
  },
  {
    "StartDate": "Tuesday",
    "StartTime": "12:30",
    "ActivityType": "APPOINTMENT",
    "Title": "Pickup Jamie Edwards for Ruiz move",
    "Instructions": "Ruiz move will require 3 people. Pick Jamie up at depot",
    "Customer": "Terry Ruiz",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",
  },
  {
    "StartDate": "Tuesday",
    "StartTime": "00:00",
    "AllDay": true,
    "ActivityType": "NOTE",
    "Title": "Eric Elia on vacation",
    "Instructions": "Will return on Wed",
    "Customer": "",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",
  },
  {
    "StartDate": "Wednesday",
    "StartTime": "00:00",
    "AllDay": true,
    "ActivityType": "EMAIL",
    "Title": "Email Ethan Diamond packing estimate",
    "Instructions": "Needs info to submit to his company for reimbursement",
    "CustomerFirstName": "Ethan Diamond",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",
  },
  {
    "StartDate": "Wednesday",
    "StartTime": "17:00",
    "ActivityType": "TO_DO",
    "Title": "Take Truck 1 in for servicing",
    "Instructions": "60 k mile check-up",
    "Customer": "",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",
  },
  {
    "StartDate": "Thursday",
    "StartTime": "13:00",
    "ActivityType": "APPOINTMENT",
    "Title": "Lunch",
    "Instructions": "After Shannon Mick move",
    "Customer": "",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "Robben Sides",
    "Team3": "NA",
  },
  {
    "StartDate": "Thursday",
    "StartTime": "00:00",
    "AllDay": true,
    "ActivityType": "NOTE",
    "Title": "Submit vacation requests",
    "Instructions": "",
    "Customer": "",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",
  },
  {
    "StartDate": "Friday",
    "StartTime": "8:30",
    "ActivityType": "CALL",
    "Title": "Confirm David Higgs move Instructions",
    "Instructions": "Call David and ensure that someone will be at the house when movers arrive",
    "Customer": "David Higgs",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",
  },
  {
    "StartDate": "Friday",
    "StartTime": "15:30",
    "ActivityType": "NOTE",
    "Title": "Monthly inventory",
    "Instructions": "Return to depot",
    "Customer": "",
    "TemplateType": "ACTIVITY",
    "Team1": "Eddie Weinberger",
    "Team2": "NA",
    "Team3": "NA",
  }
];

export default class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);

    this.createEntitiesAndTasks = this.createEntitiesAndTasks.bind(this);
    this.deleteEntitiesAndTasks = this.deleteEntitiesAndTasks.bind(this);

    this.createNewEntities = this.createNewEntities.bind(this);
    this.createNewCustomers = this.createNewCustomers.bind(this);
    this.createNewTasks = this.createNewTasks.bind(this);
    this.createNewEquipments = this.createNewEquipments.bind(this);

    this.deleteEquipments = this.deleteEquipments.bind(this);
    this.deleteTasks = this.deleteTasks.bind(this);
    this.deleteCustomers = this.deleteCustomers.bind(this);
    this.deleteEntities = this.deleteEntities.bind(this);

    this.lookup_entity = this.lookup_entity.bind(this);
    this.lookup_equipment = this.lookup_equipment.bind(this);
    this.loadUpEntities = this.loadUpEntities.bind(this);
    this.sync_api_calls = this.sync_api_calls.bind(this);

    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);

    this.state = {
      account_email: '',
      account_name: '',
      company_name: ''
    };
  }

  componentWillMount() {
    Promise.all([getProfileInformation(), getCompanyProfileInformation()]).then(([profileRes, companyProfileRes]) => {
        const profile = JSON.parse(profileRes);
        const companyProfile = JSON.parse(companyProfileRes);
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
            companyProfile: companyProfile,
            company_name: companyProfile.fullname,
            view_activity_stream
        });
        if (!profile || !profile.permissions || !(profile.permissions.includes('COMPANY') || profile.permissions.includes('ADMIN_TASKS'))) {
            this.context.router.history.push('/dashboard');
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
        entities: parsed_res
      });
    });

    getEquipments().then((res) => {
      const parsed_res = JSON.parse(res);
      this.setState({
        equipments: parsed_res
      });
    });

    getCustomers().then((res) => {
      const parsed_res = JSON.parse(res);
      this.setState({
        customers: parsed_res
      });
    });


    demoTasks.map((task) => {
      demoCustomers.map((customer) => {
        if(task.Customer == customer.GivenName + ' '+ customer.Surname) {
          task.customer_first_name = customer.GivenName;
          task.customer_last_name = customer.Surname;
          task.customer_email = customer.EmailAddress;
          task.customer_phone = customer.TelephoneNumber;
          task.customer_address_line_1 = customer.StreeAddress;
          task.customer_city = customer.City;
          task.customer_state = customer.State;
          task.customer_zipcode = customer.ZipCode;
        }
      })
    });
  }

  deleteEntitiesAndTasks() {
    const min_unit = 60 * 1000;
    const hour_unit = 60 * min_unit;
    const day_unit = 24 * hour_unit;

    const startDate = new Date().getTime() - 7 * day_unit;
    const endDate = new Date().getTime() + 7 * day_unit;

    getTasks({ startDate, endDate }).then((res) => {
      const parsed_res = JSON.parse(res);
      for (const task of parsed_res) {
        deleteTask(task.id);
      }
    });

    deleteIt('test1-' + this.state.account_email);
    deleteIt('test2-' + this.state.account_email);
    getEntities().then((res) => {
      const parsed_res = JSON.parse(res);
      for (const entity of parsed_res) {
        if (entity.name === 'test1-' + this.state.account_name || entity.name === 'test2-' + this.state.account_name) {
          deleteEntity(entity.id);
        }
      }
    });

  }

  createNewEquipments() {
    const promises = [];
    let equipments = [];

    this.setState({
      serverCallText: 'Creating New Equipment',
      serverCallInProgress: true
    });

    demoEquipments.map((demoEquipment) => {
      promises.push(
        createEquipment({
          name: demoEquipment.Equip,
          details: demoEquipment.Description
        }).then((res) => {
          demoEquipment.id = JSON.parse(res).id;
          equipments.push(demoEquipment);
        })
      );
    });

    Promise.all(promises).then(() => {
      getEquipments().then((res) => {
        const parsed_res = JSON.parse(res);
        this.setState({
          equipments: parsed_res,
          serverCallInProgress: false,
          serverCallText: 'All Done'
        });
      });
    });
  }

  deleteEquipments() {
    this.setState({
      serverCallText: 'Creating New Equipment',
      serverCallInProgress: true
    });

    getEquipments().then((res) => {
      const parsed_res = JSON.parse(res);
      for (const equipment of parsed_res) {
        deleteEquipment(equipment.id);
      }
      this.setState({
        serverCallText: 'All Done',
        serverCallInProgress: false
      })
    });
  }

  createNewCustomers() {
    const promises = [];
    let customers = [];

    this.setState({
      serverCallText: 'Creating New Customers',
      serverCallInProgress: true
    });

    demoCustomers.map((demoCustomer) => {
      promises.push(
        createCustomer({
          first_name: demoCustomer.GivenName,
          last_name: demoCustomer.Surname,
          company_name: demoCustomer.Company,
          email: demoCustomer.EmailAddress,
          phone: demoCustomer.TelephoneNumber,
          address_line_1: demoCustomer.StreeAddress,
          address_line_2: '',
          city: demoCustomer.City,
          state: demoCustomer.State,
          zipcode: demoCustomer.ZipCode
        }).then((res) => {
          demoCustomer.id = JSON.parse(res).id;
          customers.push(demoCustomer);
        })
      );
    });

    Promise.all(promises).then(() => {
      getCustomers().then((res) => {
        const parsed_res = JSON.parse(res);
        this.setState({
          customers: parsed_res,
          serverCallInProgress: false,
          serverCallText: 'All Done'
        });
      });
    });
  }

  deleteCustomers() {
    this.setState({
      serverCallText: 'Deleting Customers',
      serverCallInProgress: true
    });
    getCustomers().then((res) => {
      const parsed_res = JSON.parse(res);
      for (const customer of parsed_res) {
        deleteCustomer(customer.id);
      }

      this.setState({
        serverCallInProgress: false,
        serverCallText: 'All done'
      });
    });
  }


  createNewEntities() {
    const promises = [];
    let entities = [];

    this.setState({
      serverCallText: 'Creating New Entities. This call is intentionally running slow',
      serverCallInProgress: true
    });

    demoEntities.map((demoEntity) => {
      promises.push(
        createEntity({
          name: demoEntity.Name,
          type: demoEntity.Position,
          email: demoEntity.Email
        }).then((res) => {
          demoEntity.id = JSON.parse(res).id;
          entities.push(demoEntity);
        })
      );
    });

    Promise.all(promises).then(() => {
      setTimeout(this.loadUpEntities, 9000);
    });
  }

  loadUpEntities() {
    getEntities().then((res) => {
        const parsed_res = JSON.parse(res);
        this.setState({
          entities: parsed_res,
          serverCallText: 'All Done',
          serverCallInProgress: false
        });
    });
  }

  deleteEntities() {
    this.setState({
      serverCallText: 'Deleting Entities',
      serverCallInProgress: true
    });

    getEntities().then((res) => {
      const parsed_res = JSON.parse(res);
      for (const entity of parsed_res) {
        if (!entity.is_default) {
          deleteEntity(entity.id);
        }
      }

      this.setState({
        serverCallText: 'All done',
        serverCallInProgress: false
      })
    });
  }

  sync_api_calls(counter, tasks) {
    const total_tasks = tasks.length;
    if (counter >= total_tasks) {
      this.setState({
        tasks,
        serverCallText: 'All done',
        serverCallInProgress: false
      });
      return;
    }

    const next_task = tasks[counter];

    postTask(next_task).then((res) => {
      console.log('Task Added');
      let resp = JSON.parse(res);
      next_task.id = resp.id;

      this.setState({
        serverCallText: 'Creating New Task ' + (counter + 1)
      });

      setTimeout(()=>this.sync_api_calls(++counter, tasks), 1000);
    }).catch((error) => {
      console.log('An error occurred while adding a task')
      setTimeout(()=>this.sync_api_calls(++counter, tasks), 1000);
    });
  }

  createNewTasks() {
    const promises = [];
    let tasks = [];

    this.setState({
      serverCallText: 'Creating New Tasks',
      serverCallInProgress: true
    });

    demoTasks.map((demoTask) => {


    /*{
      "Title": "MOVE David Peterson",
      "StartDate": "Friday",
      "EndDate": "Friday",
      "StartTime": "12:30",
      "EndTime": "17:30",
      "Customer": "David Peterson",
      "Team1": "Penny Angeles",
      "Team2": "Robben Sides",
      "Team3": "NA",
      "Equip": "Truck 3 (44 ft)",
      "Color": "#00bfd8",
      "Instructions": "Use special crates for artwork in living room"
    }*/

      const start_date = moment().day(demoTask.StartDate);
      const start_time = demoTask.StartTime.split(':');
      start_date.set('hour', parseInt(start_time[0]));
      start_date.set('minute', parseInt(start_time[1]));
      let end_datetime = '';
      if (demoTask.EndDate && demoTask.EndTime) {
        const end_date = moment().day(demoTask.EndDate);
        const end_time = demoTask.EndTime.split(':');
        end_date.set('hour', parseInt(end_time[0]));
        end_date.set('minute', parseInt(end_time[1]));
        end_datetime = end_date.format();
      }
      const task = {
        start_datetime: start_date.format(),
        end_datetime: end_datetime,
        title: demoTask.Title
      };

      let entity_ids = '';

      task.details = demoTask.Instructions;
      task.extra_fields = JSON.stringify({
        task_color: demoTask.Color || ''
      });

      if (demoTask.Team1 != 'NA') {
        const teamMember1 = this.lookup_entity(demoTask.Team1);
        if(teamMember1) {
          entity_ids = teamMember1.id.toString();
        }
      }

      if (demoTask.Team2 != 'NA') {
        const teamMember2 = this.lookup_entity(demoTask.Team2);
        if(teamMember2 && entity_ids) {
          entity_ids = entity_ids + ', ' + teamMember2.id.toString();
        } else if (teamMember2) {
          entity_ids = teamMember2.id.toString();
        }
      }

      if (demoTask.Team3 != 'NA') {
        const teamMember3 = this.lookup_entity(demoTask.Team3);
        if(teamMember3 && entity_ids) {
          entity_ids = entity_ids + ', ' + teamMember3.id.toString();
        } else if (teamMember3) {
          entity_ids = teamMember3.id.toString();
        }
      }

      task.entity_ids = entity_ids;

      if (demoTask.Equip != 'NA') {
        const equipment = this.lookup_equipment(demoTask.Equip);
        if(equipment) {
          task.resource_ids = equipment.id.toString();
        }
      }

      const foundCustomer = this.state.customers.find((c) => {
        return c.first_name + ' ' + c.last_name == demoTask.Customer;
      });

      if (foundCustomer) {
        task.customer_id = foundCustomer.id;
        task.customer_first_name = foundCustomer.first_name;
        task.customer_last_name = foundCustomer.last_name;
        task.customer_email = foundCustomer.email;
        task.customer_phone = foundCustomer.phone;
        task.customer_address_line_1 = foundCustomer.address_line_1;
        task.customer_address_line_2 = foundCustomer.address_line_2;
        task.customer_city = foundCustomer.city;
        task.customer_state = foundCustomer.state;
        task.customer_country = foundCustomer.country;
        task.customer_zipcode = foundCustomer.zipcode;
      }else {
        task.customer_first_name = demoTask.customer_first_name;
        task.customer_last_name = demoTask.customer_last_name;
        task.customer_email = demoTask.customer_email;
        task.customer_phone = demoTask.customer_phone;
        task.customer_address_line_1 = demoTask.customer_address_line_1;
        task.customer_city = demoTask.customer_city;
        task.customer_state = demoTask.customer_state;
        task.customer_zipcode = demoTask.customer_zipcode;
      }

      if (demoTask.AllDay) {
        task.all_day = demoTask.AllDay;
      }

      if (demoTask.ActivityType) {
        task.activity_type = demoTask.ActivityType;
      }

      task.template_type = 'TASK';
      if (demoTask.TemplateType) {
        task.template_type = demoTask.TemplateType;
      }

      if (task.template_type === 'ACTIVITY') {
        for (let key in task) {
          if (ACTIVITY_ATTRIBUTES.indexOf(key.toString()) === -1) {
            delete task[key];
          }
        }
      } else {
        for (let key in task) {
          if (TASK_ATTRIBUTES.indexOf(key.toString()) === -1) {
            delete task[key];
          }
        }
      }

      tasks.push(task);
    });
    this.sync_api_calls(0, tasks);
  }

  lookup_entity(entity_name) {
    console.log(entity_name, this.state.entities);

    let entity = null;
    entity = this.state.entities.find((e) => {
      return e.name == entity_name;
    });

    console.log(entity);

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

    const startDate = new Date().getTime() - 10 * day_unit;
    const endDate = new Date().getTime() + 10 * day_unit;

    this.setState({
      serverCallText: 'Deleting Tasks',
      serverCallInProgress: true
    });

    getTasks({ startDate, endDate, viewType: 'week' }).then((res) => {
      const parsed_res = JSON.parse(res);
      for (const task of parsed_res) {
        deleteTask(task.id);
      }

      this.setState({
        serverCallText: 'All done',
        serverCallInProgress: false
      });
    });
  }

  createEntitiesAndTasks() {
    const test_account_email_1 = 'test1-' + this.state.account_email;
    const test_account_name_1  = 'test1-' + this.state.account_name;
    const test_account_email_2 = 'test2-' + this.state.account_email;
    const test_account_name_2  = 'test2-' + this.state.account_name;
    let test_account_id_1 = 1;
    let test_account_id_2 = 2;

    createEntity({
      name: test_account_name_1,
      type: test_account_name_1,
      email: test_account_email_1
    }).then((res) => {
      test_account_id_1 = JSON.parse(res).id;
      console.log(test_account_id_1);
      register({
        fullname: test_account_name_1,
        email: test_account_email_1,
        password: 'test123'
      });

      return createEntity({
        name: test_account_name_2,
        type: test_account_name_2,
        email: test_account_email_2
      }).then((res2) => {
        test_account_id_2 = JSON.parse(res2).id;
        console.log(test_account_id_2);
        register({
          fullname: test_account_name_2,
          email: test_account_email_2,
          password: 'test123'
        }).then((res3) => {
          this.createTasks(test_account_id_1, test_account_id_2);
        });
      });
    });
  }

  createTasks(test_account_id_1, test_account_id_2) {
    const min_unit = 60 * 1000;
    const hour_unit = 60 * min_unit;
    const day_unit = 24 * hour_unit;

    let date_time = new Date().getTime() - 3 * day_unit;

    for (let i = 0; i < 16; i++) {
      date_time = date_time + i * hour_unit;
      let start_datetime = moment(date_time).format();
      let end_datetime = moment(date_time + 6e6).format();
      const task = {
        start_datetime,
        end_datetime,
        title: 'Test Task for ' + test_account_id_1 + date_time.toString(),
        entity_ids
      };

      let entity_ids = '';
      if (i % 4 === 0) {
        task.customer_first_name = "Steve Smith";
        task.customer_last_name = "King";
        task.customer_email = "sobanhameed@gmail.com";
        task.customer_phone = "";
        task.customer_address_line_1 = "12040 NE 128th St";
        task.customer_address_line_2 = "Office# 100";
        task.customer_city = "Kirkland";
        task.customer_state = "WA";
        task.customer_country = "USA";
        task.customer_zipcode = "98034";
        task.details = "This is a hospital location. \nEnter through main lobby and leave the items to the left of reception";
        task.extra_fields = JSON.stringify({
          price: "100",
          hourly_rate: "50 per hour",
          task_color: "#7bdeee"
        });
        task.entity_ids = test_account_id_1.toString();
      } else if (i % 4 === 1) {
        task.customer_first_name = "John";
        task.customer_last_name = "Dixon";
        task.customer_email = "sobanhameed@gmail.com";
        task.customer_phone = "+";
        task.customer_address_line_1 = "12040 NE 128th St";
        task.customer_city = "Kirkland";
        task.customer_state = "WA";
        task.customer_country = "USA";
        task.customer_zipcode = "98034";
        task.details = "This is a hospital location. \nEnter through main lobby and leave the items to the left of reception";
        task.extra_fields = JSON.stringify({
          task_color: "#eb144c",
          destination_address_1: "16357 118th ln ne Bothell WA 98011"
        });
        task.entity_ids = test_account_id_1.toString() + ', ' + test_account_id_2.toString();
      } else if (i % 4 === 2) {
        task.customer_first_name = "Keith Alexandar Minescu";
        task.customer_last_name = "";
        task.customer_phone = "+1-4255333945";
        task.customer_address_line_1 = "12040 NE 128th St";
        task.customer_city = "Kirkland";
        task.customer_state = "WA";
        task.customer_country = "USA";
        task.customer_zipcode = "98034";
        task.details = "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, \nthat they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who \nfail in their duty through weakness of will, which is\n the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.";
        task.extra_fields = JSON.stringify({
          task_color: "#eb144c",
          destination_address_1: "16357 118th ln ne Bothell WA 98011"
        });
        task.entity_ids = test_account_id_2.toString();
      }



      postTask(task).then((res) => {
        console.log(res);
      });
    }
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

    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <DefaultHelmet/>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        <div className={styles['page-wrap']}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile} />
          <h1>Logged in as: {this.state.company_name && this.state.company_name}</h1>
          <div style={{padding: '20px 0px'}}>
            <Button onClick={this.createNewEntities}> Create Entities </Button>
            <Button onClick={this.deleteEntities}> Delete Entities </Button>
          </div>
          <div style={{padding: '20px 0px'}}>
            <Button onClick={this.createNewEquipments}> Create Equipments </Button>
            <Button onClick={this.deleteEquipments}> Delete Equipments </Button>
          </div>
          <div style={{padding: '20px 0px'}}>
            <Button onClick={this.createNewCustomers}> Create Customers </Button>
            <Button onClick={this.deleteCustomers}> Delete Customers </Button>
          </div>
          <div style={{padding: '20px 0px'}}>
            <Button onClick={this.createNewTasks}> Create Tasks </Button>
            <Button onClick={this.deleteTasks}> Delete Tasks </Button>
          </div>
          {this.state.serverCallInProgress && <SavingSpinner title={this.state.serverCallText} />}
        </div>
        <div className={styles.footer}>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

Dashboard.contextTypes = {
  router: PropTypes.object.isRequired
};
