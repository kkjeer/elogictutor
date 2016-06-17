if (Meteor.isServer) {

  console.log('server.js found')
	var INIT_K = 0.01;
  //stores all of the rules
  var inferenceRules = ['MP', 'MT', 'DS', 'ADD', 'SIMP', 'CONJ', 'HS', 'CD'];

	//publish the StudentModel information that matches the currently logged in user
	//if the user doesn't have any information in the system, set up information for that user
	StudentModel = new Meteor.Collection("studentmodel");
	Meteor.publish('studentmodel', function () {
    console.log('this.userId: ' + this.userId);
    //set up the student account if necessary
		if (StudentModel.find({_id: this.userId}).count() == 0 && this.userId != null) {
			setUpStudentAccount(this.userId);
		}

    //publish the records for the current user
		return StudentModel.find({_id: this.userId});
	});

	//publish the KTScores for the currently logged in user
	//set up user's account if the user doesn't have KTScores
	KTScores = new Meteor.Collection("ktscores");
	Meteor.publish('ktscores', function () {
    //set up the ktscores if necessary
		if (StudentModel.find({_id: this.userId}).count() == 0 && this.userId != null) {
			 setUpStudentAccount(this.userId);
		  }

      //publish the records for the current user
  		return KTScores.find({stdnt_id: this.userId});
	});

  //the Collection that logs each action that the user takes
  ActionLog = new Meteor.Collection('actionlog');
  Meteor.publish('actionlog', function () {
    return ActionLog.find({student: this.userId});
  });

  /******************METHODS*******************/

  Meteor.methods({
    //updates the StudentModel Collection
    updateStudentModel: function (field, value, caller) {
      if (this.userId != Meteor.userId()) {
        console.log('error: incorrect user');
        return 'error: incorrect user';
      }

      // if (field == 'currentpage') {
      //   console.log('******************************');
      //   console.log('caller: ' + caller + ' field: ' + field + ' value: ' + value);
      // }

      //try this instead of the switch statement
      //StudentModel.update({_id: Meteor.userId()}, {$set: {field: value}});

      switch (field) {
        case 'level':
          StudentModel.update({_id: Meteor.userId()}, {$set: {level: value}});
          break;
        case 'sublevel':
          StudentModel.update({_id: Meteor.userId()}, {$set: {sublevel: value}});
          break;
        case 'lastlineadded':
          StudentModel.update({_id: Meteor.userId()}, {$set: {lastlineadded: value}});
          break;
        case 'hintsclicked':
          StudentModel.update({_id: Meteor.userId()}, {$set: {hintsclicked: value}});
          break;
        case 'currentline':
          StudentModel.update({_id: Meteor.userId()}, {$set: {currentline: value}});
          break;
        case 'problemstarttime':
          StudentModel.update({_id: Meteor.userId()}, {$set: {problemstarttime: value}});
          break;
        case 'levelstarttime':
          StudentModel.update({_id: Meteor.userId()}, {$set: {levelstarttime: value}});
          break;
        case 'currentpage':
          StudentModel.update({_id: Meteor.userId()}, {$set: {currentpage: value}});
          break;
        case 'currentproblemindex':
          StudentModel.update({_id: Meteor.userId()}, {$set: {currentproblemindex: value}});
          break;
        case 'partialproblems':
          StudentModel.update({_id: Meteor.userId()}, {$set: {partialproblems: value}});
          break;
        case 'flashcardscolor':
          StudentModel.update({_id: Meteor.userId()}, {$set: {flashcardscolor: value}});
          break;
        case 'partialproofcolor':
          StudentModel.update({_id: Meteor.userId()}, {$set: {partialproofcolor: value}});
          break;
        default:
          return 'error: please enter a valid field in the StudentModel Collection';
      }

      return 'successful update!';
    },

    updateKTScores: function (id, value) {
      if (this.userId != Meteor.userId()) {
        console.log('error: incorrect user');
        return 'error: incorrect user';
      }

      KTScores.update({_id: id}, {$set: {score: value}});
    },

    //logs a new action with the given parameters
    logAction: function (ruleSet, level, lineNumber, rule, conclusion, preconds, answer, attempt, correct, hintsClicked, numAttempts, kcscore, elapsedTime, date, time, timeToMastery, levelCompleteTime, systemCompleteTime) {
      //make sure the user calling this function is the currently logged in user
      if (this.userId != Meteor.userId()) {
        console.log('error: incorrect user');
        return 'error: incorrect user';
      }

      //make sure the elapsedTime isn't more than three minutes
      //console.log('elapsedTime: ' + elapsedTime);
      var split = elapsedTime.split(':');
      //console.log('split: ' + split);
      if (parseInt(split[1]) > 3 || parseInt(split[0]) > 0) {
        var newMinutes = split[1];
        if (parseInt(split[1]) > 3) {
          newMinutes = '3';
        }
        elapsedTime = '0:' + newMinutes + ':' + split[2];
        //console.log('new elapsedTime: ' + elapsedTime);
      }

      //insert the new action
      ActionLog.insert({applet: 'eLogicTutor', course: 'testCourse', student: Meteor.userId(), name: Meteor.user().username, mode: 'sym', ruleSet: ruleSet, level: level, 
                        lineNumber: lineNumber, rule: rule, conclusion: conclusion, preconds: preconds, answer: answer, attempt: attempt, correct: correct, numAttempts: numAttempts, hintsClicked: hintsClicked, kcscore: kcscore,
                        elapsedTime: elapsedTime, clientDate: date, clientTime: time, serverDate: getServerDate(), serverTime: getServerTime(), 
                        timeToMastery: timeToMastery, timeToLevel: levelCompleteTime, timeToSystem: systemCompleteTime});

      //print the most recent action log
      //printLastActionLog();
      return 'successfully logged action';
    },

    /*****************ACTION LOGS PRINTING, REMOVING, and SUMMARY STATISTICS FUNCTIONS*****************/
    //prints the logs for the given user
    printUserLogs: function (name) {
      var actionLogs = ActionLog.find({name: name}).fetch();
      if (name == 'all') {
        actionLogs = ActionLog.find({}).fetch();
      }
      if (actionLogs.length == 0) {
        console.log('no logs to print for user ' + name);
      }

      console.log();
      console.log();

      for (var si in actionLogs) {
        console.log('&&&&&&&&&&&&&' + name + name + name + name + name + '&&&&&&&&&&&&\n' + 
          'si: ' + si + ' _id: ' + actionLogs[si]._id + '\n studentid: ' + actionLogs[si].student + ' studentname: ' + actionLogs[si].name + '\n' +
          ' ruleSet: ' + actionLogs[si].ruleSet + ' level: ' + actionLogs[si].level + '\n' + 
          ' lineNumber: ' + actionLogs[si].lineNumber + ' rule: ' + actionLogs[si].rule + ' conclusion: ' + actionLogs[si].conclusion + ' preconds: ' + actionLogs[si].preconds + '\n' + 
          ' answer: ' + actionLogs[si].answer + ' attempt: ' + actionLogs[si].attempt + ' correct: ' + actionLogs[si].correct + ' hintsClicked: ' + actionLogs[si].hintsClicked + ' numAttempts: ' + actionLogs[si].numAttempts + ' kcscore: ' + actionLogs[si].kcscore + '\n' +
          ' elapsedTime: ' + actionLogs[si].elapsedTime + ' timeToMastery: ' + actionLogs[si].timeToMastery + '\n' + 
          ' timeToLevel: ' + actionLogs[si].timeToLevel + ' timeToSystem: ' + actionLogs[si].timeToSystem + '\n' + 
          ' clientDate: ' + actionLogs[si].clientDate + ' clientTime: ' + actionLogs[si].clientTime + '\n' +
          ' serverDate: ' + actionLogs[si].serverDate + ' serverTime: ' + actionLogs[si].serverTime);
      }
    },

    //prints all the action logs
    printAllLogs: function () {
      var actionLogs = ActionLog.find({}).fetch();
      if (actionLogs.length == 0) {
        console.log('no action logs to print');
      }

      console.log();
      console.log();

      for (var si in actionLogs) {
        console.log('%%%%%%%%%%%%%ALLALLALLALLALLALLALLALLALLALLALL%%%%%%%%%%%%%%%%%%%%\n' + 
          'si: ' + si + ' _id: ' + actionLogs[si]._id + '\n studentid: ' + actionLogs[si].student + ' studentname: ' + actionLogs[si].name + '\n' +
          ' ruleSet: ' + actionLogs[si].ruleSet + ' level: ' + actionLogs[si].level + '\n' + 
          ' lineNumber: ' + actionLogs[si].lineNumber + ' rule: ' + actionLogs[si].rule + ' conclusion: ' + actionLogs[si].conclusion + ' preconds: ' + actionLogs[si].preconds + '\n' + 
          ' answer: ' + actionLogs[si].answer + ' attempt: ' + actionLogs[si].attempt + ' correct: ' + actionLogs[si].correct + ' hintsClicked: ' + actionLogs[si].hintsClicked + '\n' +
          ' elapsedTime: ' + actionLogs[si].elapsedTime + ' timeToMastery: ' + actionLogs[si].timeToMastery + '\n' + 
          ' timeToLevel: ' + actionLogs[si].timeToLevel + ' timeToSystem: ' + actionLogs[si].timeToSystem + '\n' + 
          ' clientDate: ' + actionLogs[si].clientDate + ' clientTime: ' + actionLogs[si].clientTime + '\n' +
          ' serverDate: ' + actionLogs[si].serverDate + ' serverTime: ' + actionLogs[si].serverTime);
      }
    },

    //removes the logs for the given user
    removeUserLogs: function (name) {
      if (ActionLog.find({name: name}).count() == 0) {
        console.log('no logs to remove for user ' + name);
      }
      ActionLog.remove({name: name});
      console.log(name + ' action logs removed');
    },

    //removes all the action logs
    removeAllLogs: function () {
      if (ActionLog.find({}).count() == 0) {
        console.log('no logs to remove');
      }
      ActionLog.remove({});
      console.log('all logs removed');
    },

    averageTime: function (name, type, rule) {
      //filter the ActionLog based on the given criteria
      if (name == 'all') {
        if (/*type == 'problem' || type == 'mastery' || */rule == 'all') {
          console.log('searching for all users and all rules')
          //searching for all users and all rules
          var actionLog = ActionLog.find({}).fetch();
        } else {
          console.log('searching for all users and the specific rule ' + rule);
          //searching for all users and one specific rule
          var actionLog = ActionLog.find({rule: rule}).fetch();
        }      
      } else {
        if (/*type == 'problem' || type == 'mastery' || */rule == 'all') {
          console.log('searching for specific user ' + name + ' and all rules');
          //searching for one specific user and all rules
          var actionLog = ActionLog.find({name: name}).fetch();
        } else {
          console.log('searching for specific user ' + name + ' and specific rule ' + rule);
          //searching for one specific user and one specific rule
          var actionLog = ActionLog.find({name: name, rule: rule}).fetch();
        }    
      }

      //the total time the user spent on these types of problems
      var total = 0;
      //the number of times a valid timestamp was logged
      var entries = 0;

      //go through all the action logs and update the total and entries
      for (var i in actionLog) {
        //get the time based on the type of time being searched for (problem, mastery , level, or system)
        if (type == 'problem') {
          var time = actionLog[i].elapsedTime;
        } else if (type == 'mastery') {
          var time = actionLog[i].timeToMastery;
        } else if (type == 'level') {
          var time = actionLog[i].timeToLevel;
        } else {
          var time = actionLog[i].timeToSystem;
        }

        //make sure there was actually a time logged (for level, mastery, or system, the time is often 'N/A')
        if (time != undefined && time != 'N/A') {
          //there is another entry for each valid time
          entries++;

          //compute the time stamp as an integer number of seconds
          if (type == 'problem') {
            var timeArray = time.split(':');
            var timeDate = new Date(0, 0, 0, timeArray[0], timeArray[1], timeArray[2]); 
            var timeNumber = timeDate.getHours()*3600 + timeDate.getMinutes()*60 + timeDate.getSeconds();

            //add the numeric timestamp to the total
            total += timeNumber;
          } else {
            total += time;
          }  
        }       
      }

      //compute the average and log the information to the console
      var average = total/entries;
      console.log('+++++TIME+++++ user: ' + name + ' | type: ' + type + ' | rule: ' + rule + ' | total: ' + total + ' | entries: ' + entries + ' | average (in seconds): ' + average.toFixed(4));
      console.log('+++++');

      return average.toFixed(4);
    },

    hintsInfo: function (name, rule) {
      //filter the ActionLog based on the given name
      if (name == 'all') {
        var actionLog = ActionLog.find({}).fetch();
      } else {
        var actionLog = ActionLog.find({name: name}).fetch();
      }

      //the total number of hints clicked by the given user
      var total = 0;

      //the total number of problems where hints could have been clicked 
      //(i.e. the total number of logged level 0 problems)
      var entries = 0;

      //go through all the action logs and update the total and entries
      for (var i in actionLog) {
        //each level 0 problem makes one more entry
        if (actionLog[i].level == 0) {
          entries++;
        }

        //the hints clicked in this log
        var hints = actionLog[i].hintsClicked;

        //update the total number of hints clicked that correspond to the given rule
        if (rule == 'all') {
          total += hints.length;
        } else {
          for (var h in hints) {
            if (hints[h] == rule) {
              total++;
            }
          }
        }
      }

      //compute the average and log the information to the console
      var average = total/entries;
      console.log('-----HINTS----- user: ' + name + ' | rule: ' + rule + ' | total: ' + total + ' | entries: ' + entries + ' | average (# of hints clicked): ' + average.toFixed(4));
      console.log('-----');

      return average.toFixed(4);
    },

    answerProportions: function (name, rule) {
      //filter the ActionLog based on the given criteria
      if (name == 'all') {
        if (rule == 'all') {
          //searching for all users and all rules
          var actionLog = ActionLog.find({}).fetch();
        } else {
          //searching for all users and one specific rule
          var actionLog = ActionLog.find({rule: rule}).fetch();
        }      
      } else {
        if (rule == 'all') {
          //searching for one specific user and all rules
          var actionLog = ActionLog.find({name: name}).fetch();
        } else {
          //searching for one specific user and one specific rule
          var actionLog = ActionLog.find({rule: rule}).fetch();
        }
      }

      //the total number of correct and incorrect answers for the given user and rule
      var correct = 0;
      var incorrect = 0;

      //go through all the action logs and update the number of correct and incorrect answers
      for (var i in actionLog) {
        if (actionLog[i].correct == 'Y') {
          correct++;
        } else {
          incorrect++;
        }
      }

      //compute the proportions and log the information to the console
      var correctproportion = correct/actionLog.length;
      var incorrectproportion = incorrect/actionLog.length;
      console.log('%%%%%PROPORTION%%%%% user: ' + name + ' | rule: ' + rule + ' | correct: ' + correct + ' | length: ' + actionLog.length + ' | proportion: ' + correctproportion.toFixed(3));
      console.log('%%%%%PROPORTION%%%%% user: ' + name + ' | rule: ' + rule + ' | incorrect: ' + incorrect + ' | length: ' + actionLog.length + ' | proportion: ' + incorrectproportion.toFixed(3));
      console.log('%%%%%%%');

      return correctproportion.toFixed(3);
    },

    printKCScore: function (student, sublevel, rule) {
      var kc = KTScores.find({stdnt_id: student, sublevel: sublevel, rule: rule}).fetch()[0].score;
      console.log('kc score for ' + student + ' for rule ' + rule + ' and sublevel ' + sublevel + ': ' + kc);
      return kc;
    },

    setUpNameSelect: function () {
      //get all the action logs
      var actionLog = ActionLog.find({}).fetch();

      //should always contain an option to select all users
      var html = '<option value = all>All</option>';

      //a list of unique names in the action logs
      var names = [];
      for (var i in actionLog) {
        var name = actionLog[i].name;
        if (names.indexOf(name) == -1) {
          names.push(name);
        }
      }

      //add an option to select each user
      for (var n in names) {
        html += '<option value = \'' + names[n] + '\'' + '>' + names[n] + '</option>';
      }

      return html;
    }
  });


  //server date and time functions - used for action logging
  function getServerDate () {
    var date = new Date();
    var month = date.getMonth() + 1;
    return month + '/' + date.getDate() + '/' + date.getFullYear();
  }

  function getServerTime () {
    var date = new Date();
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  }


//prints the most recent action log - called after logging a new action
function printLastActionLog () {
  var actionLogs = ActionLog.find({}).fetch();

    var si = actionLogs.length - 1;
    console.log('LASTLASTLASTLASTLASTLASTLASTLAST\n' + 'si: ' + si + ' _id: ' + actionLogs[si]._id + ' student: ' + actionLogs[si].student + ' studentname: ' + actionLogs[si].name + '\n' +
      ' ruleSet: ' + actionLogs[si].ruleSet + ' level: ' + actionLogs[si].level + '\n' + 
      ' lineNumber: ' + actionLogs[si].lineNumber + ' rule: ' + actionLogs[si].rule + ' conclusion: ' + actionLogs[si].conclusion + ' preconds: ' + actionLogs[si].preconds + '\n' + 
      ' answer: ' + actionLogs[si].answer + ' attempt: ' + actionLogs[si].attempt + ' correct: ' + actionLogs[si].correct + ' hintsClicked: ' + actionLogs[si].hintsClicked + ' numAttempts: ' + actionLogs[si].numAttempts + ' kcscore: ' + actionLogs[si].kcscore + '\n' +
      ' elapsedTime: ' + actionLogs[si].elapsedTime + ' timeToMastery: ' + actionLogs[si].timeToMastery + '\n' +   
      ' timeToLevel: ' + actionLogs[si].timeToLevel + ' timeToSystem: ' + actionLogs[si].timeToSystem + '\n' + 
      ' clientDate: ' + actionLogs[si].clientDate + ' clientTime: ' + actionLogs[si].clientTime + '\n' +
      ' serverDate: ' + actionLogs[si].serverDate + ' serverTime: ' + actionLogs[si].serverTime);
}

//populates the StudentModel and KTScores with default values
function setUpStudentAccount (userid) {
	//for debugging
	console.log('setting up account with id ' + userid);

	//insert default values into the StudentModel
	//the StudentModel contains information necessary to preserve the student's state across both stages	
	StudentModel.insert({_id: userid, level: 0, sublevel: 0, lastlineadded: 1, currentline: undefined, completedlines: [], hintsclicked: [],
                        currentpage: 'flashcards', currentproblemindex: 0, partialproblems: new AProblem().problems,
                        flashcardscolor: 0, partialproofcolor: 0});

	//insert INIT_K scores for each rule and sublevel into the KTScores
	//each KTScores document is uniquely identified by:
	//	the userid of the student who has the score +
	//	the rule that the score is tracking +
	//	the sublevel that the score is tracking.
	//This id system was chosen to ensure that the KTScores can be modified by client-side code,
	//since client code can only modify documents by _id.
    for (var k = 0; k < 3; k++) {
    	var mpid = userid + "MP" + k;
    	var mtid = userid + "MT" + k;
    	var dsid = userid + "DS" + k;
    	var addid = userid + "ADD" + k;
    	var simpid = userid + "SIMP" + k;
    	var conjid = userid + "CONJ" + k;
    	var hsid = userid + "HS" + k;
    	var cdid = userid + "CD" + k;
    	var dnid = userid + "DN" + k;
    	var demid = userid + "DeM" + k;
    	var implid = userid + "Impl" + k;
    	var cpid = userid + "CP" + k;
    	var equivid = userid + "Equiv" + k;
    	var commid = userid + "Comm" + k;
    	var associd = userid + "Assoc" + k;
    	var distid = userid + "Dist" + k;
    	var absid = userid + "Abs" + k;
    	var expid = userid + "Exp" + k;
    	var tautid = userid + "Taut" + k;
      	KTScores.insert({_id: mpid, stdnt_id: userid, rule: "MP", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: mtid, stdnt_id: userid, rule: "MT", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: dsid, stdnt_id: userid, rule: "DS", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: addid, stdnt_id: userid, rule: "ADD", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: simpid, stdnt_id: userid, rule: "SIMP", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: conjid, stdnt_id: userid, rule: "CONJ", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: hsid, stdnt_id: userid, rule: "HS", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: cdid, stdnt_id: userid, rule: "CD", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: dnid, stdnt_id: userid, rule: "DN", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: demid, stdnt_id: userid, rule: "DeM", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: implid, stdnt_id: userid, rule: "Impl", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: cpid, stdnt_id: userid, rule: "CP", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: equivid, stdnt_id: userid, rule: "Equiv", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: commid, stdnt_id: userid, rule: "Comm", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: associd, stdnt_id: userid, rule: "Assoc", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: distid, stdnt_id: userid, rule: "Dist", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: absid, stdnt_id: userid, rule: "Abs", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: expid, stdnt_id: userid, rule: "Exp", sublevel: k, score: INIT_K});
      	KTScores.insert({_id: tautid, stdnt_id: userid, rule: "Taut", sublevel: k, score: INIT_K});
    }
}
}