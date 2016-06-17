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

//stores all of the rules
var inferenceRules = ['MP', 'MT', 'DS', 'ADD', 'SIMP', 'CONJ', 'HS', 'CD'];
var replacementRules = ['DN', 'DeM', 'Impl', 'CP', 'Equiv'];
var algebraicRules = ['Comm', 'Assoc', 'Dist', 'Abs', 'Exp', 'Taut'];

//stores all the partial problems
var partialProblems;
var currentProblemIndex = 0;
var currentProblem;

//stores the color schemes
var colorSchemes = new ColorSchemeArray().colorSchemes;
var colorIndex = 0;

var adminName = 'kkjeer';

//for database interactions
//var Meteor.userId();
var courseID;
var currentPage;
var partialproofrendered;

	Meteor.startup(function () {
		Meteor.subscribe('studentmodel');
		Meteor.subscribe('ktscores');
	});

	//when the partial proof template is rendered
	Template.partialproof.rendered = function () {
		//update the currentPage
		Session.set('currentPage', 'partialproof');
		Meteor.call('updateStudentModel', 'currentpage', 'partialproof', 'rendering partialproof');

		//fix the navigation bar
		$('.dropdown-toggle').dropdown();
		$('#partialprooflistitem').remove();
		if (!(Meteor.user() && Meteor.user().username == adminName)) {
			$('#dataanalysislink').remove();
		}

		//initialize the problem
		getStudentInfo();
		initializePartiallySolvedProblem();
	}

	//set the partialproof template to display a welcome message to the user in the studentInfoDiv
	Template.partialproof.helpers({
		name: function () {
			if (Meteor.user()) {
				return Meteor.user().username;
			}
			return '';
		}
	});

	Template.partialproof.events({
		'click #flashcardslink': function (e) {
			Session.set('currentPage', 'flashcards');
			Meteor.call('updateStudentModel', 'currentpage', 'flashcards', 'clicking flashcardslink');
		},
		'change #hintsTogglePartial': function (e) {
			e.preventDefault();
			var hints = document.getElementById('hintsTogglePartial').checked;
			if (hints == true) {
				var rule = $('.selected').data('rule');
				makeHint(rule);
			} else {
				$('#hoverPartial').hide();
			}
		},
		'change #colorSelectPartial': function (e) {
			e.target.blur();
			e.preventDefault();
			var select = document.getElementById('colorSelectPartial');
			var currentdragcolorname = colorSchemes[colorIndex].dragcolorname;
			var currentdropcolorname = colorSchemes[colorIndex].dropcolorname;
			var currentrulecolorname = colorSchemes[colorIndex].rulecolorname;
			colorIndex = select[select.selectedIndex].value;
			Meteor.call('updateStudentModel', 'partialproofcolor', colorIndex);
			changeColors(colorSchemes[colorIndex]);
			var currenthtml = $('#ruleInstructionsPartial').html();
			var newhtml = currenthtml.replace(currentdragcolorname, colorSchemes[colorIndex].dragcolorname);
			newhtml = newhtml.replace(currentdropcolorname, colorSchemes[colorIndex].dropcolorname);
			newhtml = newhtml.replace(currentrulecolorname, colorSchemes[colorIndex].rulecolorname)
			$('#ruleInstructionsPartial').html(newhtml);
		}
	});

//initializes the partialProblems in case the student has never visited the site before
function makeProblems () {
	partialProblems = new AProblem().problems;
	for (var p in partialProblems) {
		for (var l in partialProblems[p].steps) {
			partialProblems[p].steps[l].droppedpremises = [];
			partialProblems[p].steps[l].premisesdropped = 0;
			partialProblems[p].steps[l].ruledropped = false;
			partialProblems[p].steps[l].justified = false;
		}
	}
}


//set the globals currentProblemIndex, partialProblems, and currentProblem
//from the currentproblemindex and partialproblems fields of the currently logged in student
//in order to preserve the problem state for the student.
function getStudentInfo () {
	//get the currentProblemIndex
	currentProblemIndex = StudentModel.find({_id: Meteor.userId()}).fetch()[0].currentproblemindex;
	if (currentProblemIndex == undefined) {
		currentProblemIndex == 0;
		Meteor.call('updateStudentModel', 'currentproblemindex', 0);
	}

	//get the partialProblems
	partialProblems = StudentModel.find({_id: Meteor.userId()}).fetch()[0].partialproblems;
	if (partialProblems == undefined) {
		makeProblems();
		Meteor.call('updateStudentModel', 'partialproblems', partialProblems);
	}

	//get the currentProblem
	currentProblem = partialProblems[currentProblemIndex];

	//get the partialproofcolor
	colorIndex = StudentModel.find({_id: Meteor.userId()}).fetch()[0].partialproofcolor;
	if (colorIndex == undefined) {
		colorIndex = 0;
		Meteor.call('updateStudentModel', 'partialproofcolor', 0);
	}
	document.getElementById('colorSelectPartial').selectedIndex = colorIndex;
	var currentdragcolorname = colorSchemes[colorIndex].dragcolorname;
	var currentdropcolorname = colorSchemes[colorIndex].dropcolorname;
	var currentrulecolorname = colorSchemes[colorIndex].rulecolorname;
	changeColors(colorSchemes[colorIndex]);
	var currenthtml = $('#ruleInstructionsPartial').html();
	var newhtml = currenthtml.replace(currentdragcolorname, colorSchemes[colorIndex].dragcolorname);
	newhtml = newhtml.replace(currentdropcolorname, colorSchemes[colorIndex].dropcolorname);
	newhtml = newhtml.replace(currentrulecolorname, colorSchemes[colorIndex].rulecolorname)
	$('#ruleInstructionsPartial').html(newhtml);
}


