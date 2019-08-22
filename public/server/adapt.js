
function getCurrentStep(crid){
	return ArrayOptFirstElem(XQuery("sql: \n\
		select \n\
			ca.id, \n\
			ca.collaborator_id, \n\
			ca.object_id, \n\
			ca.step_id \n\
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
	return ArrayOptFirstElem(XQuery('for $el in career_reserves where $el/id = \'' + crId + '\' return $el'));
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
			distinct(c.career_reserve_id), \n\
			cs.id tutor_id, \n\
			cs.fullname, \n\
			cs.position_name, \n\
			cs.position_parent_name \n\
		from ( \n\
			select \n\
				c.career_reserve_id, \n\
				t.p.query('boss_type_id').value('.','varchar(50)') boss_type_id, \n\
				t.p.query('person_id').value('.','varchar(50)') tutor_id \n\
			from career_reserves crs \n\
			inner join ( \n\
				select crt.career_reserve_id \n\
				from career_reserve_tutors crt \n\
				where (crt.tutor_id = " + userId + " or 'admin' = '" + userRole + "') \n\ 
			) c on c.career_reserve_id = crs.id \n\
			inner join career_reserve cr on cr.id = crs.id \n\
			cross apply cr.data.nodes('/career_reserve/tutors/tutor') as t(p) \n\
		) c \n\
		inner join boss_types bt on bt.id = c.boss_type_id \n\
		inner join collaborators cs on cs.id = c.tutor_id \n\
		where bt.code = '" + bossTypes.curator + "' \n\
	");
}

function newObject(param){
	var type = DataType(param);
	var docCr = type == 'integer' ? OpenDoc(UrlFromDocID(Int(param))) : (type == 'object' ? param : null);
	if (docCr == null){
		throw 'Parameter type not defined';
	}

	var id = docCr.TopElem.AddDynamicChild('id', 'integer');
	id.Value = docCr.DocID;

	var person = docCr.TopElem.person_id.OptForeignElem;
	var personFullname = docCr.TopElem.AddDynamicChild('person_fullname', 'string');
	personFullname.Value = person.fullname;
	var personPositionName = docCr.TopElem.AddDynamicChild('person_position_name', 'string');
	personPositionName.Value = person.position_name;

	var tasks = XQuery("for $el in cc_adaptation_tasks where $el/career_reserve_id = " + docCr.DocID + " return $el");
	for (t in tasks) {
		var tt = ArrayOptFind(docCr.TopElem.tasks, 'This.id == \'' + t.object_id + '\'');
		if (tt != undefined) {
			tpc = tt.AddDynamicChild('transitinal_percent_complete', 'string');
			tpc.Value = String(t.transitinal_percent_complete);
			fpc = tt.AddDynamicChild('final_percent_complete', 'string');
			fpc.Value = String(t.final_percent_complete);
		}
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
		adaptation: docCr.TopElem,
		steps: steps,
		mainSteps: mainSteps
	}
}