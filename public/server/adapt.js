function getCrByPersonId(personId){
	return XQuery("for $el in career_reserves where $el/person_id = " + personId + " return $el");
}

function getAssessments(){
	return XQuery("sql: \n\
		select \n\
			convert(varchar(max), aas.id) id, \n\
			aas.name, \n\
			aas.description, \n\
			aas.color \n\
		from cc_adaptation_assessments aas \n\
	");
}

function getCurrentStep(crid){
	return ArrayOptFirstElem(XQuery("sql: \n\
		select \n\
			ca.id, \n\
			ca.collaborator_id, \n\
			ca.object_id, \n\
			ca.step_id, \n\
			ast.order_number, \n\
			ams.title as main_step \n\
		from \n\
			cc_custom_adaptations ca \n\
		inner join cc_adaptation_steps ast on ast.id = ca.step_id \n\
		inner join cc_adaptation_main_steps ams on ams.id = ca.main_step_id \n\
		where \n\
			ca.career_reserve_id = " + crid + " \n\
			and ca.is_active_step = 1 \n\
	"));
}

function getProcessSteps(role, stepId, action){
	return XQuery("sql: \n\
		select \n\
			ars.id, \n\
			ars.operation_id, \n\
			ars.next_step, \n\
			ars.role, \n\
			case \n\
			when ars.next_role is not null then ars.next_role \n\
			when ars.next_role is null then ars.role \n\
			end next_role, \n\
			ars.step, \n\
			ast.order_number next_step_order_number \n\
		from \n\
			cc_adaptation_role_operations ars \n\
		inner join cc_adaptation_operations aps on aps.id = ars.operation_id \n\
		inner join cc_adaptation_steps ast on ast.id = ars.next_step \n\
		where \n\
			ars.role = '" + role + "' \n\
			and ars.step = " + stepId + " \n\
			and aps.name = '" + action + "' \n\
		order by ast.order_number asc \n\
	");
}


function getNextUserId(crId, role){
	var doc = OpenDoc(UrlFromDocID(Int(crId)));

	var udoc = OpenDoc(UrlFromDocID(Int(doc.TopElem.person_id)));
	if (udoc.TopElem.access.access_role == role){
		return doc.TopElem.person_id;
	}

	for (el in doc.TopElem.tutors){
		if (el.boss_type_id.OptForeignElem.code == role){
			return el.person_id;
		}
	}

	return null;
}

function createStep(prevDocId, params){
	var caDoc = OpenDoc(UrlFromDocID(Int(prevDocId)));
	caDoc.TopElem.is_active_step = false;
	caDoc.Save();

	var doc = tools.new_doc_by_name('cc_custom_adaptation');
	doc.TopElem.AssignElem(caDoc.TopElem);
	doc.TopElem.created_date = new Date();
	doc.TopElem.is_active_step = true;
	doc.TopElem.data = null;

	for (el in params){
		child = doc.TopElem.OptChild(el);
		child.Value = params[el];
	}
	doc.BindToDb(DefaultDb);
	doc.Save();
	return doc;
}

function getById(crId){
	return ArrayOptFirstElem(XQuery('for $el in career_reserves where $el/id = ' + crId + ' return $el'));
}

function isAccessToView(userId, doc, crid){
	if (doc == null){
		doc = OpenDoc(UrlFromDocID(Int(crid)));
	}

	var User = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/user.js');
	DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/user.js');
	
	var urole = User.getRole(userId, doc.DocID);
	return (
		(doc.TopElem.person_id == userId) ||
		(ArrayOptFind(doc.TopElem.tutors, 'This.person_id == ' + userId) != undefined) ||
		urole == 'admin'
	);
}

function getCurators(userId, userRole){
	var User = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/user.js');
	DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/user.js');

	var bossTypes = User.getManagerTypes();
	// если админ, то должен видеть всех кураторов

	return XQuery("sql: \n\
		select \n\
			--distinct(c.career_reserve_id), \n\
			distinct(cs.id) tutor_id, \n\
			cs.fullname, \n\
			cs.position_name, \n\
			cs.position_parent_name \n\
		from ( \n\
			select \n\
				c.career_reserve_id, \n\
				t.p.query('person_id').value('.','varchar(50)') tutor_id, \n\
				t.p.query('boss_type_id').value('.','varchar(50)') boss_type_id \n\
			from career_reserves crs \n\
			inner join ( \n\
				select \n\
					crt.career_reserve_id, \n\
					crt.tutor_id \n\
				from career_reserve_tutors crt \n\
				where (crt.tutor_id = " + userId + " or 'admin' = '" + userRole + "') \n\
			) c on c.career_reserve_id = crs.id \n\
			inner join career_reserve cr on cr.id = crs.id \n\
			cross apply cr.data.nodes('/career_reserve/tutors/tutor') as t(p) \n\
			where t.p.exist('person_id[text()[1] = " + userId + "]') <> 1 \n\
		) c \n\
		inner join boss_types bt on bt.id = c.boss_type_id \n\
		inner join collaborators cs on cs.id = c.tutor_id \n\
		where \n\
			bt.code = '" + bossTypes.curator + "' \n\
			and tutor_id <> " + userId + " \n\
	");
}