//initializes the problem stage by:
//clearing and resetting the main tds
//setting up the buttons:
//	clearing and resetting their html/click handlers
//	adding them to their respective tds
//setting up the actual problem, preserving the state prior to the last logout
function initializePartiallySolvedProblem () {
	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	if (!mobile) {
		$('.topSpace').remove();
	}
	//show the checkbox for pop-up examples - only for mobile use
	//also set the html of the #ruleInstructionsPartial based on mobile or desktop use
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		$('#hintsTogglePartial').show();
		$('#hintsLabelPartial').show();
		$('#ruleInstructionsPartial').html('Tap a ' + colorSchemes[colorIndex].dragcolorname + ' justification or a ' + 
																				colorSchemes[colorIndex].rulecolorname + ' rule, and then tap a ' + 
																				colorSchemes[colorIndex].dropcolorname + ' box to justify each line.<br><br>');// + 
																				//'To enable a pop-up example of the rule you select, check the box below.');
	} else {
		//$('#partialProblemDivider').css('width', $(window).width()*.95);
		$('#hintsTogglePartial').hide();
		$('#hintsLabelPartial').hide();
		$('#ruleInstructionsPartial').html('Drag a ' + colorSchemes[colorIndex].dragcolorname + ' justification or a ' + 
																				colorSchemes[colorIndex].rulecolorname + ' rule into a ' + 
																				colorSchemes[colorIndex].dropcolorname + ' box to justify each line.' + 
																				'<br><br>Click on a rule to see an example. Click on the example to remove it.');
	}

	//reset the button to move to the next line (initially hidden)
	$('#problemButton').html('Next Line');
	$('#problemButton').unbind('click');
	$('#problemButton').hide();

	//clear the #tdLinePartial div (the div that contains the problem) and the #tdRulesPartial div
	$('#tdLinePartial').empty();
	$('#tdRulesPartial').empty();

	//reset the last line added
	lastLineAddedPartial = 1;

	//update the middle th with info about the current problem
	var currentProblemLabel = currentProblemIndex + 1;
	$('#currentProb').html('Current Problem (' + currentProblemLabel + ' out of ' + partialProblems.length + ')');

	//set up the problem to be just the way it was when the student last logged out:
	//first add the givens
	for (var given = 0; given < currentProblem.givens.length; given++) {
		appendGivenLine(currentProblem.givens[given]);
	}
	//just in case the first step was set to be hidden for some reason, make sure it's not hidden
	currentProblem.steps[0].ishidden = false;
	//add all the steps, preserving their state before the student last logged out
	for (l = 0; l < currentProblem.steps.length; l++) {
		//the line number of the step (for adjusting the html/css of the step)
		var number = l + currentProblem.givens.length + 1;

		//show the non-hidden lines
		if (!currentProblem.steps[l].ishidden) {
			appendLine(currentProblem.steps[l]);
		}

		//drop the dropped rule (if there was one)
		if (currentProblem.steps[l].ruledropped) {
			$('#correctRule' + number).html(currentProblem.steps[l].rule).removeClass().addClass('ruleBox');
		}

		//drop the dropped premises (if there were any)
		if (currentProblem.steps[l].premises.length == 1) {
			if (currentProblem.steps[l].droppedpremises.length == 1) {
				$('#correctPremise' + number).html(currentProblem.steps[l].droppedpremises[0]).removeClass().addClass('premiseBox');
			}
		} else {
			if (currentProblem.steps[l].droppedpremises[0]) {
				$('#correctPremise1' + number).html(currentProblem.steps[l].droppedpremises[0]).removeClass().addClass('premiseBox');	
			} if (currentProblem.steps[l].droppedpremises[1]) {
				$('#correctPremise2' + number).html(currentProblem.steps[l].droppedpremises[1]).removeClass().addClass('premiseBox2');
			}	
		}

		//justify the justified lines
		if (currentProblem.steps[l].justified) {
			justifyLine(l + currentProblem.givens.length + 1, currentProblem.steps[l].derived, undefined);
		}
	}

	//change the colors to reflect the class changes made when setting up the problem
	changeColors(colorSchemes[colorIndex]);
	
	//append the next line button and the conclusion
	$('#tdLinePartial').append('<button id = problemButton>Next Line</button>');
	$('#tdLinePartial').append('<div id = conclusionDiv>Conclusion: ' + currentProblem.conclusion + '</div>');

	//functionality for the next problem button
	$('#problemButton').click(function () {
		//remove the problem button and the conclusion since the next step goes on top of them
		$('#tdLinePartial').remove('#problemButton');
		$('#tdLinePartial').remove('#conclusionDiv');

		//append the next step
		var nextStep = currentProblem.steps[lastLineAddedPartial - currentProblem.givens.length - 1];
		appendLine(nextStep);

		//put the problem button and the conclusion back
		$('#tdLinePartial').append($('#problemButton'));
		$('#problemButton').hide();
		$('#tdLinePartial').append($('#conclusionDiv'));
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			$('#ruleInstructionsPartial').html('Tap a ' + colorSchemes[colorIndex].dragcolorname + ' justification or a ' + 
																				colorSchemes[colorIndex].rulecolorname + ' rule, and then tap a ' + 
																				colorSchemes[colorIndex].dropcolorname + ' box to justify each line.<br><br>');// + 
																				//'To enable a pop-up example of the rule you select, check the box below.');
		} else {
			$('#ruleInstructionsPartial').html('Drag a ' + colorSchemes[colorIndex].dragcolorname + ' justification or a ' + 
																				colorSchemes[colorIndex].rulecolorname + ' rule into a ' + 
																				colorSchemes[colorIndex].dropcolorname + ' box to justify each line.' + 
																				'<br><br>Click on a rule to see an example. Click on the example to remove it.');
		}
	});
	$('#problemButton').hide();

	//check if the problem/all problems is/are solved
	var done = checkProblemsLeft();

	//show the problemButton if all the visible lines are justified and the problem is not finished
	if (!done) {
		checkVisibleLines();
	}

	//start the problem
	partiallySolvedProblemStart();
}

