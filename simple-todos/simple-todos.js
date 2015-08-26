Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function(){
      // Show newest tasks at the top
      return Tasks.find({}, {sort: {createdAt: -1}});
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