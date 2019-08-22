function getById(taskId){
	return ArrayOptFirstElem(XQuery('for $el in cc_adaptation_tasks where $el/id = \'' + taskId + '\' return $el'));
}

function create(crId, data){
	var q = getAdaptationById(crId);
	if (q == undefined){
		return null;
	}

	var crDoc = OpenDoc(UrlFromDocID(Int(q.id)));
	var countChilds = ArrayCount(crDoc.TopElem.tasks);
	var task = crDoc.TopElem.tasks.AddChild();
	task.name = 'Задача №' + (countChilds + 1);
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
	var q = getAdaptationById(crId);
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
			task[el] = data[el];
		} catch(e) {}
	}
	crDoc.Save();

	var customTask = getById(taskId);
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
		obj[el] = task[el];
	}
	for (el in customTaskDoc.TopElem){
		obj[el] = customTaskDoc.TopElem[el];
	}

	return obj;
}

function remove(crId, taskId){
	var q = getAdaptationById(crId);
	if (q == undefined){
		return null;
	}

	var crDoc = OpenDoc(UrlFromDocID(Int(q.id)));
	var task = crDoc.TopElem.tasks.GetOptChildByKey(taskId, 'id');
	if (task == undefined){
		return null;
	}
	task.Delete();
	DeleteDoc(UrlFromDocID(Int(taskId)));
	return null;
}