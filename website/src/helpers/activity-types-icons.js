import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faClock, faEnvelope, faStickyNote, faListAlt, faPhone} from "@fortawesome/fontawesome-free-solid";
import {faCalendarAlt} from "@fortawesome/fontawesome-free-regular";
import React from "react";

export const activityTypes = [
                {name :'Note', type: 'NOTE' , icon : (<FontAwesomeIcon  icon={faStickyNote} />)},
                {name :'Call', type: 'CALL' , icon : (<FontAwesomeIcon icon={faPhone} />)},
                {name :'Appt', type: 'APPOINTMENT' , icon : (<FontAwesomeIcon  icon={faCalendarAlt} />)},
                {name :'To-Do', type: 'TO_DO' , icon : (<FontAwesomeIcon  icon={faListAlt} />)},
                {name :'Break', type: 'BREAK' , icon : (<FontAwesomeIcon c icon={faClock} />)},
                {name :'Email', type: 'EMAIL' , icon : (<FontAwesomeIcon  icon={faEnvelope} />)},
        ];