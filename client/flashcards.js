/*GLOBAL (JavaScript) CONSTANTS*/
var AND = "\u2227";					//Character code for ∧
var OR = "\u2228";					//Character code for ∨
var NOT = "\xAC";					//Character code for ¬
var IMP = "\u2192";					//Character code for → (represented by % on server and in php)
var UP = "↑";                       //Character code for ↑ used in working backwards button
var EQUAL = "\u2194";               //Character code for ↔
var EMPTY = "⊥";
var IFF = "↔";						//Symbol for the double arrow(algebraic)
var SQ = "□";                       //Character for code &#9633
var TR = "△";                       //Character for code &#9651
var CI = "○";                       //Character for code #9675
var DI = "◊";                       //Character for code &#9674
var STAR = "&#9734";				//Character code for empty white star
var BLACKSTAR = "&#9733";			//Character code for a solid black star

var adminName = 'kkjeer';

//constants for knowledge tracing
var GUESS = 0.1;
var SLIP = 0.3;
var INIT_K = 0.01;
var MIN_K = 0.9;
var TRANSITION = 0.1;

//minimum level for supermastery
var SUPER_M = 0.99;

//stores all of the rules
var inferenceRules = ['MP', 'MT', 'DS', 'ADD', 'SIMP', 'CONJ', 'HS', 'CD'];
var replacementRules = ['DN', 'DeM', 'Impl', 'CP', 'Equiv'];
var algebraicRules = ['Comm', 'Assoc', 'Dist', 'Abs', 'Exp', 'Taut'];

//distinguishes between unmastered and mastered rules
var unmastered = ['MP', 'MT', 'DS', 'ADD', 'SIMP', 'CONJ', 'HS', 'CD'];
var mastered = [];
var supermastered = [];

//stores the number of stars for each rule (each star value ranges from 0 to MIN_K)
var inferenceMastery = [0, 0, 0, 0, 0, 0, 0, 0];		
var replacementMastery = [0, 0, 0, 0, 0, 0];
var algebraicMastery = [0, 0, 0, 0, 0, 0];

//stores the learning score for each rule
var inferenceScores = [INIT_K, INIT_K, INIT_K, INIT_K, INIT_K, INIT_K, INIT_K, INIT_K];
var replacementScores = [INIT_K, INIT_K, INIT_K, INIT_K, INIT_K, INIT_K];
var algebraicScores = [INIT_K, INIT_K, INIT_K, INIT_K, INIT_K, INIT_K];

//alphabet for choosing random letters when generating new lines
var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
				'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

lastLineAdded = 1;

//tells how many rules have to be mastered to pass the level
var numRules;

//corresponds to the current level (inference, replacement, or algebraic) and sublevel (rule, conclusion, or premises)
var currentLevel;
var currentSubLevel;

//for color schemes
var colorSchemes = new ColorSchemeArray().colorSchemes;
var colorIndex = 0;

var currentLine;
var completedLines;
var line;
var premiseOrder;

var flashcardsRendered;

//for database interactions
//userID = "";
var courseID;

//for action logging
var levelStartTime;
var problemStartTime;
var hintsClicked;
var mode;

//rule priorities
//var rulePriority = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var rulePriority = {'MP':0.5, 'MT':0.5, 'DS':0.5, 'ADD':0.5, 'SIMP':0.5, 'CONJ':0.5, 'HS':0.5, 'CD':0.5, 'DN':0.5, 'DeM':0.5, 'Impl':0.5, 'CP':0.5, 'Equiv':0.5, 'Comm':0.5, 'Assoc':0.5, 'Dist':0.5, 'Abs':0.5, 'Exp':0.5, 'Taut':0.5};

StudentModel = new Meteor.Collection("studentmodel");
KTScores = new Meteor.Collection("ktscores");
ActionLog = new Meteor.Collection("actionlog");

Router.route('/', {
	waitOn: function () {
    // return one handle, a function, or an array
    return [Meteor.subscribe('studentmodel'), Meteor.subscribe('ktscores'), Meteor.subscribe('actionlog')];
  },

  action: function () {
    //this.ready() is true if all items returned from waitOn are ready
    if (this.ready()) {
    	Session.set('currentPage', StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentpage);
    	if (Session.get('currentPage') == 'partialproof')
    		this.redirect('/partialproof');
    	else
    		this.redirect('/flashcards');
    }
    else
      this.render('Loading');
  }
});

Router.route('/flashcards', {
	waitOn: function () {
    return [Meteor.subscribe('studentmodel'), Meteor.subscribe('ktscores'), Meteor.subscribe('actionlog')];
  },

  action: function () {
    if (this.ready()) {
    	this.render('flashcards');
    }
    else
      this.render('Loading');
  }
});

Router.route('/partialproof', {
	waitOn: function () {
    return [Meteor.subscribe('studentmodel'), Meteor.subscribe('ktscores'), Meteor.subscribe('actionlog')];
  },

  action: function () {
    if (this.ready())
      this.render('partialproof');
    else
      this.render('Loading');
  }
});

Router.route('/dataanalysis', {
	waitOn: function () {
    return [Meteor.subscribe('studentmodel'), Meteor.subscribe('ktscores'), Meteor.subscribe('actionlog')];
  },

  action: function () {
    if (this.ready()) {
    	if (Meteor.user() && Meteor.user().username == adminName) {
    		this.render('dataanalysis');
    	} else {
    		this.render('forbidden');
    	}
    } else {
    	this.render('Loading');
    }  
  }
});

Router.onBeforeAction(function () {
  if (!Meteor.user()) {
    //if the user is not logged in, render the login template
    this.render('login');
  } else {
    //otherwise don't hold up the rest of hooks or our route/action function from running
    this.next();
  }
});

Template.flashcards.rendered = function () {
	//update the currentPage
	Session.set('currentPage', 'flashcards');
	Meteor.call('updateStudentModel', 'currentpage', 'flashcards', 'rendering flashcards');

	//fix the navigation bar
	$('.dropdown-toggle').dropdown();
	$('#flashcardslistitem').remove();
	if (!(Meteor.user() && Meteor.user().username == adminName)) {
		$('#dataanalysislink').remove();
	}

	$('body').css('background-color', '#e8e8e8');

	//set up the scores from the Collections
	setUpScores(Meteor.userId());

	//initialize eLogicTutor
	$(initialize);
}

if (Meteor.isClient) {
	$('#partialProblemDivider').hide();

	//configure the login options to require only a username
	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_ONLY'
	});

	//set the flashcards template to display a welcome message to the user in the studentInfoDiv
	Template.flashcards.helpers({
		name: function () {
			return Meteor.user().username;
		}
	});

	//add click handler to the buttons in the flashcards div
	Template.flashcards.events({
		'click #nextLineButton': function (e) {
			e.preventDefault();
			hintsClicked = [];
			Meteor.call('updateStudentModel', 'hintsclicked', hintsClicked);
			problemStartTime = new Date();
			Session.set('problemstarttime', problemStartTime);
			Meteor.call('updateStudentModel', 'problemstarttime', problemStartTime);
			currentLine = undefined;
			for (var inf in inferenceRules) {
				$('#' + inferenceRules[inf]).css('background-color', '');
			}
			for (var rep in replacementRules) {
				$('#' + replacementRules[rep]).css('background-color', '');
			}
			for (var alg in algebraicRules) {
				$('#' + algebraicRules[alg]).css('background-color', '');
			}
			start();
		},
		'click #nextLevelButton': function (e) {
			e.preventDefault();
			moveToNextLevel();
		},
		'click #partialprooflink': function (e) {
			Session.set('currentPage', 'partialproof');
			Meteor.call('updateStudentModel', 'currentpage', Session.get('currentPage'), 'clicking partialprooflink');
		},
		'change #hintsToggle': function (e) {
			e.preventDefault();
			var hints = document.getElementById('hintsToggle').checked;
			if (hints == true) {
				var rule = $('.selected').data('rule');
				makeHint(rule);
			} else {
				$('#hoverFlashcards').hide();
			}
		},
		'click #keyboardButton': function (e) {
			e.preventDefault();
			var input = document.getElementById('keyboardInput').value;
			var parsed = parseElement(input);
			handleAnswer(Session.get('keyboardid'), parsed);
		},
		'keyup #keyboardInput': function (e) {
			e.preventDefault();
			if (e.keyCode == 13) {
				$('#keyboardButton').click();
			}
		},
		'click .virtualKeyboardButton': function (e) {
			e.preventDefault();

			//handle the different button clicks:
			//delete button
			if (e.target.id == 'Delete') {
				var html = $('#virtualKeyboardInput').html();
				var last = html.substring(html.length - 1, html.length);
				//if the last character is a space, user is deleting a binary logical operator (AND, OR, IMP, or EQUAL),
				//so delete the space after the operator, the operator, and the space before the operator
				//otherwise, the user is deleting a letter, parentheses, or unary operator (NOT),
				//so just delete the last character
				if (last == ' ') {
					html = html.substring(0, html.length - 3);
				} else {
					//delete the last character
					html = html.substring(0, html.length - 1);
				}
				$('#virtualKeyboardInput').html(html);
			} 
			//clear button
			else if (e.target.id == 'Clear') {
				//set the input html to empty
				$('#virtualKeyboardInput').html('');
			} 
			//submit button
			else if (e.target.id == 'Submit') {
				//figure out the id of the missing line element based on sublevel
				var id;
				if (currentSubLevel == 1) {
					id = 'correctConclusion' + currentLine.number;
				} else {
					id = 'correctPremise' + currentLine.number;
				}
				Session.set('keyboardid', id);

				//handle the answer with the input html
				handleAnswer(Session.get('keyboardid'), $('#virtualKeyboardInput').html());
			} else if (e.target.id == 'leftparen') {
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + '(');
			} else if (e.target.id == 'rightparen') {
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + ')');
			} else if (e.target.id == 'and') {
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + ' ' + AND + ' ');
			} else if (e.target.id == 'or') {
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + ' ' + OR + ' ');
			} else if (e.target.id == 'not') {
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + NOT);
			} else if (e.target.id == 'imp') {
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + ' ' + IMP + ' ');
			} else if (e.target.id == 'equal') {
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + ' ' + EQUAL + ' ');
			}
			//a letter button
			else {
				//add the letter or symbol to the input html
				var html = $('#virtualKeyboardInput').html();
				$('#virtualKeyboardInput').html(html + e.target.id);
			}

			//un-focus the clicked button
			$('#' + e.target.id).blur();
		},
		'change #colorSelect': function (e) {
			e.target.blur();
			e.preventDefault();
			var select = document.getElementById('colorSelect');
			colorIndex = select[select.selectedIndex].value;
			Meteor.call('updateStudentModel', 'flashcardscolor', colorIndex);
			changeColors(colorSchemes[colorIndex]);
			changeInstructions();
		}
	});

	Accounts.onLogin(function () {
		Router.go('/');
	});

	Accounts.onLogout(function () {
		Router.go('/');
		$('body').css('background-color', '#ffffff');
		$('#favicon').attr('href', '/default.ico');
	});
}

