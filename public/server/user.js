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
			distinct(ans.name), \n\
			ans.title, \n\
			ans.allow_additional_data \n\
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
			title: String(el.title),
			allow_additional_data: String(el.allow_additional_data)
		});
	}
	return o;
}

function getTutorRoles(tutorId, role){
	var strq = " \n\
		select \n\
			distinct(bt.code), \n\
			bt.name \n\
		from ( \n\
			select \n\
				t.p.query('boss_type_id').value('.','varchar(50)') boss_type_id, \n\
				t.p.query('person_id').value('.','varchar(50)') tutor_id \n\
			from  \n\
				career_reserves crs \n\
			inner join career_reserve cr on cr.id = crs.id \n\
			cross apply cr.data.nodes('/career_reserve/tutors/tutor') as t(p) \n\
		) c \n\
		inner join boss_types bt on bt.id = c.boss_type_id \n\
		where \n\
			c.tutor_id = " + tutorId + " \n\
	";
	if (role != undefined){
		strq = strq + " and and bt.code = '" + role + "'"
	}

	return XQuery("sql: " + strq);
}

function newObject(userId){
	var o = getById(userId);
	return o;
}

