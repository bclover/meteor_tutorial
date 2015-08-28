Tasks = new Mongo.Collection('tasks');

/****** CLIENT-SIDE CODE *********/
if(Meteor.isClient){
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
			throw new Meteor.Error("Sorry but you are not authorized to take this action.");
		}

		Tasks.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
	},

	deleteTask: function (taskId) {
		Tasks.remove(taskId);
	},

	setChecked: function (taskId, setChecked) {
		Tasks.update(taskId, { $set: { checked: setChecked} });
	}
});