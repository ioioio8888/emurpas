import { Mongo } from 'meteor/mongo'
import { isModerator } from '/imports/api/user/methods'
import { ProjectQuestions } from '/imports/api/project-questions/project-questions'
import { UserQuestions } from '/imports/api/userQuestions/userQuestions'

export const FormProgress = new Mongo.Collection('formProgress')

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('formProgress', function(formTypeID) {
        if (formTypeID) {
            return FormProgress.find({ 'form_type_id': formTypeID });
        } else {
            if (!Meteor.userId()) return;

            let user = Meteor.users.findOne({
	            _id: Meteor.userId()
	        }) || {};

	    	let questions = ProjectQuestions.find({
	    		$or: [{
	                createdBy: Meteor.userId(),
	            }, {
	                'team_members.email': ((user.emails || [])[0] || {}).address 
	            }]
	    	}).fetch()

	    	let info = UserQuestions.find({
	    		createdBy: Meteor.userId()
	    	}).fetch()
	    	
            return FormProgress.find({
            	form_type_id: {
            		$in: _.union(questions.map(i => i._id), info.map(i => i._id))
            	}
            })
        }
    })
            

    Meteor.publish('modFormProgress', (projectID) => {
        if (Meteor.userId() && isModerator(Meteor.userId())) {
            if (projectID) {
                return FormProgress.find({
                    'form_type_id': projectID
                })
            } else {
                return FormProgress.find({})
            }
        }
    })
}