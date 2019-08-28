function getManagerTypes(){
	return {
		manager: 'adaptation:manager',
		curator: 'adaptation:curator'
	}
}

function getById(id){
	return ArrayOptFirstElem(XQuery("for $el in collaborators where $el/id = " + id + " return $el"));
}

function getRole(userId, crId){
	var q = ArrayOptFirstElem(XQuery('for $el in career_reserves where $el/id = ' + crId + ' and $el/person_id = ' + userId + ' and $el/status = \'active\' return $el'));
	if (q != undefined) {
		return OpenDoc(UrlFromDocID(Int(q.person_id))).TopElem.access.access_role;
	}

	if (crId != undefined){
		var crdoc = OpenDoc(UrlFromDocID(Int(crId)));
		var tutor = ArrayOptFind(crdoc.TopElem.tutors, 'This.person_id == ' + userId);
		if (tutor != undefined) {
			return String(tutor.boss_type_id.OptForeignElem.code);
		}
	}

	var udoc = OpenDoc(UrlFromDocID(Int(userId)));
	if (udoc.TopElem.access.access_role == 'admin') {
		return String(udoc.TopElem.access.access_role);
	}
}

function getActionsByRole(role, stepId){
	var o = [];
	var strq = " \n\
		select \n\
			ans.name, \n\
			ans.title \n\
		from cc_adaptation_role_operations ars \n\
		inner join cc_adaptation_operations ans on ans.id = ars.operation_id \n\
		where \n\
			ars.role = '" + role + "'";
	if (stepId != undefined){
		strq = strq + " and step = " + Int(stepId)
	}

	var q = XQuery("sql: " + strq);
	for (el in q){
		o.push({
			name: String(el.name),
			title: String(el.title)
		});
	}
	return o;
}

function newObject(userId){
	var o = getById(userId);
	return o;
}

