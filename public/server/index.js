<%//Server.Execute(AppDirectoryPath() + '/wt/web/include/access_init.html');
//curUserID = 6719948502038810952; // Volk
//curUserID = 6719948317677868197 // Zayts
//curUserID = 6719948498605842349; //Markin
curUserID = 6711785032659205612; //Me
//curUserID = 6719948520442319663; //Kazina

var Adaptation = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');
DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');

var Task = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/task.js');
DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/task.js');

var Utils = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/utils.js');
DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/utils.js');

var User = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/user.js');
DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/user.js');


function get_Adaptations(queryObjects){
	function getTutorsCards(tId, tRole){
		return XQuery("sql: \n\
			select \n\
				c.id, \n\
				c.name, \n\
				c.status, \n\
				c.[type] \n\
			from ( \n\
				select \n\ 
					distinct(crs.id), \n\ 
					cs.fullname + ' (' + cs.position_name + ')' [name], \n\
					crst.name status, \n\
					ccac.title [type], \n\
					t.p.query('boss_type_id').value('.','varchar(50)') boss_type_id, \n\
					t.p.query('person_id').value('.','varchar(50)') tutor_id \n\
				from  \n\
					career_reserves crs \n\
				inner join career_reserve cr on cr.id = crs.id \n\
				inner join collaborators cs on cs.id = crs.person_id \n\
				inner join cc_custom_adaptations cas on cas.career_reserve_id = crs.id \n\
				inner join cc_adaptation_types ccac on ccac.id = cas.type_id \n\
				inner join [common.career_reserve_status_types] crst on crst.id = crs.status \n\
				cross apply cr.data.nodes('/career_reserve/tutors/tutor') as t(p) \n\
			) c \n\
			inner join boss_types bt on bt.id = c.boss_type_id \n\
			where \n\
				c.tutor_id = " + Int(tId) + " \n\
				and bt.code = '" + tRole + "' \n\
		");
	}

	function isAlowEditTasks(curStep, userRole){
		return (Int(curStep.object_id) == curUserID || userRole == 'admin');
	}

	function isUser(crdoc, userRole){
		return ((crdoc.TopElem.person_id == curUserID) || (userRole == 'admin'));
	}

	function isManager(userRole){
		var btypes = User.getManagerTypes();
		return (userRole == btypes.manager || (userRole == 'admin'))
	}

	function isEditAdaptation(_crDoc, _currentStep) {
		var lastMainStep = Adaptation.getLastMainStep();
		var lastStepInMain = Adaptation.getLastStepByMainStepId(_crDoc.DocID, _currentStep.main_step);
		
		if (
			_currentStep.main_step == lastMainStep.order_number 
			&& _currentStep.order_number == lastStepInMain.order_number
		) {
			return false;
		}
		return true;
	}

	function toResponse(crdoc){
		var currentStep = Adaptation.getCurrentStep(crdoc.DocID);
		var urole = User.getRole(curUserID, crdoc.DocID);
		var uactions = User.getActionsByRole(urole, currentStep.step_id);

		var data = Adaptation.newObject(crdoc);
		var isEditAdapt = isEditAdaptation(crdoc, currentStep);
		var isEdit = isAlowEditTasks(currentStep, urole);
		var ats = Adaptation.getAssessments();
		var isStep = OptInt(currentStep.main_step) > 0;
		var isUserOrManager = (isUser(crdoc, urole) || isManager(urole));

		data.meta = {
			actions: uactions,
			assessments: ats,
			is_show_assessments: isEdit && isStep && isUserOrManager,
			allow_edit_target: isEditAdapt && OptInt(currentStep.main_step) == 0 && isEdit && isUserOrManager, // цель
			allow_edit_expected_result: isEditAdapt && OptInt(currentStep.main_step) == 0 && isEdit && isUserOrManager, // ожидаемый результат
			allow_edit_achieved_result: isEditAdapt && isEdit && isStep && isUserOrManager, // Достигнутый результат
			allow_edit_tasks: isEditAdapt && isEdit,
			allow_edit_collaborator_assessment: isEditAdapt && (isEdit && isStep && isUser(crdoc, urole)),
			allow_edit_manager_assessment: isEditAdapt && (isEdit && isStep && isManager(urole))
		}
		return data;
	}

	var id = queryObjects.HasProperty('id') ? Trim(queryObjects.id) : undefined;
	if (id != undefined){
		var cr = Adaptation.getById(id);
		if (cr != undefined){
			crdoc = OpenDoc(UrlFromDocID(Int(cr.id)));
			if (Adaptation.isAccessToView(curUserID, crdoc)) {
				var data = toResponse(crdoc);
				return Utils.toJSON(Utils.setSuccess(data));
			} else {
				return Utils.toJSON(Utils.setError('You don\'t have permissions to this adaptation'));
			}
		} else {
			return Utils.toJSON(Utils.setError('Adaptation with id: \'' + id + '\' not found.'));
		}
	}

	var isTutor = queryObjects.HasProperty('is_tutor') ? Trim(queryObjects.is_tutor) : undefined;
	if (isTutor == 'true'){
		var tutorId = queryObjects.HasProperty('tutor_id') ? Trim(queryObjects.tutor_id) : curUserID;
		if (tutorId == 'undefined' || tutorId == '') {
			tutorId = curUserID;
		}


		var bossTypes = User.getManagerTypes();
		var tutorRole = queryObjects.HasProperty('tutor_role') ? Trim(queryObjects.tutor_role) : bossTypes.curator;
		var isCurator =  queryObjects.HasProperty('is_curator') ? Trim(queryObjects.is_curator) : undefined;
		if (tutorRole == 'undefined' || tutorRole == '' || isCurator == 'true') {
			tutorRole = bossTypes.curator;
		}

		var curatorCards = getTutorsCards(Int(tutorId), tutorRole);

		var isAll =  queryObjects.HasProperty('all') ? Trim(queryObjects.all) : undefined;
		if (ArrayCount(curatorCards) == 0 && isAll == 'true' && isCurator == 'false') {
			tutorRole = bossTypes.manager;
			curatorCards = getTutorsCards(Int(tutorId), tutorRole);
		}

		var ucurator = User.getById(Int(tutorId));
		var tutorRoles = User.getTutorRoles(tutorId);
		return Utils.toJSON(Utils.setSuccess({
			cards: curatorCards,
			curator_fullname: String(ucurator.fullname),
			tutorRoles: tutorRoles,
			currentTutorRole: tutorRole
		}));
	}

	var q = XQuery("sql: \n\
		select \n\
			distinct(crs.id), \n\
			cs.fullname + ' (' + cs.position_name + ')' [name], \n\
			crst.name [status], \n\
			ccac.title [type] \n\
		from career_reserves crs \n\
		inner join [common.career_reserve_status_types] crst on crst.id = crs.status \n\
		inner join collaborators cs on cs.id = crs.person_id \n\
		inner join cc_custom_adaptations ccca on ccca.career_reserve_id = crs.id \n\
		inner join cc_adaptation_types ccac on ccac.id = ccca.type_id \n\
		where \n\
			crs.person_id = " + curUserID + " \n\
	");
	return Utils.toJSON(Utils.setSuccess(q));
}

