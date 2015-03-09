//XXX quitar el JS de aqui
//Esto es para iniciar el dropdown
//$(function(){
//   $(".dropdown-button").dropdown();
// });


Tasks = new Mongo.Collection("tasks");
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.body.events({
    "submit .new-task": function(event){
        var text = event.target.text.value;
        if(text.length > 0){
            //replaced Tasks.insert ...
            Meteor.call("addTask", text);
            //Clear form
            event.target.text.value = "";
        }

        //Prevent default form submit
        return false;
    },
    "change .hide-completed input": function(event) {
        Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.body.helpers({
    tasks: function(){ 
            if(Session.get("hideCompleted")) {
              return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});   
            } else {
              return Tasks.find({}, {sort: {createdAt: -1}});
            }
    },
    hideCompleted: function(){
      return Session.get("hideCompleted");
    },
    incompleteCount: function(){
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.task.events({
    "click .toggle-checked": function(){
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function(){
        console.log(this.owner);
        if(this.owner == Meteor.userId()){
          //Usar los metodos mejor
          // Tasks.remove(this._id);
          Meteor.call("deleteTask", this._id);
        }else{
          alert("No te pertenece!");
        }
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

Meteor.methods({
  addTask: function (text) {
    //Check that user is logged
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
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
    Tasks.update(taskId, { $set: { checked: setChecked } } );
  } 
});
