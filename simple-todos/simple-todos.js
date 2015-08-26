Tasks = new Mongo.Collection('tasks');

if(Meteor.isClient){
	// This code only runs on the client
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
			Tasks.insert({
				text: text,
				createdAt: new Date() // current time
			});

			// Clear form
			event.target.text.value = "";

		},

		"change .hide-completed input": function(event){
			Session.set("hideCompleted", event.target.checked);
		},

		"click .toggle-checked": function(){
			Tasks.update(this._id, {
				$set: {checked: !this.checked}
			});
		},

		"click .delete": function(){
			Tasks.remove(this._id);
		}
	});
}