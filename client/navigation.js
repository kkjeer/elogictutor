Template.navigation.helpers({
	isAdmin: function () {
		return Meteor.user() && Meteor.user().username && Meteor.user().username == 'kkjeer';
	}
});