function get_Curators(queryObjects){
	var urole = User.getRole(curUserID);
	//alert('urole: ' + urole);
	var curators = Adaptation.getCurators(curUserID, urole);
	return Utils.toJSON(Utils.setSuccess(curators));
}

function get_Users(queryObjects){
	var userId = queryObjects.HasProperty('user_id') ? Trim(queryObjects.user_id) : curUserID;
	var user = User.newObject(userId);
	return Utils.toJSON(Utils.setSuccess(user));
}

function post_Task(queryObjects){
	var crId = queryObjects.HasProperty('cr_id') ? Trim(queryObjects.cr_id) : undefined;
	var taskId = queryObjects.HasProperty('task_id') ? Trim(queryObjects.task_id) : undefined;
	var data = tools.read_object(queryObjects.Body);
	var task = null;

	if (crId == undefined){
		return Utils.toJSON(Utils.setError('Invalid parametres'));
	}

	if (taskId != undefined){
		task = Task.update(crId, taskId, data);
		return Utils.toJSON(Utils.setSuccess(task));
	}

	task = Task.create(crId, data);
	return Utils.toJSON(Utils.setSuccess(task));
}

function delete_Task(queryObjects){
	var crId = queryObjects.HasProperty('cr_id') ? Trim(queryObjects.cr_id) : undefined;
	var taskId = queryObjects.HasProperty('task_id') ? Trim(queryObjects.task_id) : undefined;

	if (crId == undefined){
		return Utils.toJSON(Utils.setError('Invalid parametres'));
	}
	if (taskId != undefined){
		Task.remove(crId, taskId);
		return Utils.toJSON(Utils.setSuccess());
	}

	return Utils.toJSON(Utils.setError('Invalid parametres'));
}

