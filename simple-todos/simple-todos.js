Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
	Meteor.publish('tasks', function () {

		// Only publish tasks that are public or belong to the current user
		return Tasks.find({
			$or: [
				{ private: {$ne: true} },
				{ owner: this.userId }
			]
		});
	});
}

/****** CLIENT-SIDE CODE *********/
if(Meteor.isClient){

	Meteor.subscribe("tasks");

	Template.body.helpers({
		tasks: function(){
			if (Session.get("hideCompleted")) {
				//If the hideCompleted checkbox is checked, filter tasks to only show uncompleted items
				return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
			} else {
				// Otherwise, return all of the tasks
				return Tasks.find({}, {sort: {createdAt: -1}});
			}
		},

		hideCompleted: function () {
			return Session.get("hideCompleted");
		},

		getRemainingTaskCount: function () {
			return Tasks.find({checked: {$ne: true}}).count();
		}
	});

	Template.task.helpers({
		isOwner: function () {
			return this.owner === Meteor.userId();
		}
	});

	Template.body.events({
		"submit .new-task": function(event){
			//prevent default browser form submit
			event.preventDefault();

			//get value from form element
			var text = event.target.text.value;

			// Insert a task into the collection
			Meteor.call("addTask", text);

			// Clear form
			event.target.text.value = "";
		},

		"change .hide-completed input": function(event){
			Session.set("hideCompleted", event.target.checked);
		},

		"click .toggle-checked": function(){
			Meteor.call("setChecked", this._id, ! this.checked);
		},

		"click .delete": function(){
			Meteor.call("deleteTask", this._id);
		},

		"click .toggle-private": function () {
			Meteor.call("setPrivate", this._id, !this.private);
		}
	});

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
}

/****** SERVER-SIDE CODE *********/
Meteor.methods({

	addTask: function(text){
		if(!Meteor.userId()){
			throw new Meteor.Error("You are not authorized to take this action.");
		}

		Tasks.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username,
			private: true
		});
	},

	deleteTask: function (taskId) {
		var task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can delete it
			alert("You do not have permission to delete this task.");
			throw new Meteor.Error("You do not have permission to delete this task.");
		}

		if(task.owner !== Meteor.userId()){
			alert("You do not have permission to delete this task.");
			throw new Meteor.Error("You do not have permission to delete this task.");
		}else{
			Tasks.remove(taskId);
		}

	},

	setChecked: function (taskId, setChecked) {
		var task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If the task is private, make sure only the owner can check it off
			alert("You do not have permission to mark this task as complete.");
			throw new Meteor.Error("You do not have permission to check this task.");
		}
		Tasks.update(taskId, { $set: { checked: setChecked} });
	},

	setPrivate: function(taskId, setToPrivate) {
		var task = Tasks.findOne(taskId);
		if(task.owner !== Meteor.userId()) {
			alert("You do not have permission to set the privacy of this task.");
			throw new Meteor.Error("You do not have permission to set the privacy of this task.");
		}

		Tasks.update(taskId, { $set: { private: setToPrivate } });
	}
});