//starts the problem
//called when initializing and after dropping elements
function partiallySolvedProblemStart () {
	$('.tdContainer').height(500); 

	//reset the hover div
	$('#hoverPartial').hide();

	//put all the rules in the rules div:
	$('#tdRulesPartial').empty();
	$('#tdRulesPartial').append('<div class="row spacing"></div><div class="row spacing"></div>' + 
															'<div class="row spacing"></div><div class="row spacing"></div>');

	//put in the three blank tables that will contain the three sets of rules
	var allRuleTables = ['<div id = inferenceTable></div>', '<div id = replacementTable></div>', '<div id = algebraicTable></div>'];
	for (var table = 0; table < allRuleTables.length; table++) {
		$('#tdRulesPartial').append(allRuleTables[table]);
		$('#tdRulesPartial').append('<div class="row spacing"></div>')
	}

	//arrays containing information about the three rule types to efficiently loop through the rules
	var allRulesIds = ['#inferenceTable', '#replacementTable', '#algebraicTable'];
	var allRules = [inferenceRules, replacementRules, algebraicRules];
	var allTypes = ['inference', 'replacement', 'algebraic'];

	//fill up the three tables with the rules by iterating over the three rule types
	for (var array = 0; array < allRules.length; array++) {
		//array containing the rules to add (inferenceRules, replacementRules, or algebraicRules)
		var divArray = allRules[array];

		//the id of the table to fill (#inferenceTable, #replacementTable, or #algebraicTable)
		var id = allRulesIds[array];

		//the type of rule that is being added (inference, replacement, or algebraic)
		var type = allTypes[array];

		//fill up the given table with the rules from the given array,
		//making each rule draggable
		for (var i = 0; i < divArray.length; i+=2) {
			$(id).append("<tr>");

			//jStop ensures that this code correctly handles the case when divArray.length is odd (namely, in the replacement rule level)
			var jStop = i+1 < divArray.length - 1 ? i+1 : divArray.length - 1;

			//make each rule draggable
			for (var j = i; j <= jStop; j++) {
				$('<td class = bordered id = rule' + array + j + '>' + divArray[j] + '</td>').data('dropped', divArray[j]).data('type', type).appendTo(id);
				//for mobile devices, do the tap functionality
				if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
					var bordered = document.getElementById('rule' + array + j);
				//var hammer = Hammer(bordered, {preventDefault: true}).on('tap', function(event) {
				$('#rule' + array + j).click(function (event) {
					event.preventDefault();
				var target = event.target;
				//var hintsToggle = document.getElementById('hintsTogglePartial');
				//var hints = hintsToggle.checked;
				//if the target element is already selected, un-select it
				if ($('#' + target.id).hasClass('selected')) {
					$('#' + target.id).removeClass('selected');
					$('#hoverPartial').hide();
				} 
				//if the target element is not already selected, un-select the currently selected element (if there is one)
				//and select the target element
				else {
					$('.selected').removeClass('selected');
					$('#' + target.id).addClass('selected');
					$('#' + target.id).css('border-color', 'yellow');

					/*if (hints == true) {
						alert('making a pop-up hint');
						var rule = $('#' + target.id).html();
						var type = $('#' + target.id).data('type');
						makeHint(rule, type);
					} else {
						$('#hoverPartial').hide();
					}*/
				} //end of element-not-selected clause
			}); //end of tap function
			} 
			//for desktop use, make the bordered rules draggable
			else {
				$('#' + 'rule' + array + j).draggable({
					containment: '#partialProblemDivider',
					stack: allRulesIds[array],
					snap: '.correctRule',
					snapMode: 'inner',
					helper: ruleHelper,
					revert: true
				}); //end of bordered draggable function

				//attach click handler to the bordered rules (to pop up the hover div with an example of the rule)
				$('.bordered').click(function () {
					var type = $(this).data('type');
					var rule = $(this).html();
					makeHint(rule, type);
				}); //end of bordered click function

				//attach click handler to the hover div (to make it disappear when clicked)
				$('#hoverPartial').click(function () {
					$(this).hide();
				}); //end of hoverPartial click function
			} //end of mobile device check
			} //end of j loop
			$(id).append("</tr>");
		} //end of i loop
	} //end of array loop


	//change the color of the rules based on their type
	for (var inf = 0; inf < inferenceRules.length; inf++) {
		$('#rule0' + inf).addClass('inference');
	}
	for (var rep = 0; rep < replacementRules.length; rep++) {
		$('#rule1' + rep).addClass('replacement');
	}
	for (var alg = 0; alg < algebraicRules.length; alg++) {
		$('#rule2' + alg).addClass('algebraic');		
	}
	changeColors(colorSchemes[colorIndex]);
	//checkVisibleLines();
}

