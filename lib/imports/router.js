/* eslint-disable func-style */
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('mainLayout', { yield: 'notFound' });
  },
};

FlowRouter.route('/', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'databaseStats' });
    }
  },
});

FlowRouter.route('/login', {
  action() {
    BlazeLayout.render('loginLayout');
  },
});

FlowRouter.route('/shell', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'mcShell' });
    }
  },
});

// FlowRouter.route('/storedFunctions', {
//  action() {
//    BlazeLayout.render('mainLayout', { yield: 'storedFunctions' });
//  },
// });
//
//
// FlowRouter.route('/schemaAnalyzer', {
//  action() {
//    BlazeLayout.render('mainLayout', { yield: 'schemaAnalyzer' });
//  },
// });

FlowRouter.route('/adminQueries', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'adminQueries' });
    }
  },
});

FlowRouter.route('/aggregatePipeline', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'aggregatePipeline' });
    }
  },
});

FlowRouter.route('/browseCollection', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'browseCollection' });
    }
  },
});

// FlowRouter.route('/databaseDumpRestore', {
//  action() {
//    BlazeLayout.render('mainLayout', { yield: 'databaseDumpRestore' });
//  },
// });

FlowRouter.route('/databaseStats', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'databaseStats' });
    }
  },
});

//
// FlowRouter.route('/fileManagement', {
//  action() {
//    BlazeLayout.render('mainLayout', { yield: 'fileManagement' });
//  },
// });

FlowRouter.route('/settings', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'settings' });
    }
  },
});

FlowRouter.route('/userManagement', {
  action() {
    if (Meteor.userId() === null) {
      FlowRouter.go('/login');
    } else {
      BlazeLayout.render('mainLayout', { yield: 'userManagement' });
    }
  },
});