//gets the information from the Collections relevant to the flashcards stage
//and sets the respective globals for use throughout the stage.
//the modified globals are restored in the Collections before the user leaves the flashcards page
//so the user's progress is preserved.
function setUpScores (userid) {
	//set the currentLevel	
	currentLevel = StudentModel.find({_id: userid}).fetch()[0].level;
	if (currentLevel == undefined) {
		Meteor.call('updateStudentModel', 'level', 0, 'setUpScores');
		currentLevel = 0;
	}

	//set the currentSubLevel
	currentSubLevel = StudentModel.find({_id: userid}).fetch()[0].sublevel;
	if (currentSubLevel == undefined) {
		Meteor.call('updateStudentModel', 'sublevel', 0, 'setUpScores');
		currentSubLevel = StudentModel.find({_id: userid}).fetch()[0].sublevel;
	}

	//initialize the unmastered, mastered, and supermastered arrays
	unmastered = ['MP', 'MT', 'DS', 'ADD', 'SIMP', 'CONJ', 'HS', 'CD'];
	if (currentSubLevel == 2) {
		unmastered = ['MP', 'MT', 'DS', 'CONJ', 'HS', 'CD'];
	}
	mastered = [];
	supermastered = [];
	if (currentLevel == 1) {
		unmastered = ['DN', 'DeM', 'Impl', 'CP', 'Equiv'];
	} else if (currentLevel == 2) {
		unmastered = ['Comm', 'Assoc', 'Dist', 'Abs', 'Exp', 'Taut'];
	}

	//set the lastLineAdded
	lastLineAdded = StudentModel.find({_id: userid}).fetch()[0].lastlineadded;
	if (lastLineAdded == undefined) {
		Meteor.call('updateStudentModel', 'lastlineadded', 1, 'setUpScores');
		lastLineAdded = StudentModel.find({_id: userid}).fetch()[0].lastlineadded;
	}

	//set the inference, replacement, and algebraic scores
	//use the scores to set the mastered, unmastered, and supermastered arrays
	for (var i in inferenceRules) {
		var inferenceid = userid + inferenceRules[i] + currentSubLevel;
		inferenceScores[i] = KTScores.find({_id: inferenceid}).fetch()[0].score;
		if (currentLevel == 0) {
			if (inferenceScores[i] >= SUPER_M) {
				unmastered.splice(unmastered.indexOf(inferenceRules[i]), 1);
				mastered.push(inferenceRules[i]);
				supermastered.push(inferenceRules[i]);
			} else if (inferenceScores[i] >= MIN_K) {
				unmastered.splice(unmastered.indexOf(inferenceRules[i]), 1);
				mastered.push(inferenceRules[i]);
			}
		}
	}
	for (var r in replacementRules) {
		var replacementid = userid + replacementRules[r] + currentSubLevel;
		replacementScores[r] = KTScores.find({_id: replacementid}).fetch()[0].score;
		if (currentLevel == 1) {
			if (replacementScores[r] >= SUPER_M) {
				unmastered.splice(unmastered.indexOf(replacementRules[r]), 1);
				mastered.push(replacementRules[r]);
				supermastered.push(replacementRules[r]);
			} else if (replacementScores[r] >= MIN_K) {
				unmastered.splice(unmastered.indexOf(replacementRules[r]), 1);
				mastered.push(replacementRules[r]);
			}	
		}	
	}
	for (var a in algebraicRules) {
		var algebraicid = userid + algebraicRules[a] + currentSubLevel;
		algebraicScores[a] = KTScores.find({_id: algebraicid}).fetch()[0].score;
		if (currentLevel == 2) {
			if (algebraicScores[a] >= SUPER_M) {
				unmastered.splice(unmastered.indexOf(algebraicRules[a]), 1);
				mastered.push(algebraicRules[a]);
				supermastered.push(algebraicRules[a]);
			} else if (algebraicScores[a] >= MIN_K) {
				unmastered.splice(unmastered.indexOf(algebraicRules[a]), 1);
				mastered.push(algebraicRules[a]);
			}
		}	
	}

	//set the currentLine
	currentLine = StudentModel.find({_id: userid}).fetch()[0].currentline;

	//set the completedLines
	completedLines = StudentModel.find({_id: userid}).fetch()[0].completedlines;
	if (completedLines == undefined) {
		completedLines = [];
		Meteor.call('updateStudentModel', 'completedlines', [], 'setUpScores');
	}

	//set the currentPage
	Session.set('currentPage', StudentModel.find({_id: userid}).fetch()[0].currentpage);

	//set the hintsClicked
	hintsClicked = StudentModel.find({_id: userid}).fetch()[0].hintsclicked;
	if (hintsClicked == undefined) {
		hintsClicked = [];
		Meteor.call('updateStudentModel', 'hintsclicked', [], 'setUpScores');
	}

	//set the levelStartTime
	levelStartTime = Session.get('levelstarttime');
	if (levelStartTime == undefined) {
		levelStartTime = new Date();
		Session.set('levelstarttime', levelStartTime);
	}

	//set the problemStartTime
	problemStartTime = Session.get('problemstarttime');
	if (problemStartTime == undefined) {
		problemStartTime = new Date();
		Session.set('problemstarttime', problemStartTime);
	}

	//set the flashcardscolor
	colorIndex = StudentModel.find({_id: userid}).fetch()[0].flashcardscolor;
	if (colorIndex == undefined) {
		colorIndex = 0;
		Meteor.call('updateStudentModel', 'flashcardscolor', 0), 'setUpScores';
	}
	if (document.getElementById('colorSelect'))
		document.getElementById('colorSelect').selectedIndex = colorIndex;
	changeColors(colorSchemes[colorIndex]);
}