//returns a helper for the draggable rules
//this fixes that strange issue that was occuring when helper: 'clone' was used
function ruleHelper (event) {
	return '<td class = bordered id = helper>' + $(this).data('dropped') + '</td>';
}

//returns a helper for the draggable derived elements
function draggableHelper (event) {
	var helper = '<div class = helper>' + $(this).data('dropped') + '</div>';
	return helper;
}

function makeHint (rule, type) {
	alert('rule: ' + rule + '\ntype: ' + type);
	if (rule != undefined) {
		var line = new AProblemLine(type, rule, SQ, TR, CI, DI, Math.random(), -1);
		switch (type) {
			case 'replacement':
				fillReplacementLine(line);
				//alert('hoverDiv html: ' + $('.hoverDiv').html());
				break;
			case 'algebraic':
				fillReplacementLine(line);
				break;
			case 'inference':
				fillInferenceLine(line);
				alert('hoverDiv html: ' + $('.hoverDiv').html());
			}
			changeColors(colorSchemes[colorIndex]);
	}
}

//appends the given line based on its exclude property
function appendLine (line) {
	line.ishidden = false;
	switch (line.exclude) {
		case 'rule':
			appendProblemLineExcludingRule(line);
			break;
		case 'premises':
			appendProblemLineExcludingPremise(line);
			break;
		case 'both':
			appendProblemLineExcludingBoth(line);
			break;
		case 'allbutderived':
			appendProblemLineExcludingBoth(line);
			break;
	}
}

//appends a given line - not using Bootstrap
/*function appendGivenLine (line) {
	//append the containing div and the line number
	$('#tdLinePartial').append('<div class = \'problemGiven\' id = problemLine' + lastLineAddedPartial + '>' + '<div class = lineNumberBox>' + lastLineAddedPartial + ')</div>');

	//append the conclusion as a draggable/tap-able box
	$('<div class = draggable id = given' + lastLineAddedPartial + '>' + line.derived + '</div>').data('dropped', line.derived).data('number', lastLineAddedPartial).appendTo('#problemLine' + lastLineAddedPartial);
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		var given = document.getElementById('given' + lastLineAddedPartial);
		//var hammer = Hammer(given).on('tap', function (event) {
		$('#given' + lastLineAddedPartial).click(function (event) {
		var target = event.target;
		//if the target element is already selected, un-select it
		if ($('#' + target.id).hasClass('selected')) {
			$('#' + target.id).removeClass('selected');
		} 
		//if the target element is not already selected, un-select the currently selected element (if there is one)
		//and select the target element
		else {
			$('.selected').removeClass('selected');
			$('#' + target.id).addClass('selected');
		}
	}); //end of tap function
	} else {
		$('#given' + lastLineAddedPartial).draggable({
		containment: '#partialProblemDivider',
		stack: '.draggable',
		zIndex: 100,
		snap: '.correctPremise, .correctPremise2',
		snapMode: 'inner',
		helper: draggableHelper,
		revert: true
	}); //end of draggable function
	}

	//append an inline div containing :
	$('#problemLine' + lastLineAddedPartial).append('<div class = colonDiv>:</div>');

	//append the vertial bar
	$('#problemLine' + lastLineAddedPartial).append('<div class = vertical></div>');
	
	//append the rule, close the div, and increment lastLineAddedPartial
	$('#problemLine' + lastLineAddedPartial).append('<div class = ruleBox id = rule' + lastLineAddedPartial + '>' + line.rule + '</div>');
	lastLineAddedPartial++;
}*/

