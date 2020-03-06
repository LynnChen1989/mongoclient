/* eslint-disable prefer-arrow-callback */
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import './login.html';

Template.loginLayout.events({
  'submit form': function (event) {
    event.preventDefault();
    console.log(event.target);
    const myEmail = event.target.email.value;
    const myPassword = event.target.password.value;
    Meteor.loginWithPassword(myEmail, myPassword, function (error) {
      if (Meteor.user()) {
        console.log(Meteor.userId());
        FlowRouter.go('/');
      } else {
        alert(error.reason);
      }
    });
  }
});
