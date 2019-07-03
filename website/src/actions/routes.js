import ajaxPromise from './ajaxPromise';
import moment from 'moment';
import {error_catch} from '../helpers/error_catch';
export const getRoutes = ({ startDate, endDate, getAjaxCall = null }) => {
	let fSD = moment(startDate).startOf('day');
	let fED = moment(endDate).endOf('day');
	fSD = fSD.format().replace('+', '%2B');
	fED = fED.format().replace('+', '%2B');

	const uri = `/api/task_routes?from=${fSD}&to=${fED}`;

	return ajaxPromise({
		url: uri,
		type: 'GET',
	}, getAjaxCall).catch((error) => {
		error_catch(error);
	});
};