//appends a given line - using Bootstrap
function appendGivenLine (line) {
	//append the containing div and the line number
	$('#tdLinePartial').append('<div class = \'row problemGiven\' id = problemLine' + lastLineAddedPartial + '>' + 
															'<div class = \'col-sm-1 col-md-1 lineNumberBox\'>' + lastLineAddedPartial + ')</div>' + 
															'<div class = \'col-sm-3 col-md-3\' id = draggableContainer' + lastLineAddedPartial + '>' + 
															'<div class = draggable id = given' + lastLineAddedPartial + '>' + line.derived + '</div>' + 
															'</div>' + //close draggableContainer
															'<div class=\'col-sm-4 col-md-4\'></div>' + 
															'<div class = \'col-sm-1 col-md-1\'><div class = vertical></div></div>' + //vertical div
															'<div class = \'col-sm-2 col-md-2 ruleBox\' id = rule' + lastLineAddedPartial + '>' + line.rule + '</div>' + 
															'</div>'); //close row problemGiven

	//append the conclusion as a draggable/tap-able box
	$('#given' + lastLineAddedPartial).data('dropped', line.derived).data('number', lastLineAddedPartial);
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		var given = document.getElementById('given' + lastLineAddedPartial);
		$('#given' + lastLineAddedPartial).click(function (event) {
		var target = event.target;
		//if the target element is already selected, un-select it
		if ($('#' + target.id).hasClass('selected')) {
			$('#' + target.id).removeClass('selected');
		} 
		//if the target element is not already selected, un-select the currently selected element (if there is one)
		//and select the target element
		else {
			$('.selected').removeClass('selected');
			$('#' + target.id).addClass('selected');
		}
	}); //end of tap function
	} else {
		$('#given' + lastLineAddedPartial).draggable({
		containment: '#partialProblemDivider',
		stack: '.draggable',
		zIndex: 100,
		snap: '.correctPremise, .correctPremise2',
		snapMode: 'inner',
		helper: draggableHelper,
		revert: true
	}); //end of draggable function
	}
	lastLineAddedPartial++;
}

//appends a line excluding the rule and one or both premises
function appendProblemLineExcludingBoth (line) {
	//append the div containing the entire line, the line number, and the conclusion
		$('#tdLinePartial').append('<div class = \'row problemLine unjustified\' id = problemLine' + lastLineAddedPartial + '>' + 
															'<div class = \'col-sm-1 col-md-1 lineNumberBox\'>' + lastLineAddedPartial + ')</div>' + 
															'<div class=\'col-sm-3 col-md-3\'><div class = conclusionBox id = derived' + lastLineAddedPartial + '>' + line.derived + '</div></div>' + 
															'<div class = \'col-sm-3 col-md-3\' id = draggableContainer' + lastLineAddedPartial + '></div>');

		//append the droppable justification box
		/*$('<div class = correctPremise id = correctPremise' + lastLineAddedPartial + '>justification</div>').data('answer1', line.premises[0]).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#draggableContainer' + lastLineAddedPartial);
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			var correctPremise = document.getElementById('correctPremise' + lastLineAddedPartial);
			$('#correctPremise' + lastLineAddedPartial).click(function (event) {
				var target = event.target;
				var targetid = target.id;
				handleMultipleAnswer(targetid);
			});
		} else {
			$('#correctPremise' + lastLineAddedPartial).droppable({
			accept: '.draggable',
			drop: handleMultipleDrop
		});
		}*/

	if (line.premises.length == 1) {
		$('<div class = correctPremise id = correctPremise' + lastLineAddedPartial + '>justification</div>').data('answer1', line.premises[0]).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			var correctPremise = document.getElementById('correctPremise' + lastLineAddedPartial);
			//var hammer = Hammer(correctPremise).on('tap', function(event) {
			$('#correctPremise' + lastLineAddedPartial).click(function (event) {
				var target = event.target;
				var targetid = target.id;
				handleMultipleAnswer(targetid);
			});
		} else {
			$('#correctPremise' + lastLineAddedPartial).droppable({
			accept: '.draggable',
			drop: handleMultipleDrop
		});
		}
	} else if (line.premises.length == 2) {
		//if only the second premise is excluded
		if (line.exclude == 'both') {
			//append the first premise
			$('#problemLine' + lastLineAddedPartial).append('<div class = premiseBox>' + line.premises[0] + '</div><div class = inlineDiv>,</div>');

			//append a comma between premises
			$('#problemLine' + lastLineAddedPartial).append('<div class = inlineDiv>,</div>');

			//append the second premise as a droppable box
			$('<div class = correctPremise2 id = correctPremise' + lastLineAddedPartial + '>justification</div>').data('answer', line.premises[1]).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				var correctPremise2 = document.getElementById('correctPremise' + lastLineAddedPartial);
			//var hammer = Hammer(correctPremise2).on('tap', function(event) {
			$('#correctPremise' + lastLineAddedPartial).click(function (event) {
				var target = event.target;
				var targetid = target.id;
				handleMultipleAnswer(targetid);
			});
			} else {
				$('#correctPremise2' + lastLineAddedPartial).droppable({
					accept: '.helper',
					drop: handleMultipleDrop
				});
			}
		} 
		//both premises are excluded
		else {
			//append the first premise as a droppable box
			$('<div class = correctPremise id = correctPremise1' + lastLineAddedPartial + '>justification1</div>').data('answer1', line.premises[0]).data('answer2', line.premises[1]).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				var correctPremise = document.getElementById('correctPremise1' + lastLineAddedPartial);
				//var hammer = Hammer(correctPremise).on('tap', function(event) {
				$('#correctPremise1' + lastLineAddedPartial).click(function (event) {
					var target = event.target;
					var targetid = target.id;
					handleMultipleAnswer(targetid);
				});
			} else {
				$('#correctPremise1' + lastLineAddedPartial).droppable({
					accept: '.draggable',
					drop: handleMultipleDrop
				});
			}

			//append a comma between premises
			$('#problemLine' + lastLineAddedPartial).append('<div class = inlineDiv>,</div>');

			//append the second premise as a droppable box
			$('<div class = correctPremise2 id = correctPremise2' + lastLineAddedPartial + '>justification2</div>').data('answer1', line.premises[0]).data('answer2', line.premises[1]).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				var correctPremise2 = document.getElementById('correctPremise2' + lastLineAddedPartial);
				//var hammer2 = Hammer(correctPremise2).on('tap', function(event) {
				$('#correctPremise2' + lastLineAddedPartial).click(function (event) {
					var target = event.target;
					var targetid = target.id;
					handleMultipleAnswer(targetid);
				});
			} else {
				$('#correctPremise2' + lastLineAddedPartial).droppable({
					accept: '.draggable',
					drop: handleMultipleDrop
				});
			}
		}		
	}	

	//append a vertical line before the rule
	$('#problemLine' + lastLineAddedPartial).append('<div class = vertical></div>');

	//append the droppable rule box to accept a bordered rule from the #tdRules div
	$('<div class = correctRule id = correctRule' + lastLineAddedPartial + '>rule</div>').data('answer1', line.rule).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		var correctRule = document.getElementById('correctRule' + lastLineAddedPartial);
		$('#correctRule' + lastLineAddedPartial).click(function (event) {
			var target = event.target;
			var targetid = target.id;
			handleMultipleAnswer(targetid);
		});
	} else {
			$('#correctRule' + lastLineAddedPartial).droppable({
				accept: '.bordered',
				drop: handleMultipleDrop
			})
	}

	$('#tdLinePartial').append('</div>');
	lastLineAddedPartial++;
	changeColors(colorSchemes[colorIndex]);
}

