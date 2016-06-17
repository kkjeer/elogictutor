	//stores all of the rules
	var inferenceRules = ['MP', 'MT', 'DS', 'ADD', 'SIMP', 'CONJ', 'HS', 'CD'];
	var replacementRules = ['DN', 'DeM', 'Impl', 'CP', 'Equiv'];
	var algebraicRules = ['Comm', 'Assoc', 'Dist', 'Abs', 'Exp', 'Taut'];

	Template.dataanalysis.rendered = function () {
		//set up the select input to choose the name for data analysis
		var html;
		Meteor.call('setUpNameSelect', function (error, result) {
			$('#nametoprint').html(result);
			html = result;
		});
		$('body').css('background-color', 'white');
	}

	//add click handlers to the data analysis buttons (in the dataanalysistemplate)
	Template.dataanalysis.events({
		'click #printUserLogsButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;
			Meteor.call('printUserLogs', name);
			printUserLogs(name);
		},

		'click #removeUserLogsButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;
			Meteor.call('removeUserLogs', name);
			printAllLogs();
		},

		'click #printAllLogsButton': function (e) {
			e.preventDefault();
			Meteor.call('printAllLogs');
			printAllLogs();
		},

		'click #removeAllLogsButton': function (e) {
			e.preventDefault();
			Meteor.call('removeAllLogs');
		},

		'click #averageTimeButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;
			var select = document.getElementById('typetoprint');
			var type = select[select.selectedIndex].value;
			var rule = document.getElementById('ruletoprint').value;
			console.log('rule: ' + rule);
			Meteor.call('averageTime', name, type, rule);
			var average = averageTime(name, type, rule);
			$('#dataResults').html('Average time for user ' + name + ', type ' + type + ', and rule ' + rule + ': ' + average.toFixed(4) + ' seconds');
		},

		'click #hintsInfoButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;
			var rule = document.getElementById('ruletoprint').value;
			Meteor.call('hintsInfo', name, rule);
			var hints = hintsInfo(name, rule);
			$('#dataResults').html('Average number of hints clicked per problem for user ' + name + ' and rule ' + rule + ': ' + hints.toFixed(4));
		},

		'click #averageTimeAllButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;
			var select = document.getElementById('typetoprint');
			var type = select[select.selectedIndex].value;

			var html = '';
			var total = 0;
			for (var i in inferenceRules) {
				Meteor.call('averageTime', name, type, inferenceRules[i]);
				var average = averageTime(name, type, inferenceRules[i]);
				html += 'Average time for user ' + name + ', type ' + type + ', and rule ' + inferenceRules[i] + ': ' + average.toFixed(4) + ' seconds<br>';
				total += average;
			}
			for (var r in replacementRules) {
				Meteor.call('averageTime', name, type, replacementRules[r]);
				var average = averageTime(name, type, replacementRules[r]);
				html += 'Average time for user ' + name + ', type ' + type + ', and rule ' + replacementRules[r] + ': ' + average.toFixed(4) + ' seconds<br>';
				total += average;
			}
			for (var a in algebraicRules) {
				Meteor.call('averageTime', name, type, algebraicRules[a]);
				var average = averageTime(name, type, algebraicRules[a]);
				html += 'Average time for user ' + name + ', type ' + type + ', and rule ' + algebraicRules[a] + ': ' + average.toFixed(4) + ' seconds<br>';
				total += average;
			}
			var overallAverage = total/(inferenceRules.length + replacementRules.length + algebraicRules.length);
			html += 'Overall average time: ' + overallAverage.toFixed(4) + ' seconds';
			$('#dataResults').html(html);
		},

		'click #hintsInfoAllButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;

			var html = '';
			var total = 0;
			for (var i in inferenceRules) {
				Meteor.call('hintsInfo', name, inferenceRules[i]);
				var average = hintsInfo(name, inferenceRules[i]);
				html += 'Average number of hints clicked per problem for user ' + name + ' and rule ' + inferenceRules[i] + ': ' + average.toFixed(4) + '<br>';
				total += average;
			}
			for (var r in replacementRules) {
				Meteor.call('hintsInfo', name, replacementRules[r]);
				var average = hintsInfo(name, replacementRules[r]);
				html += 'Average number of hints clicked per problem for user ' + name + ' and rule ' + replacementRules[r] + ': ' + average.toFixed(4) + '<br>';
				total += average;
			}
			for (var a in algebraicRules) {
				Meteor.call('hintsInfo', name, algebraicRules[a]);
				var average = hintsInfo(name, algebraicRules[a]);
				html += 'Average number of hints clicked per problem for user ' + name + ' and rule ' + algebraicRules[a] + ': ' + average.toFixed(4) + '<br>';
				total += average;
			}
			var overallAverage = total/(inferenceRules.length + replacementRules.length + algebraicRules.length);
			html += 'Overall average number of hints clicked per problem: ' + overallAverage.toFixed(4);
			$('#dataResults').html(html);
		},

		'click #proportionsButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;
			var rule = document.getElementById('ruletoprint').value;
			Meteor.call('answerProportions', name, rule);
			var correct = answerProportions(name, rule).correct;
			var incorrect = answerProportions(name, rule).incorrect;
			var html = 'Proportion of correct answers for user ' + name + ' and rule ' + rule + ': ' + correct.toFixed(4) + '<br>' + 
									'Proportion of incorrect answers for user ' + name + ' and rule ' + rule + ': ' + incorrect.toFixed(4);
			$('#dataResults').html(html);
		},

		'click #proportionsAllButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;

			var html = '';
			var totalCorrect = 0;
			var totalIncorrect = 0;
			for (var i in inferenceRules) {
				Meteor.call('answerProportions', name, inferenceRules[i]);
				var proportions = answerProportions(name, inferenceRules[i]);
				var correct = proportions.correct;
				var incorrect = proportions.incorrect;
				totalCorrect += correct;
				totalIncorrect += incorrect;
				html += 'Proportion of correct answers for user ' + name + ' and rule ' + inferenceRules[i] + ': ' + correct.toFixed(4) + '<br>' + 
									'Proportion of incorrect answers for user ' + name + ' and rule ' + inferenceRules[i] + ': ' + incorrect.toFixed(4) + '<br><br>';
			}
			for (var r in replacementRules) {
				Meteor.call('answerProportions', name, replacementRules[r]);
				var proportions = answerProportions(name, replacementRules[r]);
				var correct = proportions.correct;
				var incorrect = proportions.incorrect;
				totalCorrect += correct;
				totalIncorrect += incorrect;
				html += 'Proportion of correct answers for user ' + name + ' and rule ' + replacementRules[r] + ': ' + correct.toFixed(4) + '<br>' + 
									'Proportion of incorrect answers for user ' + name + ' and rule ' + replacementRules[r] + ': ' + incorrect.toFixed(4) + '<br><br>';
			}
			for (var a in algebraicRules) {
				Meteor.call('answerProportions', name, algebraicRules[a]);
				var proportions = answerProportions(name, algebraicRules[a]);
				var correct = proportions.correct;
				var incorrect = proportions.incorrect;
				totalCorrect += correct;
				totalIncorrect += incorrect;
				html += 'Proportion of correct answers for user ' + name + ' and rule ' + algebraicRules[a] + ': ' + correct.toFixed(4) + '<br>' + 
									'Proportion of incorrect answers for user ' + name + ' and rule ' + algebraicRules[a] + ': ' + incorrect.toFixed(4) + '<br><br>';
			}
			var overallCorrect = totalCorrect/(inferenceRules.length + replacementRules.length + algebraicRules.length);
		var overallIncorrect = totalIncorrect/(inferenceRules.length + replacementRules.length + algebraicRules.length);
		html += 'Overall correct proportion: ' + overallCorrect.toFixed(4) + '<br>' + 'Overall incorrect proportion: ' + overallIncorrect.toFixed(4);
		$('#dataResults').html(html);
		},

		'click #printKCButton': function (e) {
			e.preventDefault();
			var name = document.getElementById('nametoprint').value;
			console.log('nametoprint: ' + name);
			var rule = document.getElementById('ruletoprint').value;

			var html = '';
			if (name == 'all') {
				var actionLog = ActionLog.find({}).fetch();

	      //a list of unique names in the action logs
	      var names = [];
	      for (var action in actionLog) {
	        var nameaction = actionLog[action].name;
	        if (names.indexOf(nameaction) == -1) {
	          names.push(nameaction);
	        }
	      }

				for (var n in names) {
					var namekc = names[n];
					if (rule == 'all') {
						html += handleAllKCScores(namekc);
					} else {
						html += handleOneKCScore(namekc, rule);
					}
				}
			} else {
				if (rule == 'all') {
					html += handleAllKCScores(name);
				} else {
					html += handleOneKCScore(name, rule);
				}
			}
			$('#dataResults').html(html);
		},

		'click #printAllKCButton': function (e) {
			e.preventDefault();
			var html = '';

			var actionLog = ActionLog.find({}).fetch();

      //a list of unique names in the action logs
      var names = [];
      for (var action in actionLog) {
        var name = actionLog[action].name;
        if (names.indexOf(name) == -1) {
          names.push(name);
        }
      }

			for (var n in names) {
				var name = names[n];
				handleAllKCScores(name);
			}			
			$('#dataResults').html(html);
		}
	});

	function handleOneKCScore (name, rule) {
		var student = Meteor.users.find({username: name}).fetch()[0]._id;

		var total = 0;
		var entries = 0;
		var html = '****** ' + name + ' ' + rule + ' ******<br>';
		for (var sublevel = 0; sublevel < 3; sublevel++) {
			var kc = printKCScore(student, sublevel, rule);
			total += kc;
			entries++;
			html += 'kc score for ' + student + ' (' + name + ') for rule ' + rule + ' and sublevel ' + sublevel + ': ' + kc.toFixed(5) + '<br>';
		}
		var average = total/entries;
		html += 'Average KC score: ' + average.toFixed(5) + '<br><br>';
		return html;
	}

	function handleAllKCScores (name) {
		var html = '';
		for (var i = 0; i < inferenceRules.length; i++) {
			html += handleOneKCScore(name, inferenceRules[i]);
		}
		for (var r = 0; i < replacementRules.length; r++) {
			html += handleOneKCScore(name, replacementRules[r]);
		}
		for (var a = 0; a < algebraicRules.length; a++) {
			html += handleOneKCScore(name, algebraicRules[a]);
		}
		return html;
	}

	function averageTime (name, type, rule) {
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
        //get the time based on the type of time being searched for (problem, mastery, level, or system)
        if (type == 'problem') {
          var time = actionLog[i].elapsedTime;
        } else if (type == 'mastery') {
          var time = actionLog[i].timeToMastery;
        } else if (type == 'level') {
          var time = actionLog[i].timeToLevel;
        } else if (type == 'kc') {
        	var time = actionLog[i].kcscore;
        } else {
          var time = actionLog[i].timeToSystem;
        }
        console.log('time: ' + time);

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
          	if (type == 'kc') {
          		console.log('typeof time: ' + typeof time);
          		//if (typeof time == "string") {
          			total += parseFloat(time[0]);
          		//}
          	} else {
          		total += time;
          	}
          }  
        } 
        console.log('total: ' + total);      
      }

      //compute the average and log the information to the console
      var average = total/entries;
      console.log('+++++TIME+++++ user: ' + name + ' | type: ' + type + ' | rule: ' + rule + ' | total: ' + total + ' | entries: ' + entries + ' | average (in seconds): ' + average.toFixed(4));

      return average;
    }

  function hintsInfo (name, rule) {
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
      console.log('-----HINTS----- user: ' + name + ' | rule: ' + rule + ' | total: ' + total + 
      						' | number of possible hint problems: ' + entries + ' | average: ' + average.toFixed(4));

      return average;
    }

  function answerProportions (name, rule) {
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

    return {'correct': correctproportion, 'incorrect': incorrectproportion};
  }

  function printUserLogs (name) {
      var actionLogs = ActionLog.find({name: name}).fetch();
      if (name == 'all') {
        actionLogs = ActionLog.find({}).fetch();
      }
      if (actionLogs.length == 0) {
        console.log('no logs to print for user ' + name);
      }

      console.log();
      console.log();

      var html = '';
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

				html += 'si: ' + si + ' _id: ' + actionLogs[si]._id + '<br> studentid: ' + actionLogs[si].student + ' studentname: ' + actionLogs[si].name + '<br>' +
          ' ruleSet: ' + actionLogs[si].ruleSet + ' level: ' + actionLogs[si].level + '<br>' + 
          ' lineNumber: ' + actionLogs[si].lineNumber + ' rule: ' + actionLogs[si].rule + ' conclusion: ' + actionLogs[si].conclusion + ' preconds: ' + actionLogs[si].preconds + '<br>' + 
          ' answer: ' + actionLogs[si].answer + ' attempt: ' + actionLogs[si].attempt + ' correct: ' + actionLogs[si].correct + ' hintsClicked: ' + actionLogs[si].hintsClicked + ' numAttempts: ' + actionLogs[si].numAttempts + ' kcscore: ' + actionLogs[si].kcscore + '<br>' +
          ' elapsedTime: ' + actionLogs[si].elapsedTime + ' timeToMastery: ' + actionLogs[si].timeToMastery + '<br>' + 
          ' timeToLevel: ' + actionLogs[si].timeToLevel + ' timeToSystem: ' + actionLogs[si].timeToSystem + '<br>' + 
          ' clientDate: ' + actionLogs[si].clientDate + ' clientTime: ' + actionLogs[si].clientTime + '<br>' +
          ' serverDate: ' + actionLogs[si].serverDate + ' serverTime: ' + actionLogs[si].serverTime + '<br><br>';
      }
      $('#dataResults').html(html);
    }

    function printAllLogs () {
      var actionLogs = ActionLog.find({}).fetch();
      if (actionLogs.length == 0) {
        console.log('no action logs to print');
      }

      console.log();
      console.log();

      var html = '';
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

				html += 'si: ' + si + ' _id: ' + actionLogs[si]._id + '<br> studentid: ' + actionLogs[si].student + ' studentname: ' + actionLogs[si].name + '<br>' +
          ' ruleSet: ' + actionLogs[si].ruleSet + ' level: ' + actionLogs[si].level + '<br>' + 
          ' lineNumber: ' + actionLogs[si].lineNumber + ' rule: ' + actionLogs[si].rule + ' conclusion: ' + actionLogs[si].conclusion + ' preconds: ' + actionLogs[si].preconds + '<br>' + 
          ' answer: ' + actionLogs[si].answer + ' attempt: ' + actionLogs[si].attempt + ' correct: ' + actionLogs[si].correct + ' hintsClicked: ' + actionLogs[si].hintsClicked + ' numAttempts: ' + actionLogs[si].numAttempts + ' kcscore: ' + actionLogs[si].kcscore + '<br>' +
          ' elapsedTime: ' + actionLogs[si].elapsedTime + ' timeToMastery: ' + actionLogs[si].timeToMastery + '<br>' + 
          ' timeToLevel: ' + actionLogs[si].timeToLevel + ' timeToSystem: ' + actionLogs[si].timeToSystem + '<br>' + 
          ' clientDate: ' + actionLogs[si].clientDate + ' clientTime: ' + actionLogs[si].clientTime + '<br>' +
          ' serverDate: ' + actionLogs[si].serverDate + ' serverTime: ' + actionLogs[si].serverTime + '<br><br>';
      }
      $('#dataResults').html(html);
    }

    function printKCScore (student, sublevel, rule) {
      var kc = KTScores.find({stdnt_id: student, sublevel: sublevel, rule: rule}).fetch()[0].score;
      //console.log('kc score for ' + student + ' for rule ' + rule + ' and sublevel ' + sublevel + ': ' + kc);
      return kc;
    }