//initializes/resets the JT system
//called each time the page reloads and when moving to a new level
function initialize () {
	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	if (!mobile) {
		$('.topSpace').remove();
	}

	var height = currentSubLevel == 0 ? 400 : 500;
	$('.tdContainer').height(height);

	//show the checkbox for pop-up examples - only for mobile devices
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		//$('#ruleInstructions').css('margin=bottom', '50px');
		$('#hintsToggle').show();
		$('#hintsLabel').show();
		if (currentSubLevel == 1 || currentSubLevel == 2) {
			$('#hintsToggle').hide();
			$('#hintsLabel').hide();
		}
		$('.virtualKeyboardButton').css('margin', 4);
		$('#virtualKeyboardDiv').css('top', 510).css('left', 430);
		$('#Submit').css('margin', 15);
	} else {
		$('.virtualKeyboardButton').css('margin', 3);
		$('#hintsToggle').hide();
		$('#hintsLabel').hide();
	}
	

	//hide the div containing the pop-up rule examples
	$('#hoverFlashcards').hide();

	if (hintsClicked == null || hintsClicked == undefined) {
		hintsClicked = [];
	}

	//determine the current scores, rules, and number of rules necessary to pass the level
	//based on the current level
	var currentScores = inferenceScores;
	var currentRules = [];
	for (var i in inferenceRules) {
		currentRules[i] = inferenceRules[i];
	}
	numRules = inferenceScores.length;
	if (currentLevel == 1) {
		currentScores = replacementScores;
		currentRules = [];
		for (var r in replacementRules) {
			currentRules[r] = replacementRules[r];
		}
	} else if (currentLevel == 2) {
		currentScores = algebraicScores;
		currentRules = [];
		for (var a in algebraicRules) {
			currentRules[a] = algebraicRules[a];
		}
	}

	//if the current sublevel is justification, remove ADD and SIMP
	if (currentLevel == 0 && currentSubLevel == 2) {
		currentRules.splice(currentRules.indexOf('ADD'), 1);
		currentRules.splice(currentRules.indexOf('SIMP'), 1);
		if (unmastered.indexOf('ADD') != -1) {
			unmastered.splice(unmastered.indexOf('ADD'), 1);
		}
		if (unmastered.indexOf('SIMP') != -1) {
			unmastered.splice(unmastered.indexOf('SIMP'), 1);
		}	
	}
	numRules = currentRules.length;

	//set up the ruleTracker html to display however many stars necessary to master each rule
	var stars = "";
	for (var star = 0; star < 10*MIN_K; star++) {
		stars += STAR;
	}
	var ruleTrackerHtml = "<table>";
	for (var rule = 0; rule < currentRules.length; rule++) {
		if (currentScores[rule.toFixed(2) >= MIN_K]) {
			var allstars = '';
			for (var s = 0; s < 10*MIN_K; s++) {
				allstars += BLACKSTAR;
			}
			ruleTrackerHtml += ('<tr><td id = ' + currentRules[rule] + '>' + currentRules[rule] + ': ' + currentScores[rule].toFixed(2) + ' ' + allstars + '</td></tr>');
		} else {
			ruleTrackerHtml += ('<tr><td id = ' + currentRules[rule] + '>' + currentRules[rule] + ': ' + currentScores[rule].toFixed(2) + ' ' + stars + '</td></tr>');
		}	
	}
	ruleTrackerHtml += "</table>";
	$('#ruleTracker').html(ruleTrackerHtml);

	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		$('#optionsHeading').html('Tappable options');
	}



	//based on the current level:
	//	update the current level name
	//	update the ruleTracker html to display the user's current KTScores
	//	set the example html to display an example corresponding to an inference, replacement, or algebraic line

	//initially assume the current level is inference
	var currentLevelName = 'Inference';	
	for (var i in inferenceRules) {
		updateRuleTrackerHtml(inferenceScores, inferenceMastery, inferenceRules[i], i);
	}
	/*$('#example').html('<div class = \'problemLine line\'><div class = lineNumberBox>#)</div><div class = conclusionBox>conclusion</div><div class = colonDiv>:</div>' + 
							'<div class = premiseBox>justification1</div>, ' + '<div class = premiseBox>justification2</div>' + 
							'  <div class = vertical></div><div class = \'ruleBox lineRule\'>rule</div></div>');*/
	$('#example').html('<div class = \'row problemLine line\'>' + 
											'<div class = \'col-sm-1 col-md-1\'><div class=lineNumberBox>#)</div></div>' + 
											'<div class = \'col-sm-3 col-md3\'><div class=conclusionBox>conclusion</div><div class = colonDiv>:</div></div>' +   
											'<div class = \'col-sm-3 col-md-3\'><div class=premiseBox>justification1</div>,  </div> ' + 
											'<div class = \'col-sm-3 col-md-3\'><div class=premiseBox>justification2</div></div>' +  
											'<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class=\'ruleBox lineRule\'>rule</div></div>' + 
										 '</div>');
	$('#example').height(50);
	$('.row').css('margin-left', '0px').css('margin-right', '0px');
	$('#line').css('margin-left', '0px');

	//current level is replacement
	if (currentLevel == 1) {	
		currentLevelName = 'Replacement';
		for (var r in replacementRules) {
			updateRuleTrackerHtml(replacementScores, replacementMastery, replacementRules[r], r);
		}
		/*$('#example').html('<div class = \'problemLine line\'><div class = lineNumberBox>#)</div><div class = conclusionBox>conclusion</div><div class = colonDiv>:</div>' + 
							'<div class = premiseBox>justification</div> ' +  
							'  <div class = vertical></div><div class = \'ruleBox lineRule\'>rule</div>');*/
		$('#example').html('<div class = \'row problemLine line\'>' + 
												'<div class = \'col-sm-1 col-md-1\'><div class=lineNumberBox>#)</div></div>' + 
												'<div class = \'col-sm-4 col-md-4\'><div class=conclusionBox>conclusion</div>:</div>' +  
												'<div class = \'col-sm-5 col-md-5\'><div class=premiseBox>justification</div></div> ' +  
												'<div class = \'col-sm-1 col-md-1\'><div class=vertical><div class=\'ruleBox lineRule\'>rule</div></div>' + 
											 '</div>');
	} 

	//current level is algebraic
	else if (currentLevel == 2) {
		currentLevelName = 'Algebraic';
		for (var a in algebraicRules) {
			updateRuleTrackerHtml(algebraicScores, algebraicMastery, algebraicRules[a], a);
		}
		/*$('#example').html('<div class = \'problemLine line\'><div class = lineNumberBox>#)</div><div class = conclusionBox>conclusion</div><div class = colonDiv>:</div>' + 
							'<div class = premiseBox>justification</div> ' +  
							'  <div class = vertical></div><div class = \'ruleBox lineRule\'>rule</div>');*/
		$('#example').html('<div class = \'row problemLine line\'>' + 
												'<div class = \'col-sm-1 col-md-1\'><div class=lineNumberBox>#)</div></div>' + 
												'<div class = \'col-sm-3 col-md-3\'><div class=conclusionBox>conclusion</div>:</div>' +  
												'<div class = \'col-sm-6 col-md-6\'><div class=premiseBox>justification</div></div> ' +  
												'<div class = \'col-sm-1 col-md-1\'><div class=vertical><div class=\'ruleBox lineRule\'>rule</div></div>' + 
											 '</div>');
	}	

	//determine the current sublevel name (rule , conclusion or premise) and update the current sublevel html accordingly
	var currentSubLevelName = 'Rule';
	if (currentSubLevel == 1) {
		currentSubLevelName = 'Conclusion';
	} else if (currentSubLevel == 2) {
		currentSubLevelName = 'Justification';
	}
	/*$('#currentLevel').html('<table><tr><th>Rule Set</th><th>Level</th><th>Minimum Score</th></tr>' + 
													'<tr><td>' + currentLevelName + '</td><td>' + currentSubLevelName + '</td><td>' + MIN_K + '</td></tr></table>');*/
	$('#currentLevel').html('<div class=row id=currentLevelTop>' + 
														'<div class=\'col-sm-4 col-md-4\'>Current Rules</div>' + 
														'<div class=\'col-sm-4 col-md-4\'>Current Level</div>' +
														'<div class=\'col-sm-4 col-md-4\'>Min Score</div>' +
													'</div>' + 
													'<div class=row>' + 
														'<div class=\'col-sm-4 col-md-4\'>' + currentLevelName + '</div>' + 
														'<div class=\'col-sm-4 col-md-4\'>' + currentSubLevelName + '</div>' +
														'<div class=\'col-sm-4 col-md-4\'>' + MIN_K + '</div>' +
													'</div>'); 

	//display the minimum mastery level (MIN_K)
	$('#minMastery').html('Minimum mastery level: ' + MIN_K);

	//start the system
	$(start);
}