function post_changeStep(queryObjects){
	var crid = queryObjects.HasProperty('cr_id') ? Trim(queryObjects.cr_id) : undefined;

	if (crid == undefined){
		return Utils.toJSON(Utils.setError('Invalid parametres'));
	}

	var isAccess = Adaptation.isAccessToView(curUserID, null, crid);
	if (!isAccess){
		return Utils.toJSON(Utils.setError('You don`t have permissions to this document'));
	}

	var data = tools.read_object(queryObjects.Body);
	var action = data.HasProperty('action') ? data.action : undefined;
	if (action == undefined){
		return Utils.toJSON(Utils.setError('Invalid parametres'));
	}

	var urole = User.getRole(curUserID, crid);
	var uactions = User.getActionsByRole(urole);

	if (ArrayOptFind(uactions, 'This.name == \'' + action + '\'') == undefined) {
		return Utils.toJSON(Utils.setError('Unknown action for user'));
	}

	var currentStep = Adaptation.getCurrentStep(crid);
	var personFromRole = User.getRole(currentStep.object_id, crid);
	/*alert('personFromRole: ' + personFromRole);
	alert('currentStep.step_id: ' + currentStep.step_id);
	alert('action: ' + action);*/

	//Теперь функция getProcessSteps может вернуть несколько записей. 
	//Т.к. у  сотрудника может не быть куратора, и он должен отправить сразу руководителю.
	//Получаем этапы, ранжируем по номеру
	var processSteps = Adaptation.getProcessSteps(personFromRole, currentStep.step_id, action);
	//alert('processSteps: ' + tools.object_to_text(processSteps, 'json'))
	
	if (ArrayCount(processSteps) == 0){
		return Utils.toJSON(Utils.setError('Next step not found'));
	}

	var processStep = null;
	var nextUserId = null;
	//alert('ArrayCount(processSteps): ' + (ArrayCount(processSteps)))
	for (ps in processSteps){
		nextUserId = Adaptation.getNextUserId(crid, ps.next_role);
		if (nextUserId != null){
			processStep = ps;
			break;
		}
	}

	//alert('processStep: ' + tools.object_to_text(processStep, 'json'))

	if (processStep == null || nextUserId == null){
		/*alert('processStep == null:' + (processStep == null));
		alert('nextUserId == null:' + (nextUserId == null));*/
		return Utils.toJSON(Utils.setError('Next step or next user not found'));
	}

	var currentUserId = currentStep.object_id;
	//var nextUserId = Adaptation.getNextUserId(crid, processStep.next_role);
	
	var step = null;
	var comment = data.HasProperty('comment') && data.GetOptProperty('comment') != 'undefined' ? data.comment : '';
	Adaptation.createStep(
		currentStep.id,
		{
			collaborator_id: currentUserId,
			object_id: nextUserId,
			data: comment,
			step_id: processStep.next_step
		}
	);

	Utils.notificate('adaptation', nextUserId, null, currentUserId);
	return Utils.toJSON(Utils.setSuccess());
}