function newObject(param){
	var type = DataType(param);
	var docCr = type == 'integer' ? OpenDoc(UrlFromDocID(Int(param))) : (type == 'object' ? param : null);
	if (docCr == null){
		throw 'Parameter type not defined';
	}

	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select \n\
			crs.id, \n\
			crs.name, \n\
			crst.name status, \n\
			crs.person_id, \n\
			crs.person_fullname, \n\
			crs.person_position, \n\
			crs.start_date, \n\
			crs.plan_readiness_date, \n\
			crs.finish_date, \n\
			ads.title current_step, \n\
			ams.id main_step_id, \n\
			ams.description as main_step \n\
		from career_reserves crs \n\
		inner join [common.career_reserve_status_types] crst on crst.id = crs.status \n\
		inner join cc_custom_adaptations cas on cas.career_reserve_id = crs.id \n\
		inner join cc_adaptation_steps ads on ads.id = cas.step_id \n\
		inner join cc_adaptation_main_steps ams on ams.id = cas.main_step_id \n\
		where \n\
			crs.id = " + docCr.DocID + " \n\
			and cas.is_active_step = 1 \n\
	"));

	var startDate = q.start_date;
	var sd = String(q.start_date);
	var prd = String(q.plan_readiness_date);
	var fd = String(q.finish_date);

	try {
		sd = StrXmlDate(Date(sd));
	} catch(e){}
	try {
		prd = StrXmlDate(Date(prd));
	} catch(e){}
	try {
		fd = StrXmlDate(Date(fd));
	} catch(e){}

	var docq = {
		id: String(q.id),
		name: String(q.name),
		status: String(q.status),
		person_id: String(q.person_id),
		person_fullname: String(q.person_fullname),
		person_position: String(q.person_position),
		start_date: sd,
		plan_readiness_date: prd,
		finish_date: fd,
		current_step: String(q.current_step),
		main_step: String(q.main_step),
		main_step_id: String(q.main_step_id)
	}

	docq.tasks = [];
	docq.tutors = [];

	for (el in docCr.TopElem.tasks){
		docq.tasks.push({
			id: String(el.id),
			name: String(el.name),
			status: String(el.status),
			type: String(el.type)
		});
	}

	var tasks = XQuery("for $el in cc_adaptation_tasks where $el/career_reserve_id = " + docCr.DocID + " return $el");
	for (t in tasks) {
		tt = ArrayOptFind(docq.tasks, 'This.id == \'' + t.object_id + '\'');
		if (tt != undefined) {
			tt['achieved_result'] = String(t.achieved_result); //достигнутый результат
			tt['expected_result'] = String(t.expected_result); //ожидаемый результат
			try {
				tt['manager_assessment'] = String(t.manager_assessment);
			} catch(e) {
				tt['manager_assessment'] = '';
			}
			try {
				tt['collaborator_assessment'] = String(t.collaborator_assessment);
			} catch(e) {
				tt['collaborator_assessment'] = '';
			}
			try {
				tt['created_date'] = StrXmlDate(Date(t.created_date));
			} catch(e) {
				tt['created_date'] = '';
			}	
		}
	}

	for (t in docCr.TopElem.tutors) {
		q = ArrayOptFirstElem(XQuery("sql: \n\
			select name \n\
			from boss_types \n\
			where id = " + t.boss_type_id + " \n\
		"));
		docq.tutors.push({
			person_id: String(t.person_id),
			person_fullname: String(t.person_fullname),
			person_position_name: String(t.person_position_name),
			boss_type_name: (q != undefined ? String(q.name) : '')
		});
	}

	var crs = getCrByPersonId(docCr.TopElem.person_id);
	var steps = [];
	for (el in crs){
		s = XQuery("sql: \n\
			select \n\
				cad.id, \n\
				atp.title [type], \n\
				cs1.fullname [collaborator], \n\
				cs2.fullname [object], \n\
				asp.title [step], \n\
				ams.description [main_step], \n\
				cad.created_date, \n\
				cad.data \n\
			from \n\
				cc_custom_adaptations cad \n\
			inner join cc_adaptation_types atp on atp.id = cad.type_id \n\
			inner join collaborators cs1 on cs1.id = cad.collaborator_id \n\
			inner join collaborators cs2 on cs2.id = cad.object_id \n\
			inner join cc_adaptation_steps asp on asp.id = cad.step_id \n\
			inner join cc_adaptation_main_steps ams on ams.id = cad.main_step_id \n\
			where \n\
				cad.career_reserve_id = " + el.id + " \n\
			order by cad.created_date desc \n\
		");
		steps.push({
			id: String(el.id),
			name: String(el.name),
			history: s
		});
	}


	var mainSteps = XQuery("sql: \n\
		select \n\
			convert(varchar(max), ams.id) id, \n\
			ams.description, \n\
			ams.duration, \n\
			ams.title, \n\
			ams.type_id \n\
		from cc_adaptation_main_steps ams \n\
		order by ams.duration asc \n\
	");

	var ms = [];

	for (s in mainSteps){
		obj = {
			id: String(s.id),
			description: String(s.description),
			duration: String(s.duration),
			title: String(s.title),
			type_id: String(s.type_id),
			date: StrXmlDate(Date(startDate))
		}

		if (s.duration == '0'){
			obj.date = StrXmlDate(Date(startDate));
		} else {
			d = OptInt(s.duration);
			if (d != undefined){
				_date = new Date(startDate);
				nextMonth = (Month(new Date(_date)) % 12) + d;
				nextDay = Day(_date);
				nextYear = Year(_date);
				if (nextMonth == 1) {
					nextYear = nextYear + 1;
				}

				if (nextMonth == 2 && nextDay > 28){
					nextDay = 28;
					if ((nextYear % 4) == 0) { //високосный
						nextDay = 29;
					}
				}
				obj.date = StrXmlDate(Date(nextDay + '.' + nextMonth + '.' + nextYear));
			}
		}

		ms.push(obj);
	}

	return {
		card: docq,
		steps: steps,
		mainSteps: ms
	}
}