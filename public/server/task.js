function getByTaskId(crId, taskId){
	return ArrayOptFirstElem(XQuery('for $el in cc_adaptation_tasks where $el/career_reserve_id = ' + crId + ' and $el/object_id = \'' + taskId + '\' return $el'));
}

function create(crId, data){
	var Adaptation = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');
	DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');

	var q = Adaptation.getById(crId);
	if (q == undefined){
		return null;
	}

	var crDoc = OpenDoc(UrlFromDocID(Int(q.id)));
	var countChilds = ArrayCount(crDoc.TopElem.tasks);
	var task = crDoc.TopElem.tasks.AddChild();
	task.name = data.name;
	task.type = 'task';
	task.status = 'plan';
	task.desc = data.desc;
	crDoc.Save();

	var customDoc = tools.new_doc_by_name('cc_adaptation_task');
	customDoc.TopElem.career_reserve_id = crId;
	customDoc.TopElem.object_id = task.id;
	customDoc.TopElem.object_type = 'task';
	customDoc.BindToDb(DefaultDb);
	customDoc.Save();

	return task;
}

function update(crId, taskId, data){
	var Adaptation = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');
	DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');

	var q = Adaptation.getById(crId);
	if (q == undefined){
		return null;
	}

	var crDoc = OpenDoc(UrlFromDocID(Int(q.id)));
	var task = crDoc.TopElem.tasks.GetOptChildByKey(taskId, 'id');
	if (task == undefined){
		return null;
	}

	for (el in data){
		try {
			ch = task.OptChild(el);
			ch.Value = data[el]
		} catch(e) {}
	}
	crDoc.Save();

	var customTask = getByTaskId(crId, taskId);
	if (customTask == undefined){
		return null;
	}
	var customTaskDoc = OpenDoc(UrlFromDocID(Int(customTask.id)));
	for (el in data){
		try {
			customTaskDoc.TopElem[el] = data[el];
		} catch(e) {}
	}
	customTaskDoc.Save();

	var obj = {};
	for (el in task){
		try {
			obj.SetProperty(el.Name, String(el.Value));
		} catch(e) {}
	}
	for (el in customTaskDoc.TopElem){
		try {
			obj.SetProperty(el.Name, String(el.Value));
		} catch(e) {}
	}
	return obj;
}

function remove(crId, taskId){
	var Adaptation = OpenCodeLib('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');
	DropFormsCache('x-local://wt/web/vsk/portal/adaptation/server/adapt.js');

	var q = Adaptation.getById(crId);
	if (q == undefined){
		return null;
	}

	var crDoc = OpenDoc(UrlFromDocID(Int(q.id)));
	var task = crDoc.TopElem.tasks.GetOptChildByKey(taskId, 'id');
	if (task == undefined){
		return null;
	}

	task.Delete();
	var customTask = getByTaskId(crId, taskId);
	if (customTask != undefined){
		DeleteDoc(UrlFromDocID(Int(customTask.id)));
	}
	crDoc.Save();
	return null;
}