//changes the appearance of a justified line
function justifyLine (number, derived, answer) {
	//the line is now justified, set the justified field to true
	currentProblem.steps[number - currentProblem.givens.length - 1].justified = true;

	//change the background of the line to show that it's justified
	$('#problemLine' + number).removeClass('unjustified').addClass('justified');

	//change the rule from correctRule to ruleBox
	$('#correctRule' + number).removeClass().addClass('ruleBox');

	//change the premises from correctPremise to premiseBox
	$('#correctPremise' + number).removeClass().addClass('premiseBox');
	$('#correctPremise1' + number).removeClass().addClass('premiseBox');
	$('#correctPremise2' + number).removeClass().addClass('premiseBox2');

	//make the derived element draggable or tap-able
	$('#derived' + number).removeClass().addClass('draggable').data('dropped', derived);
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		var derived = document.getElementById('derived' + number);
		//var hammer = Hammer(derived).on('tap', function(event) {
		$('#derived' + number).click(function (event) {
		var target = event.target;
				//if the target element is already selected, un-select it
				if ($('#' + target.id).hasClass('selected')) {
					$('#' + target.id).removeClass('selected');
				} 
				//if the target element is not already selected, un-select the currently selected element (if there is one)
				//and select the target element
				else {
					$('.selected').removeClass('selected');
					$('#' + target.id).addClass('selected');
				}
			});
	} else {
		$('#derived' + number).draggable({
		containment: '#partialProblemDivider',
		stack: '.draggable',
		zIndex: 100,
		snap: '.correctPremise, .correctPremise2',
		snapMode: 'inner',
		helper: draggableHelper,
		revert: true
	});
	}

	//change the colors
	changeColors(colorSchemes[colorIndex]);

	$('#ruleInstructionsPartial').html('Correct! Now fill in the other line(s) to continue.');

	Meteor.call('updateStudentModel', 'currentproblemindex', currentProblemIndex);
	Meteor.call('updateStudentModel', 'partialproblems', partialProblems);

	//if all the currently shown lines have been justified, show the nextLine button
	checkVisibleLines();
	
}

//if all the currently visible lines are justified, shows the problem/next line button
//and updates the instructions html
function checkVisibleLines () {
	if (allVisibleLinesJustified()) {
		$('#problemButton').show();
		$('#ruleInstructionsPartial').html('Correct! Click \'Next Line\' to continue.');
	}
}

//returns true iff all currently shown lines are justified
//helper function for justifyLine() to determine whether to show the next line button
function allVisibleLinesJustified () {
	for (var i in currentProblem.steps) {
		if (!currentProblem.steps[i].justified && !currentProblem.steps[i].ishidden) {
			return false;
		}
	}
	return true;
}

function allLinesJustified () {
	for (var i in currentProblem.steps) {
		if (!currentProblem.steps[i].justified) {
			return false;
		}
	}
	return true;
}

