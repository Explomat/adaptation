
function getCurrentStep(crid){
	return ArrayOptFirstElem(XQuery("sql: \n\
		select \n\
			ca.id, \n\
			ca.collaborator_id, \n\
			ca.object_id, \n\
			ca.step_id, \n\
			ast.order_number \n\
		from \n\
			cc_custom_adaptations ca \n\
		inner join cc_adaptation_steps ast on ast.id = ca.step_id \n\
		where \n\
			ca.career_reserve_id = " + crid + " \n\
			and ca.is_active_step = 1 \n\
	"));
}

function getProcessStep(role, stepId, action){
	return ArrayOptFirstElem(XQuery("sql: \n\
		select \n\
			ars.* \n\
		from \n\
			cc_adaptation_role_operations ars \n\
		inner join cc_adaptation_operations aps on aps.id = ars.operation_id \n\
		where \n\
			ars.role = '" + role + "' \n\
			and ars.step = " + stepId + " \n\
			and aps.name = '" + action + "' \n\
	"));
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
			c.career_reserve_id, \n\
			cs.id tutor_id, \n\
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
			crs.finish_date \n\
		from career_reserves crs \n\
		inner join [common.career_reserve_status_types] crst on crst.id = crs.status \n\
		where crs.id = " + docCr.DocID + " \n\
	"));

	var docq = {
		id: String(q.id),
		name: String(q.name),
		status: String(q.status),
		person_id: String(q.person_id),
		person_fullname: String(q.person_fullname),
		person_position: String(q.person_position),
		start_date: DateNewTime(q.start_date),
		plan_readiness_date: DateNewTime(q.plan_readiness_date),
		finish_date:DateNewTime(q.finish_date)
	}

	docq.tasks = [];
	docq.tutors = [];

	for (el in docCr.TopElem.tasks){
		docq.tasks.push({
			id: String(el.id),
			name: String(el.name),
			status: String(el.status),
			type: String(el.type),
			desc: String(el.desc)
		});
	}

	var tasks = XQuery("for $el in cc_adaptation_tasks where $el/career_reserve_id = " + docCr.DocID + " return $el");
	for (t in tasks) {
		var tt = ArrayOptFind(docq.tasks, 'This.id == \'' + t.object_id + '\'');
		if (tt != undefined) {
			tt['transitinal_percent_complete'] = String(t.transitinal_percent_complete);
			tt['final_percent_complete'] = String(t.final_percent_complete);
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

	var steps = XQuery("sql: \n\
		select \n\
			cad.id, \n\
			atp.title [type], \n\
			cs1.fullname [collaborator], \n\
			cs2.fullname [object], \n\
			asp.title [step], \n\
			ams.description [main_step] \n\
		from \n\
			cc_custom_adaptations cad \n\
		inner join cc_adaptation_types atp on atp.id = cad.type_id \n\
		inner join collaborators cs1 on cs1.id = cad.collaborator_id \n\
		inner join collaborators cs2 on cs2.id = cad.object_id \n\
		inner join cc_adaptation_steps asp on asp.id = cad.step_id \n\
		inner join cc_adaptation_main_steps ams on ams.id = cad.main_step_id \n\
		where \n\
			cad.career_reserve_id = " + docCr.DocID + " \n\
	");

	var mainSteps = XQuery("for $el in cc_adaptation_main_steps return $el");

	return {
		card: docq,
		steps: steps,
		mainSteps: mainSteps
	}
}