import React, { Component } from 'react';
import Helmet from 'react-helmet';

export default function DefaultHelmet() {
	const title = 'Arrivy | Deliver Perfect Customer Experiences | Connect with customers in real-time and engage them through the last mile';

	const description = 'Arrivy platform enables businesses to connect with their customers in real-time and engage them through the last-mile for service appointments and deliveries.';

	const image = 'https://www.arrivy.com/images/logo-dark.png';
	return <Helmet
		title={title}
		defaultTitle={title}
		meta={[
			{ name: 'description', description },
			{ property: 'og:title', content: title },
			{ property: 'og:description', content: description },
			{ property: 'og:image', content: image },
      { property: 'og:type', content: 'website' }
		]}
	/>;
}