//handles drops with the lines with only one element missing (exclude == 'premises' or exclude == 'rule')
function handleProblemDrop (event, ui) {
	var dropped = ui.draggable.data('dropped');

	var answer = $(this).data('answer');

	if (dropped == answer) {
		//the line is justified since the line was only missing one element
		justifyLine($(this).data('number'), $(this).data('derived'), answer);

		//set the draggable/droppable options											
		ui.helper.position({of: $(this), my: 'center', at: 'center'});				
		ui.draggable.draggable('option', 'revert', false);	
		$(this).html(dropped);					
		$(this).droppable({'disabled': true});																			
		
		//determine whether the problem has been solved:
		//the number of steps in the problem
		var problemSolved = currentProblem.givens.length + currentProblem.steps.length + 1;

		//check whether the problem/all the problems have been solved
		checkProblemsLeft(); 	
	} 

	//an incorrect element was dropped
	else {
		$('#ruleInstructionsPartial').html('Sorry, incorrect. Please try a different option.');
		$('#problemButton').hide();
		ui.draggable.draggable('option', 'revert', true);
		$('.bordered').draggable({disabled: true});
	}

	Meteor.call('updateStudentModel', 'currentproblemindex', currentProblemIndex);
	Meteor.call('updateStudentModel', 'partialproblems', partialProblems);
	partiallySolvedProblemStart();
}

function handleAnswer (targetid) {
	//var target = event.gesture.target;
	//var dropped = ui.draggable.data('dropped');
	var dropped = $('.selected').data('dropped');

	var answer = $('#' + targetid).data('answer');

	$('.selected').removeClass('selected');

	if (dropped == answer) {
		//the line is justified since the line was only missing one element
		justifyLine($('#' + targetid).data('number'), $('#' + targetid).data('derived'), answer);

		//set the draggable/droppable options												
		$('#' + targetid).html(dropped);																								
		
		//determine whether the problem has been solved:
		//the number of steps in the problem
		var problemSolved = currentProblem.givens.length + currentProblem.steps.length + 1;

		//check whether the problem/all the problems have been solved
		checkProblemsLeft(); 	
	} 

	//an incorrect element was dropped
	else {
		$('#ruleInstructionsPartial').html('Sorry, incorrect. Please try a different option.');
		$('#problemButton').hide();
	}

	Meteor.call('updateStudentModel', 'currentproblemindex', currentProblemIndex);
	Meteor.call('updateStudentModel', 'partialproblems', partialProblems);
	partiallySolvedProblemStart();
}

//handles drops with lines with multiple missing elements (exclude == 'both' or exclude == 'allbutderived')
function handleMultipleAnswer (targetid) {
	//the number of the current line (used to fix the html/css of the line)
	var lineNumber = $('#' + targetid).data('number');

	//the current line
	var currentLine = currentProblem.steps[lineNumber - currentProblem.givens.length - 1];

	//find the answers that go with the current line, and the thing that was dropped
	var answer1;
	var answer2;
	var dropped = $('.selected').data('dropped');
	if (currentLine.exclude == 'both') {
		answer1 = $('#' + targetid).data('answer');
		answer2 = null;
	} else {
		answer1 = $('#' + targetid).data('answer1');
		answer2 = $('#' + targetid).data('answer2');
	}

	$('.selected').removeClass('selected');

	//a correct element was dropped
	if (dropped == answer1 || dropped == answer2) {
		//set the draggable/droppable options												
		$('#' + targetid).html(dropped);																								

		//a correct premise was dropped
		if ($('#' + targetid).hasClass('correctPremise') || $('#' + targetid).hasClass('correctPremise2')) {
			if ($('#' + targetid).hasClass('correctPremise')) {
				currentLine.droppedpremises[0] = dropped;
				//alert('currentLine.droppedpremises[0]: ' + currentLine.droppedpremises[0]);
				$('#' + targetid).removeClass().addClass('premiseBox');
			} else {
				currentLine.droppedpremises[1] = dropped;
				$('#' + targetid).removeClass().addClass('premiseBox2');
			}
			$('#ruleInstructionsPartial').html('Correct! Now fill in the other yellow box(es) to complete the line.');
			changeColors(colorSchemes[colorIndex]);
		} 

		//a correct rule was dropped
		else if ($('#' + targetid).hasClass('correctRule')) {
			currentLine.ruledropped = true;
			$('#correctRule' + lineNumber).removeClass().addClass('ruleBox');
			$('#ruleInstructionsPartial').html('Correct! Now fill in the other yellow box(es) to complete the line.');
		}

		//the number of dropped premises needed to finish the line
		//if one premise is excluded, 1 otherwise the number of premises
		var minDroppedPremises = currentLine.exclude == 'both' ? 1 : currentLine.premises.length;
		//alert('minDroppedPremises: ' + minDroppedPremises + '\ndroppedpremises: ' + currentLine.droppedpremises + '\nruledropped: ' + currentLine.ruledropped);

		//the line has been justified
		if (currentLine.droppedpremises.length >= minDroppedPremises && currentLine.ruledropped) {
			justifyLine($('#' + targetid).data('number'), $('#' + targetid).data('derived'), answer1);

			//check whether the entire problem has been solved,
			//and whether all the problems have been solved
			checkProblemsLeft();
		}
	} 

	//an incorrect element was dropped
	else {
		$('#ruleInstructionsPartial').html('Sorry, incorrect. Please try a different option.');
		$('#problemButton').hide();
	}
	partialProblems[currentProblemIndex].steps[lineNumber - currentProblem.givens.length - 1].droppedpremises = currentLine.droppedpremises;
	Meteor.call('updateStudentModel', 'currentproblemindex', currentProblemIndex);
	Meteor.call('updateStudentModel', 'partialproblems', partialProblems);
	partiallySolvedProblemStart();
}