//starts the system with one randomly chosen initial line
//called each time the 'Next Line' button is clicked and when the page reloads (called in the initialize() function)
function start() {
	//clear the table containing the draggable options, the pop-up example div, and the next line/next level buttons
	$('#rules').empty();
	$('#keyboardDiv').hide();
	$('#virtualKeyboardDiv').hide();
	$('#hoverFlashcards').hide();
	$('#nextLineButton').hide();
	$('#Submit').prop('disabled', false).css('color', colorSchemes[colorIndex].droppablecolor.textcolor).css('background-color', colorSchemes[colorIndex].droppablecolor.backgroundcolor);
	$('#nextLevelButton').css('background-color', colorSchemes[colorIndex].droppablecolor.backgroundcolor).css('width', '100%').hide();	

	//determine the rules and conclusion (premise) choices based on the current level (inference, replacement or algebraic)
	//the draggable options will come from one of these two arrays
	var currentRules = inferenceRules;
	var conclusionChoices = [];
	premiseOrder = Math.random();
	if (currentLevel == 1) {
		currentRules = replacementRules;
		conclusionChoices = makeLine('replacement');
	} else if (currentLevel == 2) {
		currentRules = algebraicRules;
		conclusionChoices = makeLine('algebraic');
	} else {
		conclusionChoices = makeLine('inference');
	}
	
	//determine the draggable options array (either the current rules or the conclusion/premise choices found above) 
	//and the place each option should snap to (rules, premises or conclusions) based on sublevel
	var divArray = currentRules;
	var snapTo = '.correctRule';
	if (currentSubLevel == 1) {
		divArray = conclusionChoices;
		snapTo = '.correctConclusion';
	} else if (currentSubLevel == 2) {
		divArray = conclusionChoices;
		snapTo = '.correctPremise';
	}
	
	//set up the div containing the draggable options (rules, premises, or conclusions depending on sublevel)
	var keyboard = shouldSwitchToKeyboard();
	if (keyboard == true) {
		switchToKeyboard();
	} else {
		for (var i = 0; i < divArray.length; i+=2) {
			$('#rules').append("<tr>");
			//jStop ensures that this code correctly handles the case when divArray.length is odd (namely, in the replacement rule level)
			var jStop = i+1 < divArray.length - 1 ? i+1 : divArray.length - 1;
			for (var j = i; j <= jStop; j++) {
				//append a table cell containing the tappable/draggable element
				$('<td class = bordered id = rule' + j + '>' + divArray[j] + '</td>').data('rule', divArray[j]).appendTo('#rules');

				//if the user is on a mobile device
				var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
				if (mobile) {
					//make the elements tappable
					$('#rule' + j).click(function (event) {
						var target = event.target;
						var hintsToggle = document.getElementById('hintsToggle');
						var hints = hintsToggle.checked;

						//if the target element is already selected, un-select it
						if ($('#' + target.id).hasClass('selected')) {
							$('#' + target.id).removeClass('selected');
							$('#hoverFlashcards').hide();
						} 

						//if the target element is not already selected, un-select the currently selected element (if there is one)
						//and select the target element
						else {
							$('.selected').removeClass('selected');
							$('#' + target.id).addClass('selected');

							if (hints == true) {
								//alert('making a pop-up hint');
								var rule = $('#' + target.id).data('rule');
								makeHint(rule);
							} else {
								$('#hoverFlashcards').hide();
							}

							//add tap functionality to the droppable box:
							//first determine which box is droppable (rule, conclusion, or justification)
							var answerbox = document.getElementById('correctRule' + currentLine.number);
							var answerid = 'correctRule' + currentLine.number;
							switch (currentSubLevel) {
								case 2:
									answerbox = document.getElementById('correctPremise' + currentLine.number);
									answerid = 'correctPremise' + currentLine.number;
									break;
								case 1:
									answerbox = document.getElementById('correctConclusion' + currentLine.number);
									answerid = 'correctConclusion' + currentLine.number;
									break;
								default:
									answerbox = document.getElementById('correctRule' + currentLine.number);
									answerid = 'correctRule' + currentLine.number;
							}

							//make the droppable box tap-able
							$('#' + answerid).click(function (event) {
								event.preventDefault();
								var target = event.target;
								handleAnswer(target.id, $('.selected').data('rule'));
						}); //end of droppable box tap function
					} //end of element-is-not-already-selected clause
				}); //end of bordered tap function
			} 

			//desktop use case - make the elements draggable
			else {
					$('#rule' + j).draggable({
						containment: '#justifiedThoughtDivider',
						stack: '#rules',
						snap: snapTo,
						snapMode: 'inner',
						helper: draggableOptionsHelper,
						revert: true
					});

					//add event to the bordered elements - make an example pop up
					//only when the bordered elements are rules, i.e. sublevel 0
					if (isNaN(currentSubLevel) || currentSubLevel === 0) {
						$('.bordered').click(function () {
							switch (currentLevel) {
								case 1:
									var line = new AProblemLine('replacement', $(this).data('rule'), SQ, TR, CI, DI, premiseOrder, currentSubLevel, lastLineAdded);
									fillReplacementLine(line);
									break;
								case 2:
									var line = new AProblemLine('algebraic', $(this).data('rule'), SQ, TR, CI, DI, premiseOrder, currentSubLevel, lastLineAdded);
									fillReplacementLine(line);
									break;
								default:
									var line = new AProblemLine('inference', $(this).data('rule'), SQ, TR, CI, DI, premiseOrder, currentSubLevel, lastLineAdded);
									fillInferenceLine(line);

							}
							if (hintsClicked[hintsClicked.length - 1] != $(this).data('rule')) {
								hintsClicked.push($(this).data('rule'));
							};
							Meteor.call('updateStudentModel', 'hintsclicked', hintsClicked);
							changeColors(colorSchemes[colorIndex]);
							changeInstructions();
						}); //end of bordered click function
					} //end of rule sublevel check

				//add event to the pop-up example div - disappears when it's clicked
				$('#hoverFlashcards').click(function () {
					$(this).hide();
				}); //end of hoverFlashcards click function

			} //end of mobile/desktop check

		} //end of j loop
		$('rules').append("</tr>");
	} //end of i loop
} //end of keyboard check
	$('#rules').append('</table></div>');

	$('.conclusionBox').css('position', 'static');
	$('.ruleBox').css('position', 'static');
	$('.premiseBox2').css('position', 'static');
	$('.colonDiv').css('position', 'static');
	$('.vertical').css('position', 'static');
	
	//change the background of the bordered tds and the button based on the current level (inference, replacement, or algebraic)
	for (var k = 0; k < currentRules.length; k++) {
		if (currentLevel == 2) {
			$('.bordered').addClass('algebraic');
			$('#nextLineButton').addClass('algebraic');	
			$('#currentLevel').addClass('algebraic');
		} else if (currentLevel == 1) {
			$('.bordered').addClass('replacement');
			$('#nextLineButton').addClass('replacement');
			$('#currentLevel').addClass('replacement');
		} else {
			$('.bordered').removeClass('replacement algebraic');
			$('.bordered').addClass('inference');
			$('#nextLineButton').removeClass('replacement algebraic');
			$('#nextLineButton').addClass('inference');
			$('#currentLevel').removeClass('replacement algebraic');
			$('#currentLevel').addClass('inference');
		}
	}
	changeColors(colorSchemes[colorIndex]);	
	changeInstructions();
}

function makeHint (rule) {
	if (rule != undefined) {
		switch (currentLevel) {
			case 1:
				var line = new AProblemLine('replacement', rule, SQ, TR, CI, DI, premiseOrder, currentSubLevel, lastLineAdded);
				fillReplacementLine(line);
				break;
			case 2:
				var line = new AProblemLine('algebraic', rule, SQ, TR, CI, DI, premiseOrder, currentSubLevel, lastLineAdded);
				fillReplacementLine(line);
				break;
			default:
				var line = new AProblemLine('inference', rule, SQ, TR, CI, DI, premiseOrder, currentSubLevel, lastLineAdded);
				fillInferenceLine(line);
			}
			if (hintsClicked[hintsClicked.length - 1] != rule) {
				hintsClicked.push(rule);
			}
			Meteor.call('updateStudentModel', 'hintsclicked', hintsClicked);
			changeColors(colorSchemes[colorIndex]);
	}
}

//returns a helper for the draggable options
//this fixes the strange bug that occurred with 'helper: clone'
function draggableOptionsHelper (event) {
	return $('<td class = bordered id = helper>' + $(this).data('rule') + '</td>');
}

