

export function createBaseUrl(action_name){
	action_name = action_name || '';

	const baseUrl =
		process.env.NODE_ENV === 'production' ?
			window.location.protocol + '//192.168.73.37/custom_web_template.html' : window.location.protocol + '//192.168.73.37/custom_web_template.html' //`${window.location.protocol}//${window.location.host}/custom_web_template.html`;

	window.routerId = '6727531844004172765';
	window.serverId = '6727526001436286031';
	return `${baseUrl}?object_id=${window.routerId}&server_id=${window.serverId}&action_name=${action_name}&r=${(new Date()).getTime()}`
}

const request = action_name => {
	const _url = createBaseUrl(action_name);

	return {
		get: (params = {}, config) => {
			const url = new URL(_url);
			Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
			return fetch(url, config);
		},
		post: (data, config) => {
			return fetch(_url, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				},
				...config
			}).then(r => r.json());
		}
	}
}

export default request;