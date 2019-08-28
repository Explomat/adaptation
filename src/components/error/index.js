import React from 'react';
import { Alert } from 'antd';

const ErrorAlert = ({ message, description }) => {
	return (
			<Alert
				message={message}
				description={description}
				type='danger'
			/>
	);
}

export default ErrorAlert;