//handles the event when a draggable option is dropped into a line
handleDraggableOptionsDrop = function (event, ui) {
	//update the instructions to say the answer was correct
	$('#ruleInstructions').html('Correct! Click \'Next Line\' to continue.');
	$('#ruleInstructions').css('background-color', '#ffff00');

	//the correct answer for the line
	var rightRule = $(this).data('answer');

	//the current rule being attempted (in the premises/conclusion sublevels, this is not the same as the correct answer)
	var currentRule = $(this).data('currentRule');

	//the answer that was dropped into the line
	var droppedRule = ui.draggable.data('rule');

	//if the user chose the correct answer
	if (droppedRule == rightRule) {	
		switch (currentSubLevel) {
			//conclusion sublevel
			case 1:
				ui.helper.css('background-color', colorSchemes[colorIndex].conclusioncolor.backgroundcolor);
				$(this).css('background-color', colorSchemes[colorIndex].conclusioncolor.backgroundcolor);
				break;
			//premise sublevel
			case 2:
				ui.helper.css('background-color', colorSchemes[colorIndex].justcolor.backgroundcolor);
				$(this).css('background-color', colorSchemes[colorIndex].justcolor.backgroundcolor);
				break;
			//rule sublevel
			default:
				ui.helper.css('background-color', colorSchemes[colorIndex].rulecolor.backgroundcolor);
				$(this).css('background-color', colorSchemes[colorIndex].rulecolor.backgroundcolor);
		}
		$('#nextLineButton').show();
		$('#Submit').prop('disabled', true).css('color', 'black').css('background-color', 'white');

		//the current line was correctly answered
		currentLine.correct = true;	
		currentLine.numAttempts++;
		Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop');
		currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
		currentLine.correct = true;

		//set the draggable/droppable options
		ui.draggable.draggable('disable');											
		ui.helper.position({of: $(this), my: 'center', at: 'center'});				
		ui.draggable.draggable('option', 'revert', false);						
		$(this).droppable({'disabled': true});																			
		ui.draggable.draggable('option', 'snap', 'false');

		//update the dropped element's and the droppable element's background color based on the current sublevel
		//and set the html of the droppable element to the dropped element
		ui.helper.css('color', '#000000');
		$(this).html(droppedRule);

		//update the learning score based on the current level
		if (currentLine.answered == false) {
			completedLines.push(currentLine);
			currentLine.answered = true;
			Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop', function (result) {
				currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
				currentLine.answered = true;
			});
			Meteor.call('updateStudentModel', 'completedlines', completedLines, 'handleDraggableOptionsDrop');
			switch (currentLevel) {
				case 1:
					updateCorrectScore(replacementRules, replacementMastery, replacementScores, currentRule, rightRule, droppedRule);
					break;
				case 2:
					updateCorrectScore(algebraicRules, algebraicMastery, algebraicScores, currentRule, rightRule, droppedRule);
					break;
				default:
					updateCorrectScore(inferenceRules, inferenceMastery, inferenceScores, currentRule, rightRule, droppedRule);
			}
		} else {
			makeActionLog(rightRule, droppedRule, 'Y');
		}
	} 
	//incorrect answer
	else {
		$('#nextLineButton').hide();
		$('#Submit').prop('disabled', false).css('color', colorSchemes[colorIndex].droppablecolor.textcolor).css('background-color', colorSchemes[colorIndex].droppablecolor.backgroundcolor);
		//the current line was incorrectly answered
		currentLine.correct = false;
		currentLine.numAttempts++;
		Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop');
		currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
		currentLine.correct = false;

		//update the ruleInstructions to say the answer was incorrect	
		$('#ruleInstructions').html('Sorry, incorrect. Please drag<br>' + rightRule + '<br>into the ' + colorSchemes[colorIndex].dropcolorname + ' box to continue.');
		$('#ruleInstructions').css('background-color', 'red');

		//update the learning score based on the current level
		if (currentLine.answered == false) {
			currentLine.answered = true;
			Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop');
			currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
			switch (currentLevel) {
				case 1:
					updateIncorrectScore(replacementRules, replacementMastery, replacementScores, currentRule, rightRule, droppedRule);
					break;
			case 2:
					updateIncorrectScore(algebraicRules, algebraicMastery, algebraicScores, currentRule, rightRule, droppedRule);
					break;
			default:
					updateIncorrectScore(inferenceRules, inferenceMastery, inferenceScores, currentRule, rightRule, droppedRule);
			}
		} else {
			makeActionLog(rightRule, droppedRule, 'N');
		}
	}	
}

function handleAnswer (targetid, droppedRule) {
	//determine whether the user is on a mobile device
	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	var keyboard = shouldSwitchToKeyboard();

	//update the instructions to say the answer was correct
	$('#ruleInstructions').html('Correct! Click \'Next Line\' to continue.');
	$('#ruleInstructions').css('background-color', '#ffff00');
	
	//the current rule being attempted (in the premises/conclusion sublevels, this is not the same as the correct answer)
	var currentRule = $('#' + targetid).data('currentRule');

	//the correct answer for the line
	var rightRule = $('#' + targetid).data('answer');
	//if the data method didn't work, assign rightRule from the currentLine based on the sublevel
	if (rightRule == undefined) {
		//conclusion sublevel
		if (currentSubLevel == 1) {
			rightRule = currentLine.conclusion;
		} 
		//justification sublevel - also account for ADD and SIMP
		else if (currentSubLevel == 2) {
			rightRule = currentLine.premise2;
			if (currentRule == 'ADD' || currentRule == 'SIMP') {
				rightRule = currentLine.premise1;
			}
			if (currentLevel != 0) {
				rightRule = currentLine.premise;
			}
		} 
		//rule sublevel
		else {
			rightRule = currentLine.randomRule;
		}
	}

	var answerText = rightRule;

	//in the case of SIMP, ADD, and TAUT, more than one correct answer is possible,
	//so adjust the rightRule to reflect those multiple correct answers
	if (currentRule == 'SIMP') {
		var split = currentLine.premise1.split(' ' + AND + ' ');
		answerText = split[0] + ' or<br>' + split[1];
		if (droppedRule == split[0] || droppedRule == split[1]) {
			rightRule = droppedRule;
		}
	} else if (currentRule == 'ADD') {
		if (currentSubLevel == 1) {
			var split = droppedRule.split(' ' + OR + ' ');
			answerText = currentLine.premise1 + ' ' + OR + ' any logical expression or<br>any logical expression ' + OR + ' ' + currentLine.premise1; 
			if (split.length == 2 && (split[0] == currentLine.premise1 || split[1] == currentLine.premise1) && /\S/.test(split[0]) && /\S/.test(split[1])) {
				rightRule = droppedRule;
			} else if (split.length > 2) {
				if (split[0] == currentLine.premise1 || split[split.length - 1] == currentLine.premise1) {
					rightRule = droppedRule;
				}
			}
		} else {
			var split = currentLine.conclusion.split(' ' + OR + ' ');
			answerText = split[0] + ' or<br>' + split[1];
			if (droppedRule == split[0] || droppedRule == split[1]) {
				rightRule = droppedRule;
			}
		}
	} else if (currentRule == 'Taut') {
		var letter = currentLine.premise;
		if (letter.length != 1) {
			letter = currentLine.conclusion;
		}
		if ((currentSubLevel == 1 && letter == currentLine.premise) || (currentSubLevel == 2 && letter == currentLine.conclusion)) {
			answerText = answerText = letter + ' ' + AND + ' ' + letter + ' or<br>' + letter + ' ' + OR + ' ' + letter;
		}
		if (droppedRule == letter + ' ' + AND + ' ' + letter || droppedRule == letter + ' ' + OR + ' ' + letter) {
			rightRule = droppedRule;
		}
	}

	//if the user chose the correct answer
	if (droppedRule == rightRule) {	
		switch (currentSubLevel) {
			//conclusion sublevel
			case 1:
				$('#' + targetid).css('background-color', colorSchemes[colorIndex].conclusioncolor.backgroundcolor);
				break;
			//premise sublevel
			case 2:
				$('#' + targetid).css('background-color', colorSchemes[colorIndex].justcolor.backgroundcolor);
				break;
			//rule sublevel
			default:
				$('#' + targetid).css('background-color', colorSchemes[colorIndex].rulecolor.backgroundcolor);
			}
			$('#nextLineButton').show();
			$('#Submit').prop('disabled', true).css('color', 'black').css('background-color', 'white');

			//the current line was correctly answered
			currentLine.correct = true;	
			currentLine.numAttempts++;
			Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop');
			currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;

			//update the dropped element's and the droppable element's background color based on the current sublevel
			//and set the html of the droppable element to the dropped element
			$('#' + targetid).html(droppedRule);

			//update the learning score based on the current level
			if (currentLine.answered == false) {
				completedLines.push(currentLine);
				currentLine.answered = true;
				currentLine.correct = true;
				Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop');
				Meteor.call('updateStudentModel', 'completedlines', completedLines, 'handleDraggableOptionsDrop');
				currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
				switch (currentLevel) {
					case 1:
						updateCorrectScore(replacementRules, replacementMastery, replacementScores, currentRule, rightRule, droppedRule);
						break;
					case 2:
						updateCorrectScore(algebraicRules, algebraicMastery, algebraicScores, currentRule, rightRule, droppedRule);
					break;
					default:
						updateCorrectScore(inferenceRules, inferenceMastery, inferenceScores, currentRule, rightRule, droppedRule);
				}
			} else {
				makeActionLog(rightRule, droppedRule, 'Y');
			}
		} 
		//incorrect answer
		else {
			$('#nextLineButton').hide();
			$('#Submit').prop('disabled', false).css('color', colorSchemes[colorIndex].droppablecolor.textcolor).css('background-color', colorSchemes[colorIndex].droppablecolor.backgroundcolor);
			//the current line was incorrectly answered
			currentLine.correct = false;
			currentLine.numAttempts++;
			Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop');
			currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;

			//update the ruleInstructions to say the answer was incorrect	
			$('#ruleInstructions').css('background-color', 'red');
			if (keyboard == false) {
				$('#ruleInstructions').html('Sorry, incorrect. Please tap<br>' + rightRule + '<br>and then tap the ' + colorSchemes[colorIndex].dropcolorname + ' box to continue.');
			} else {
				$('#ruleInstructions').html('Sorry, incorrect. Please type<br>' + answerText + '<br>and then click \'Submit\' to continue.');
			}

			//update the learning score based on the current level
			if (currentLine.answered == false) {
				currentLine.answered = true;
				Meteor.call('updateStudentModel', 'currentline', currentLine, 'handleDraggableOptionsDrop');
				currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
				switch (currentLevel) {
					case 1:
						updateIncorrectScore(replacementRules, replacementMastery, replacementScores, currentRule, rightRule, droppedRule);
						break;
					case 2:
						updateIncorrectScore(algebraicRules, algebraicMastery, algebraicScores, currentRule, rightRule, droppedRule);
						break;
					default:
						updateIncorrectScore(inferenceRules, inferenceMastery, inferenceScores, currentRule, rightRule, droppedRule);
					}
				} else {
					makeActionLog(rightRule, droppedRule, 'N');
			}
		} //end of incorrect answer clause
}