function get_Report(queryObjects){
	var crid = queryObjects.HasProperty('cr_id') ? Trim(queryObjects.cr_id) : undefined;

	if (crid == undefined){
		return Utils.toJSON(Utils.setError('Invalid parametres'));
	}

	var isAccess = Adaptation.isAccessToView(curUserID, null, crid);
	if (!isAccess){
		return Utils.toJSON(Utils.setError('You don`t have permissions to this document'));
	}
	
	var colWidths = [];

	function columnNameByIndex (d){
		var colName = '';
		while (d > 0) {
			m = (d - 1) % 26;
			colName = String.fromCharCode(65 + m) + colName;
			d = Int((d - m) / 26)
		}
		return colName;
	}

	function setMaxColWith(value, index){
		var count = StrCharCount(value);
		var c = 0;
		try {
			c = colWidths[index];
		} catch(e) {}

		colWidths[index] = count > c ? count : c;
	}

	function getTutors(docCr){
		var docq = [];
		for (t in docCr.TopElem.tutors) {
			q = ArrayOptFirstElem(XQuery("sql: \n\
				select name \n\
				from boss_types \n\
				where id = " + t.boss_type_id + " \n\
			"));
			docq.push({
				boss_fullname: String(t.person_fullname),
				boss_type_name: (q != undefined ? String(q.name) : '')
			});
		}
		return docq;
	}

	function getTasks(docCr){
		var docq = [];
		for (el in docCr.TopElem.tasks){
			docq.push({
				id: String(el.id),
				name: String(el.name)
			});
		}

		var tasks = XQuery("for $el in cc_adaptation_tasks where $el/career_reserve_id = " + docCr.DocID + " return $el");
		for (t in tasks) {
			tt = ArrayOptFind(docq, 'This.id == \'' + t.object_id + '\'');
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
			}
		}
		return docq;
	}

	var path = UrlToFilePath(ObtainTempFile('.xlsx'));
	var oExcelDoc = new ActiveXObject('Websoft.Office.Excel.Document');
	oExcelDoc.CreateWorkBook();
	var oWorksheet = oExcelDoc.GetWorksheet(0);

	var cdoc = OpenDoc(UrlFromDocID(Int(crid)));
	var udoc = OpenDoc(UrlFromDocID(Int(cdoc.TopElem.person_id)));

	var	rindex = 1;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = 'ФИО';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 0);
	//oCell.Style.IsBold = true;

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = udoc.TopElem.fullname;
	setMaxColWith(oCell.Value, 1);
	rindex = rindex + 1;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = 'Поразделение';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = udoc.TopElem.position_parent_name;
	setMaxColWith(oCell.Value, 1);
	rindex = rindex + 1;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = 'Должность';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = udoc.TopElem.position_name;
	setMaxColWith(oCell.Value, 1);
	rindex = rindex + 1;

	var _tutors = getTutors(cdoc);
	for(el in _tutors){
		oCell = oWorksheet.Cells.GetCell('A' + rindex);
		oCell.Value = String(el.boss_fullname);
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		setMaxColWith(oCell.Value, 0);

		oCell = oWorksheet.Cells.GetCell('B' + rindex);
		oCell.Value = String(el.boss_type_name);
		//oCell.Style.FontSize = 14;
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 1);
		rindex = rindex + 1;
	}
	rindex = rindex + 2;

	var ats = Adaptation.getAssessments();

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = 'ОЦЕНКА';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = 'ОПИСАНИЕ УРОВНЯ ДОСТИЖЕНИЯ ЦЕЛИ';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 1);
	rindex = rindex + 1;

	for(el in ats){
		oCell = oWorksheet.Cells.GetCell('A' + rindex);
		oCell.Value = String(el.name);
		oCell.Style.ForegroundColor = el.color;
		setMaxColWith(oCell.Value, 0);
		//oCell.Style.FontSize = 14;


		oCell = oWorksheet.Cells.GetCell('B' + rindex);
		oCell.Value = String(el.description);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 1); 
		//oCell.Style.FontSize = 14;
		rindex = rindex + 1;
	}

	rindex = rindex + 2;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = 'ЦЕЛИ';
	oCell.Style.FontSize = 10;
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = 'ОЖИДАЕМЫЙ РЕЗУЛЬТАТ';
	oCell.Style.FontSize = 10;
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 1);

	oCell = oWorksheet.Cells.GetCell('C' + rindex);
	oCell.Value = 'ДОСТИГНУТЫЙ РЕЗУЛЬТАТ';
	oCell.Style.FontSize = 10;
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 2);

	oCell = oWorksheet.Cells.GetCell('D' + rindex);
	oCell.Value = 'ОЦЕНКА СОТРУДНИКА';
	oCell.Style.FontSize = 10;
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 3);

	oCell = oWorksheet.Cells.GetCell('E' + rindex);
	oCell.Value = 'ОЦЕНКА РУКОВОДИТЕЛЯ';
	oCell.Style.FontSize = 10;
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	setMaxColWith(oCell.Value, 4);

	rindex = rindex + 1;

	var _tasks = getTasks(cdoc);
	for(el in _tasks){
		oCell = oWorksheet.Cells.GetCell('A' + rindex);
		oCell.Value = String(el.name);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 0); 

		oCell = oWorksheet.Cells.GetCell('B' + rindex);
		oCell.Value = String(el.expected_result);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 1);

		oCell = oWorksheet.Cells.GetCell('C' + rindex);
		oCell.Value = String(el.achieved_result);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 2); 

		oCell = oWorksheet.Cells.GetCell('D' + rindex);
		oCell.Value = String(el.collaborator_assessment);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 3);

		oCell = oWorksheet.Cells.GetCell('E' + rindex);
		oCell.Value = String(el.manager_assessment);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 4);

		rindex = rindex + 1;
	}
	//alert(tools.object_to_text(colWidths, 'json'));

	for (i = 0; i < colWidths.length; i++){
		oWorksheet.Cells.SetColumnWidth(i, colWidths[i]);
	}

	oWorksheet.Cells.SetRowHeight(2, 30.0);
	oExcelDoc.SaveAs(path);

	Request.AddRespHeader('Content-Type', 'application/octet-stream');
	Request.AddRespHeader('Content-disposition', 'attachment; filename=report.xlsx');
	return LoadFileData(path);
}

%>