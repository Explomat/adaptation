function toJSON(data){
	return tools.object_to_text(data, 'json');
}

function log(message){
	EnableLog('adaptation');
	LogEvent('adaptation', message);
}

function setMessage(type, message){
	return {
		type: type,
		message: message
	}
}

function setSuccess(data){
	var m = setMessage('success');
	m.data = data;
	return m;
}

function setError(message){
	log(message);
	return setMessage('error', message);
}

function notificate(templateCode, primaryId, text, secondaryId){
	tools.create_notification(templateCode, primaryId, text, secondaryId);
}