//handles drops with lines with multiple missing elements (exclude == 'both' or exclude == 'allbutderived')
function handleMultipleDrop (event, ui) {
	//the number of the current line (used to fix the html/css of the line)
	var lineNumber = $(this).data('number');

	//the current line
	var currentLine = currentProblem.steps[lineNumber - currentProblem.givens.length - 1];

	//find the answers that go with the current line, and the thing that was dropped
	var answer1;
	var answer2;
	var dropped = ui.draggable.data('dropped');
	if (currentLine.exclude == 'both') {
		answer1 = $(this).data('answer');
		answer2 = null;
	} else {
		answer1 = $(this).data('answer1');
		answer2 = $(this).data('answer2');
	}

	//a correct element was dropped
	if (dropped == answer1 || dropped == answer2) {
		//set the draggable/droppable options											
		ui.helper.position({of: $(this), my: 'center', at: 'center'});				
		ui.draggable.draggable('option', 'revert', false);	
		$(this).html(dropped);					
		$(this).droppable({'disabled': true});																			

		//a correct premise was dropped
		if ($(this).hasClass('correctPremise') || $(this).hasClass('correctPremise2')) {
			if ($(this).hasClass('correctPremise')) {
				currentLine.droppedpremises[0] = dropped;
				$(this).removeClass().addClass('premiseBox');
			} else {
				currentLine.droppedpremises[1] = dropped;
				$(this).removeClass().addClass('premiseBox2');
			}
			changeColors(colorSchemes[colorIndex]);
			if ($(this).attr('id') == 'correctPremise' + lineNumber) {
				$('#ruleInstructionsPartial').html('Correct! Now drag a ' + colorSchemes[colorIndex].rulecolorname + ' rule into the other ' + colorSchemes[colorIndex].dropcolorname + ' box to complete the line.');
			} else {
				$('#ruleInstructionsPartial').html('Correct! Now fill in the other yellow box(es) to complete the line.');
			}
		} 

		//a correct rule was dropped
		else if ($(this).hasClass('correctRule')) {
			currentLine.ruledropped = true;
			$('#correctRule' + lineNumber).removeClass().addClass('ruleBox');
			$('#ruleInstructionsPartial').html('Correct! Now fill in the other yellow box(es) to complete the line.');
		}

		//the number of dropped premises needed to finish the line
		//if one premise is excluded, 1 otherwise the number of premises
		var minDroppedPremises = currentLine.exclude == 'both' ? 1 : currentLine.premises.length;

		//the line has been justified
		if (currentLine.droppedpremises.length == minDroppedPremises && currentLine.ruledropped) {
			justifyLine($(this).data('number'), $(this).data('derived'), answer1);

			//check whether the entire problem has been solved,
			//and whether all the problems have been solved
			checkProblemsLeft();
		}
	} 

	//an incorrect element was dropped
	else {
		$('#ruleInstructionsPartial').html('Sorry, incorrect. Please try a different option.');
		$('#problemButton').hide();
		ui.draggable.draggable('option', 'revert', true);
		$('.bordered').draggable({disabled: true});
	}
	Meteor.call('updateStudentModel', 'currentproblemindex', currentProblemIndex);
	Meteor.call('updateStudentModel', 'partialproblems', partialProblems);
	partiallySolvedProblemStart();
}

//checks whether the current problem has been solved,
//and whether all the problems have been solved
function checkProblemsLeft () {
	//the problem is solved
	if (allLinesJustified()) {
		$('#ruleInstructionsPartial').html('Congratulations! You solved the problem! Click \'Next Problem\' to continue.');

		//still more problems to solve
		if (currentProblemIndex < partialProblems.length - 1) {
			$('#problemButton').html('Next Problem');
			$('#problemButton').css('font-size', '18px');
			$('#problemButton').unbind();
			$('#problemButton').click(function () {
				$('#problemButton').css('font-size', '14px');
				currentProblemIndex++;
				Meteor.call('updateStudentModel', 'currentproblemindex', currentProblemIndex);
				currentProblem = partialProblems[currentProblemIndex];
				initializePartiallySolvedProblem();
				if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
					$('#ruleInstructionsPartial').html('Tap a ' + colorSchemes[colorIndex].dragcolorname + ' justification or a ' + 
																				colorSchemes[colorIndex].rulecolorname + ' rule, and then tap a ' + 
																				colorSchemes[colorIndex].dropcolorname + ' box to justify each line.<br><br>');// + 
																				//'To enable a pop-up example of the rule you select, check the box below.');
				} else {
						$('#ruleInstructionsPartial').html('Drag a ' + colorSchemes[colorIndex].dragcolorname + ' justification or a ' + 
																				colorSchemes[colorIndex].rulecolorname + ' rule into a ' + 
																				colorSchemes[colorIndex].dropcolorname + ' box to justify each line.' + 
																				'<br><br>Click on a rule to see an example. Click on the example to remove it.');
				}
			});
			$('#problemButton').show();

		//all the problems have been solved 
		} else {
			$('#ruleInstructionsPartial').html('Congratulations! You solved all of the problems!');
			$('#problemButton').hide();
		}
		return true;
	}
	return false;
}