//determines whether the user should be in keyboard mode
//for now, should switch in conclusion and justification sublevels
//in future, could use other conditions such as average elapsedTime or some UI input
function shouldSwitchToKeyboard () {
	var rightsublevel = currentSubLevel == 1 || currentSubLevel == 2;
	//var rightrule = currentLine.randomRule != 'ADD';// && currentLine.randomRule != 'SIMP';
	return rightsublevel;
}

function switchToKeyboard () {
	//determine the id of the box that the answer goes into (conclusion or premise based on sublevel)
	var id;
	if (currentSubLevel == 1) {
		id = 'correctConclusion' + currentLine.number;
	} else {
		id = 'correctPremise' + currentLine.number;
	}

	Session.set('keyboardid', id);

	//show the keyboard div
	$('#keyboardButton').hide();
	$('#virtualKeyboardDiv').show();
}

function parseElement (element) {
	var parsed = '';
	parsed = element.replace(/ /g, '');
	parsed = parsed.replace(/-/g, NOT);
	parsed = parsed.replace(/\+/g, ' ' + OR + ' ');
	parsed = parsed.replace(/\*/g, ' ' + AND + ' ');
	parsed = parsed.replace(/>/g, ' ' + IMP + ' ');
	parsed = parsed.replace(/=/g, ' ' + EQUAL + ' ');
	return parsed.toUpperCase();
}

//updates the learning score for the given rule
//given a correct answer
function updateCorrectScore (rulesArray, masteryArray, scoresArray, rightRule, answer, dropped) {
	//get the index of the given rule in the given rulesArray (used to modify the given scoresArray)
	var ruleIndex = rulesArray.indexOf(rightRule);
	var sublevel = StudentModel.find({_id: Meteor.userId()}).fetch()[0].sublevel;

	//recalculate the learning score for the given rule:
	//the id of the KTScores document to modify
	var id = Meteor.userId() + rightRule + sublevel;

	//get the current score
	var currentScore = KTScores.find({_id: id}).fetch()[0].score;

	//calculate the new score using the BKT equation for a correct answer
	var correctScore = (currentScore * (1 - SLIP))/(currentScore * (1 - SLIP) + (1 - currentScore) * GUESS);
	var newScore = correctScore + (1 - correctScore)*TRANSITION;

	//modify the KTScores document with the id found above to reflect the new score
	Meteor.call('updateKTScores', id, newScore);

	//update the given global scoresArray
	scoresArray[ruleIndex] = newScore;

	//update the div showing the learning score
	updateRuleTrackerHtml(scoresArray, masteryArray, rightRule, ruleIndex);
	$('#' + rightRule).css('background-color', 'yellow');

	//if the rule has been mastered - remove it from the unmastered array
	//and move it into the mastered array (if it's not already in the mastered array)
	if (scoresArray[ruleIndex].toFixed(2) >= MIN_K) {
		var index = unmastered.indexOf(rightRule);
		if (index != -1) {
			unmastered.splice(index, 1);
		}
		if (mastered.indexOf(rightRule) == -1) {
			mastered.push(rightRule);
		}

		//since the rule is mastered, fill in all of the stars
		var stars = "";
		for (var i = 0; i < 10*MIN_K; i++) {
			stars += BLACKSTAR;
		}
		$('#' + rightRule).html(rightRule + ': ' + scoresArray[ruleIndex].toFixed(2) + ' ' + stars);
		$('#' + rightRule).css('background-color', 'lime');
		/*$('#' + 'progress' + rightRule).css({'background-image': 'none','background-color': 'lime'});
		$('#' + 'progress' + rightRule).addClass('progress-bar-success');*/
	}

	//if the rule has been 'supermastered' - it should not be chosen again in this level
	if (scoresArray[ruleIndex].toFixed(2) >= SUPER_M) {
		if (supermastered.indexOf(rightRule) == -1) {
			supermastered.push(rightRule);
		}
	}

	Meteor.call('printKCScore', Meteor.userId(), currentSubLevel, rightRule);

	//check whether the level/all levels are finished
	var done = checkDone();
	var elapsedTime = getElapsedTime();
	var levelcompletetime = 'N/A';
	if (done[0]) {
		levelcompletetime = getTimeToLevel(currentLevel, currentSubLevel, elapsedTime);
	}
	var systemcompletetime = 'N/A';
	if (done[1]) {
		systemcompletetime = getTimeToSystem(elapsedTime);
	}

	//log the correct action to the server
	var ruleSet = StudentModel.find({_id: Meteor.userId()}).fetch()[0].level;
	var level = StudentModel.find({_id: Meteor.userId()}).fetch()[0].sublevel;
	var line = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
	Meteor.call('logAction', ruleSet, level, line.number, line.randomRule, line.conclusion, getPreconds(), answer, dropped, 'Y', hintsClicked, line.numAttempts, [newScore],
				elapsedTime, getClientDate(), getClientTime(), getTimeToMastery(rightRule, ruleSet, level, elapsedTime), levelcompletetime, systemcompletetime);

	//reset the hintsClicked
	hintsClicked = [];
	//StudentModel.update({_id: Meteor.userId()}, {$set: {hintsclicked: hintsClicked}});
	Meteor.call('updateStudentModel', 'hintsclicked', hintsClicked);
}

//updates the learning score for the given rule
//given an incorrect answer
function updateIncorrectScore (rulesArray, masteryArray, scoresArray, rightRule, answer, droppedRule) {
	//get the indices of the given right rule (answer) and the given dropped rule (answer)
	var rightIndex = rulesArray.indexOf(rightRule);
	var droppedIndex = rulesArray.indexOf(droppedRule);

	//decrease the score for the correct rule
	var id = Meteor.userId() + rightRule + StudentModel.find({_id: Meteor.userId()}).fetch()[0].sublevel;
	var currentScore = KTScores.find({_id: id}).fetch()[0].score;
	var incorrectScore = (currentScore * SLIP)/(currentScore * SLIP + (1 - currentScore) * (1 - GUESS));
	var newScore = incorrectScore + (1 - incorrectScore)*TRANSITION;
	//KTScores.update({_id: id}, {$set: {score: newScore}});
	Meteor.call('updateKTScores', id, newScore);
	scoresArray[rightIndex] = newScore;

	//if the right rule was previously mastered and it is now below mastery, 
	//remove it from the mastered array and put it in the unmastered array
	if (scoresArray[rightIndex].toFixed(2) < MIN_K && mastered.indexOf(rightRule) != -1) {
		mastered.splice(mastered.indexOf(rightRule), 1);
		unmastered.push(rightRule);
	}

	//update the rule tracker html to reflect the new score
	updateRuleTrackerHtml(scoresArray, masteryArray, rightRule, rightIndex);
	$('#' + rightRule).css('background-color', 'red');

	var newDroppedScore = 'N/A';
	//if the current sublevel is a rule sublevel, also decrease the score for the rule that was dropped
	if (isNaN(currentSubLevel) || currentSubLevel === 0) {
		var droppedid = Meteor.userId() + droppedRule + currentSubLevel;
		var currentDroppedScore = KTScores.find({_id: droppedid}).fetch()[0].score;
		var incorrectDroppedScore = (currentDroppedScore * SLIP)/(currentDroppedScore * SLIP + (1 - currentDroppedScore) * (1 - GUESS));
		newDroppedScore = incorrectDroppedScore + (1 - incorrectDroppedScore)*TRANSITION;
		//KTScores.update({_id: droppedid}, {$set: {score: newDroppedScore}});
		Meteor.call('updateKTScores', droppedid, newDroppedScore);
		scoresArray[droppedIndex] = newDroppedScore;

		//if the dropped rule was previously mastered and it is now below mastery,
		//remove it from the mastered array and put it in the unmastered array
		if (scoresArray[droppedIndex] < MIN_K && mastered.indexOf(droppedRule) != -1) {
			mastered.splice(mastered.indexOf(droppedRule), 1);
			unmastered.push(droppedRule);
		}

		//update the rule tracker html to reflect the new score
		updateRuleTrackerHtml(scoresArray, masteryArray, droppedRule, droppedIndex);
		$('#' + droppedRule).css('background-color', 'red');
	}

	Meteor.call('printKCScore', Meteor.userId(), currentSubLevel, rightRule);

	getTimeToMastery(rightRule);

	//log the incorrect action to the server
	var ruleSet = StudentModel.find({_id: Meteor.userId()}).fetch()[0].level;
	var level = StudentModel.find({_id: Meteor.userId()}).fetch()[0].sublevel;
	var line = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
	var elapsedTime = getElapsedTime();
	Meteor.call('logAction', ruleSet, level, line.number, line.randomRule, line.conclusion, getPreconds(), answer, droppedRule, 'N', hintsClicked, line.numAttempts, [newScore, newDroppedScore],
				elapsedTime, getClientDate(), getClientTime(), getTimeToMastery(rightRule, ruleSet, level, elapsedTime), 'N/A', 'N/A');

	//reset the hintsClicked
	hintsClicked = [];
	Meteor.call('updateStudentModel', 'hintsclicked', hintsClicked);
}

