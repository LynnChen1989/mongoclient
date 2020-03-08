/* eslint-disable prefer-arrow-callback */
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {Meteor} from 'meteor/meteor';
import './admin.html';
import $ from 'jquery';
import {Accounts} from "meteor/accounts-base"


// 客户端订阅allUsers
Meteor.subscribe('allUsers');

Template.adminLayout.helpers({
    user: function () {
      return Meteor.users.find({})
    }
  }
);

Template.adminLayout.events({
  'click #btnCloseNewUser': function (event) {
    event.preventDefault();
    const myEmail = $('#newEmail').val();
    const myPassword = $('#newPassword').val();
    Accounts.createUser({
      password: myPassword,
      email: myEmail
    }, function (err) {
      if (err)
        console.log(err);
      else
        alert('创建用户成功!');
      setTimeout(function () {
        FlowRouter.go('/');
      }, 2000);

    });
  },
  'click .userDel': function (event) {
    event.preventDefault();

    const r = confirm("确认要删除吗？");
    if (r === true) {
      Meteor.users.allow({
        remove: function (userId, doc) {
          return doc && doc.userId === userId;
        }
      });

      Meteor.users.remove({_id: this._id}, function (error, result) {
        if (error) {
          console.log(error);
          alert("删除用户出错！")
        } else {
          alert("删除用户成功！")
        }
      })
    } else {
    }
  }
})
;