function makeActionLog (answer, dropped, correct) {
	var elapsedTime = getElapsedTime();
	var levelcompletetime = 'N/A';
	var systemcompletetime = 'N/A';
	if (correct == 'Y') {
		//check whether the level/all levels are finished
		var done = checkDone();
		if (done[0]) {
			levelcompletetime = getTimeToLevel(currentLevel, currentSubLevel, elapsedTime);
		}
		if (done[1]) {
			systemcompletetime = getTimeToSystem(elapsedTime);
		}
	}
	var ruleSet = StudentModel.find({_id: Meteor.userId()}).fetch()[0].level;
	var level = StudentModel.find({_id: Meteor.userId()}).fetch()[0].sublevel;
	var line = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;

	Meteor.call('logAction', ruleSet, level, line.number, line.randomRule, line.conclusion, getPreconds(), answer, dropped, correct, hintsClicked, line.numAttempts, [], 
				elapsedTime, getClientDate(), getClientTime(), getTimeToMastery(line.randomRule, ruleSet, level, elapsedTime), levelcompletetime, systemcompletetime);
}

/*******************************ACTION LOGGING FUNCTIONS*******************************/

function getTimeToSystem (elapsedTime) {
    var actionLog = ActionLog.find({student: Meteor.userId()}).fetch();
    var total = 0;
    for (var i in actionLog) {
      if (actionLog[i].timeToLevel != 'N/A') {
      	total += actionLog[i].timeToLevel;
      }
    }
    total += elapsedTime;
    return total;
}

function getTimeToLevel (ruleSet, level, elapsedTime) {
      var actionLog = ActionLog.find({student: Meteor.userId(), ruleSet: ruleSet, level: level}).fetch();
      var total = 0;
      for (var i in actionLog) {
        var time = actionLog[i].elapsedTime;
        //compute the time stamp as an integer number of seconds
        var timeArray = time.split(':');
        var timeDate = new Date(0, 0, 0, timeArray[0], timeArray[1], timeArray[2]); 
        var timeNumber = timeDate.getHours()*3600 + timeDate.getMinutes()*60 + timeDate.getSeconds();

        //add the numeric timestamp to the total
        total += timeNumber;
      }
      var elapsedSplit = elapsedTime.split(':');
  	  var elapsedDate = new Date(0, 0, 0, elapsedSplit[0], elapsedSplit[1], elapsedSplit[2]);
  	  var elapsedNumber = elapsedDate.getHours()*3600 + elapsedDate.getMinutes()*60 + elapsedDate.getSeconds();
      total += elapsedNumber;
      return total;
    }

function getTimeToMastery (rule, ruleSet, level, elapsedTime) {
	if (mastered.indexOf(rule) == -1) {
		return 'N/A';
	}
    var actionLog = ActionLog.find({student: Meteor.userId(), rule: rule, ruleSet: ruleSet, level: level}).fetch();
    var total = 0;
    for (var i in actionLog) {
      var time = actionLog[i].elapsedTime;
      //compute the time stamp as an integer number of seconds
      var timeArray = time.split(':');
      var timeDate = new Date(0, 0, 0, timeArray[0], timeArray[1], timeArray[2]); 
      var timeNumber = timeDate.getHours()*3600 + timeDate.getMinutes()*60 + timeDate.getSeconds();

      //add the numeric timestamp to the total
      total += timeNumber;
  }
  var elapsedSplit = elapsedTime.split(':');
  var elapsedDate = new Date(0, 0, 0, elapsedSplit[0], elapsedSplit[1], elapsedSplit[2]);
  var elapsedNumber = elapsedDate.getHours()*3600 + elapsedDate.getMinutes()*60 + elapsedDate.getSeconds();
  total += elapsedNumber;
  return total;
}

//gets the precondition(s) of the current line
function getPreconds () {
	var line = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
	if (line.premise) {
		return line.premise;
	} else {
		return line.premise1 + ', ' + line.premise2;
	}
}

//gets the time spent on the current line
function getElapsedTime () {
	var currentDate = new Date();
	var hoursElapsed = (currentDate.getHours() - problemStartTime.getHours() + 60) % 60;
	var minutesElapsed = (currentDate.getMinutes() - problemStartTime.getMinutes() + 60) % 60;
	var secondsElapsed = (currentDate.getSeconds() - problemStartTime.getSeconds() + 60) % 60;
	return hoursElapsed + ':' + minutesElapsed + ':' + secondsElapsed;
}

//gets the current date on the client
function getClientDate () {
	var date = new Date();
	var month = date.getMonth() + 1;
	return month + '/' + date.getDate() + '/' + date.getFullYear();
}

//gets the current time on the client
function getClientTime () {
	var date = new Date();
	return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}



/****************************END OF ACTION LOGGING FUNCTIONS************************************/

//updates the ruleTracker html
//to reflect the KTScore for the given rule
function updateRuleTrackerHtml (scoresArray, masteryArray, rule, ruleIndex, color) {
	//update the number of stars for the given rule
	masteryArray[ruleIndex] = Math.floor(scoresArray[ruleIndex] * 10);
	if (mastered.indexOf(rule) != -1) {
		masteryArray[ruleIndex] = 10*MIN_K;
	}

	//update the html
	var ruleHtml = rule + ': ' + scoresArray[ruleIndex].toFixed(2) + " ";

	//determine how many black stars there are (in case a rule has a higher score than the minimum mastery score, e.g. 0.54 compared to 0.33, there should be 3 black stars, not 5)
	var blackStarStop = masteryArray[ruleIndex] < 10*MIN_K ? masteryArray[ruleIndex] : 10*MIN_K;

	//add the correct number of black stars
	for (var i = 0; i < blackStarStop; i++) {
		ruleHtml += BLACKSTAR;
	}

	//fill up the rest of the stars with white stars
	for (var j = masteryArray[ruleIndex]; j < 10*MIN_K; j++) {
		ruleHtml += STAR;
	}

	//set the html of the given rule
	$('#' + rule).html(ruleHtml);
	$('#' + rule).css('background-color', color);

	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	if (!mobile) {
		$('#ruleTracker').css('font-size', 18);
	}
}

//moves to the next level and/or sublevel
function moveToNextLevel () {
	//if the current level/sublevel haven't been initialized, set them to 0
	//this probably isn't necessary now that currentLevel and currentSublevel are initialized to 0 when creating new student accounts
	if (isNaN(currentLevel)) {
		currentLevel = 0;
	}
	if (isNaN(currentSubLevel)) {
		currentSubLevel = 0;
	}

	//all the sublevels for the current level are complete - move to the next level
	if (currentSubLevel == 2) {
		currentLevel++;
		currentLevel = currentLevel % 3;
	}

	//move to the next sublevel
	currentSubLevel++;
	currentSubLevel = currentSubLevel % 3; 
	lastLineAdded = 1;

	//update the student model
	currentLine = undefined;
	problemStartTime = new Date();
	Session.set('problemstarttime', problemStartTime);
	levelStartTime = new Date();
	Session.set('levelstarttime', levelStartTime);
	completedLines = [];
	Meteor.call('updateStudentModel', 'level', currentLevel, 'moveToNextLevel');
	Meteor.call('updateStudentModel', 'sublevel', currentSubLevel, 'moveToNextLevel');
	Meteor.call('updateStudentModel', 'lastlineadded', 1, 'moveToNextLevel');
	Meteor.call('updateStudentModel', 'currentline', undefined, 'moveToNextLevel');
	Meteor.call('updateStudentModel', 'problemstarttime', problemStartTime, 'moveToNextLevel');
	Meteor.call('updateStudentModel', 'levelstarttime', levelStartTime, 'moveToNextLevel');
	Meteor.call('updateStudentModel', 'currentpage', Session.get('currentPage'), 'moveToNextLevel');
	Meteor.call('updateStudentModel', 'completedlines', [], 'moveToNextLevel', function (result) {
		setUpScores(Meteor.userId());
		initialize();
	});

	var height = currentSubLevel == 0 ? 400 : 500;
	$('.tdContainer').height(height);
}

//checks whether the current level is complete
//and whether all levels are complete.
//if so, updates the ruleInstructions and the next line/level button
function checkDone () {
	var done = [false, false];
	//the level is complete if all the rules for that level have been mastered
	if (mastered.length == numRules) {
		done[0] = true;
		//udpate the ruleInstructions html to tell the user that the level is complete
		$('#ruleInstructions').html('Level Complete! Click \'Next Level\' to continue.');

		//change the next line button to a next level button
		$('#nextLineButton').hide();
		$('#Submit').prop('disabled', true).css('color', 'black').css('background-color', 'white');
		$('#nextLevelButton').show();

		//all the levels have been completed
		if (currentLevel == 2 && currentSubLevel == 2) {
		//if (currentLevel == 0 && currentSubLevel == 2) {
			done[1] = true;
			//update the ruleInstructions
			$('#ruleInstructions').html('All levels completed!');

			//remove the next line and next level buttons
			$('#nextLineButton').remove();
			$('#nextLevelButton').remove();
		}
	}
	return done;
}

//fills in the exercise that students complete
//if there is no current line, generates a random line
//based on the student's mastery levels
function makeLine (type) {
	//reset the value of the #keyboardInput
	$('#virtualKeyboardInput').html('');

	var lastLine = completedLines[completedLines.length - 1];
	var lastRule = '';
	if (lastLine) {
		lastRule = lastLine.randomRule;
	}

	var array = [];
	for (var k = 0; k < unmastered.length; k++) {
		array[k] = unmastered[k];
	}

	//randomly choose the array that the randomRule will come from
	var randomArray = Math.random();

	//if all the following conditions are met, array becomes the rules that are mastered but not supermastered
	//conditions:
	//	there is at least a 90% chance that the randomRule will be unmastered
	//	there is only one unmastered rule left
	//	there is at least one non-supermastered rule left
	//	the student has answered less than 5 * the number of rules necessary to pass the level questions
	if (randomArray >= 0.9 && mastered.length == numRules - 1 && supermastered.length != numRules - 1 && lastLineAdded <= 5*numRules)  {
		//all the mastered rules
		for (var i = 0; i < mastered.length; i++) {
			array[i] = mastered[i];
		}

		//remove the supermastered rules
		for (var j = 0; j < supermastered.length; j++) {
			array.splice(array.indexOf(supermastered[j]), 1);
		}
	}

	//if there are more than two lines left to answer,
	//remove the rule of the line that came directly before the current one
	//to ensure that no two rules are chosen in a row
	if (mastered.length < numRules - 2) {
		array.splice(array.indexOf(lastRule), 1);
	}

	//scramble the array and then find the rule with minimum priority
	array = scramble(array);
	var randomRule = findRuleWithMinPriority(array);

	//choose the random letters used for the premises and conclusion
	//ensure that all of the letters are distinct
	var randomLetter1 = alphabet[Math.floor((Math.random() * 26))];
	var randomLetter2 = alphabet[Math.floor((Math.random() * 26))];
	while (randomLetter2 == randomLetter1) {
		randomLetter2 = alphabet[Math.floor((Math.random() * 26))];
	}
	var randomLetter3 = alphabet[Math.floor((Math.random() * 26))];
	while (randomLetter3 == randomLetter1 || randomLetter3 == randomLetter2) {
		randomLetter3 = alphabet[Math.floor((Math.random() * 26))];
	}
	var randomLetter4 = alphabet[Math.floor((Math.random() * 26))];
	while ((randomLetter4 == randomLetter1 || randomLetter4 == randomLetter2) || randomLetter4 == randomLetter3) {
		randomLetter4 = alphabet[Math.floor((Math.random() * 26))];
	}

	//if the student doesn't have a current line, i.e. 
	//hasn't used eLogicTutor before or just clicked 'Next Line' or 'Next Level', generate a "random" line
	if (currentLine == undefined) {
		currentLine = new AProblemLine(type, randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, 
										premiseOrder, currentSubLevel, lastLineAdded);
	}

	if (currentLine.answered == undefined) {
		currentLine.answered = false;
		Meteor.call('updateStudentModel', 'currentline', currentLine, 'makeLine');
		currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
	}
	if (currentLine.numAttempts == undefined) {
		currentLine.numAttempts = 0;
		Meteor.call('updateStudentModel', 'currentline', currentLine, 'makeLine');
		currentLine = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentline;
	}

	//fill in the current line
	switch (type) {
		case 'inference':
			fillInferenceLine(currentLine);
			break;
		case 'replacement':
			fillReplacementLine(currentLine);
			break;
		case 'algebraic':
			fillReplacementLine(currentLine);
			break;
	}
	if (currentLine.randomRule == 'ADD' || currentLine.randomRule == 'SIMP') {
		$('#premiseB' + currentLine.number).remove();
	}

	if (currentLine.correct == true) {
		$('#' + currentLine.randomRule).css('background-color', 'yellow');
		if (mastered.indexOf(currentLine.randomRule) != -1) {
			$('#' + currentLine.randomRule).css('background-color', 'lime');
		}
		$('#nextLineButton').show();
		$('#Submit').prop('disabled', true).css('color', 'black').css('background-color', 'white');
	} else if (currentLine.answered == true && currentLine.correct == false) {
		$('#' + currentLine.randomRule).css('background-color', 'red');
	}

	//make stuff droppable - only in desktop use cases
	if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		$('.correctRule').droppable({
			accept: '.bordered',
			drop: handleDraggableOptionsDrop
		});
		$('.correctConclusion').droppable({
			accept: '.bordered',
			drop: handleDraggableOptionsDrop
		});
		$('.correctPremise').droppable({
			accept: '.bordered',
			drop: handleDraggableOptionsDrop
		});
	}

	//if the current line hasn't been answered (whether correctly or incorrectly), hide the 'Next Line' button
	if (!currentLine.answered) {
		$('#nextLineButton').hide();	
		$('#Submit').prop('disabled', false).css('color', colorSchemes[colorIndex].droppablecolor.textcolor).css('background-color', colorSchemes[colorIndex].droppablecolor.backgroundcolor);
	} 
	
	lastLineAdded++;
	Meteor.call('updateStudentModel', 'level', currentLevel, 'makeLine');
	Meteor.call('updateStudentModel', 'sublevel', currentSubLevel, 'makeLine');
	Meteor.call('updateStudentModel', 'lastlineadded', lastLineAdded - 1, 'makeLine');
	Meteor.call('updateStudentModel', 'currentline', currentLine, 'makeLine');
	var keyboard = shouldSwitchToKeyboard();
	if (keyboard == true) {
		switchToKeyboard();
	}
	return currentLine.choices;
}

//returns the rule from the given array with the lowest priority (used to select random rules when making lines)
function findRuleWithMinPriority (array) {
	var min = array[0];
	for (var i = 0; i < array.length; i++) {
		if (rulePriority[array[i]] < rulePriority[min]) {
			min = array[i];
		}
	}
	return min;
}

//updates the #ruleInstructions html based on the current sublevel, and whether the current line is correct or incorrect
function changeInstructions ()  {
	var keyboard = shouldSwitchToKeyboard();
	var line = completedLines[completedLines.length - 1];
	if (line == undefined) {
		line = currentLine;
	}
	//if the current line hasn't been answered, display instructions about what to drag based on the current sublevel
	if (!currentLine.answered) {
		$('#ruleInstructions').css('background-color', colorSchemes[colorIndex].tdendcolor.backgroundcolor);
		if (currentSubLevel == 1) {
			if (keyboard == true) {
				$('#ruleInstructions').html('Use the virtual keypad to type the conclusion that completes the line and press \'Submit\'.<br><br>NOTE: there may be more than one correct answer. Any correct answer will be accepted.');
			} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				$('#ruleInstructions').html('Tap a conclusion to select it. Tap it again to un-select it. When you have selected your conclusion, tap the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete an exercise.');
			} else {
				$('#ruleInstructions').html('Drag a conclusion into the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete an exercise.');
			}
		} else if (currentSubLevel == 2) {
			if (keyboard == true) {
				$('#ruleInstructions').html('Use the virtual keypad to type the justification that completes the line and press \'Submit\'.<br><br>NOTE: there may be more than one correct answer. Any correct answer will be accepted.');
			} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				$('#ruleInstructions').html('Tap a justification to select it. Tap it again to un-select it. When you have selected your justification, tap the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete an exercise.');
			} else {
				$('#ruleInstructions').html('Drag a justification into the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete an exercise.');
			}
		} else {
			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				$('#ruleInstructions').html('Tap a rule to select or unselect it, then tap the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete an exercise.');
			} else {
				$('#ruleInstructions').html('Drag a rule into the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete an exercise.<br><br>Click on a rule to see an example.<br>Click on the example to remove it.');
			}
		}
	} 
	//if the current line has been answered, display instructions based on whether the line is correct or incorrect
	else {
		if (currentLine.correct == true) {
			$('#ruleInstructions').html('Correct! Click \'Next Line\' to continue.');
			$('#ruleInstructions').css('background-color', '#ffff00');
			checkDone();
		} else {
			$('#ruleInstructions').css('background-color', 'red');
			var answer;
			if (currentSubLevel == 1) {
				answer = currentLine.conclusion;
			} else if (currentSubLevel == 2) {
				answer = currentLine.premise2;
				if (currentLine.randomRule == 'ADD' || currentLine.randomRule == 'SIMP') {
					answer = currentLine.premise1;
				}
				if (currentLevel != 0) {
					answer = currentLine.premise;
				}
			} else {
				answer = currentLine.randomRule;
			}
			if (keyboard == true) {
				$('#ruleInstructions').html('Sorry, incorrect. Please type<br>' + answer + '<br>and then click \'Submit\' to continue.');
			} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				$('#ruleInstructions').html('Sorry, incorrect. Please tap<br>' + answer + '<br>and then tap the ' + colorSchemes[colorIndex].dropcolorname + ' box to continue.');
			} else {
				$('#ruleInstructions').html('Sorry, incorrect. Please drag<br>' + answer + '<br>into the ' + colorSchemes[colorIndex].dropcolorname + ' box to continue.');
			}
		}
	}
}