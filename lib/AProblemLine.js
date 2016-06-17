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

//var currentSubLevel = 0;
var inferencechoices;
var replacementchoices;
var algebraicchoices;
var globalconclusion;
var globalpremise1;
var globalpremise2;
var globalpremise;

AProblemLine = function (type, randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, premiseOrder, sublevel, number) {
	this.currentSubLevel = sublevel;
	this.answered = false;
	this.correct = false;
	this.randomRule = randomRule;
	this.randomLetters = [randomLetter1, randomLetter2, randomLetter3, randomLetter4];
	this.number = number;
	this.numAttempts = 0;
	switch (type) {
		case 'inference':
			this.makeInferenceLineParams(randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, premiseOrder, sublevel);
			this.choices = inferencechoices;
			this.conclusion = globalconclusion;
			this.premise1 = globalpremise1;
			this.premise2 = globalpremise2;
			break;
		case 'replacement':
			this.makeReplacementLineParams(randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, premiseOrder, sublevel);
			this.conclusion = globalconclusion;
			this.premise = globalpremise;
			this.choices = replacementchoices;
			break;
		case 'algebraic':
			this.makeAlgebraicLineParams(randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, premiseOrder, sublevel);
			this.conclusion = globalconclusion;
			this.premise = globalpremise;
			this.choices = algebraicchoices;
			break;
	}
}

AProblemLine.prototype.makeInferenceLineParams = function (randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, premiseOrder, currentSubLevel) {		
	//choose the premises and conclusion and the choices for premise and conclusion based on the random rule chosen
	var premise1;
	var premise2;
	var conclusion;
	var conclusionChoices = [];
	var premiseChoices = [];

	switch (randomRule) {
		case 'MP':
			if (premiseOrder < 0.5) {
				premise1 = randomLetter1 + " " + IMP + " " + randomLetter2;
				premise2 = randomLetter1;
			} else {
				premise2 = randomLetter1 + " " + IMP + " " + randomLetter2;
				premise1 = randomLetter1;
			}		
			conclusion = randomLetter2;
			conclusionChoices = [conclusion, randomLetter1, NOT + randomLetter1, NOT + randomLetter2];
			premiseChoices = [premise2, randomLetter2, NOT + randomLetter1, randomLetter2 + " " + IMP + " " + randomLetter1];
			break;
		case 'MT':
			if (premiseOrder < 0.5) {
				premise1 = randomLetter1 + " " + IMP + " " + randomLetter2;
				premise2 = NOT + randomLetter2;
			} else {
				premise2 = randomLetter1 + " " + IMP + " " + randomLetter2;
				premise1 = NOT + randomLetter2;
			}		
			conclusion = NOT + randomLetter1;
			conclusionChoices = [conclusion, randomLetter2, randomLetter1, NOT + randomLetter2];
			premiseChoices = [premise2, randomLetter2, randomLetter2 + " " + IMP + " " + randomLetter1, randomLetter1];
			break;
		case 'DS':
			if (premiseOrder < 0.25) {
				premise1 = randomLetter1 + " " + OR + " " + randomLetter2;
				premise2 = NOT + randomLetter2;
				conclusion = randomLetter1;
				conclusionChoices = [conclusion, randomLetter2, NOT + randomLetter1, NOT + randomLetter2];
				premiseChoices = [premise2, NOT + randomLetter1, randomLetter2, randomLetter1 + " " + IMP + " " + randomLetter2];
			} else if (premiseOrder < 0.5) {
				premise1 = randomLetter1 + " " + OR + " " + randomLetter2;
				premise2 = NOT + randomLetter1;
				conclusion = randomLetter2;
				conclusionChoices = [conclusion, randomLetter1, NOT + randomLetter1, NOT + randomLetter2];
				premiseChoices = [premise2, randomLetter1, randomLetter2 + " " + IMP + " " + randomLetter1, NOT + randomLetter2];
			} else if (premiseOrder < 0.75) {
				premise1 = NOT + randomLetter1 + " " + OR + " " + randomLetter2;
				premise2 = NOT + randomLetter2;
				conclusion = NOT + randomLetter1;
				conclusionChoices = [conclusion, randomLetter2, randomLetter1, NOT + randomLetter2];
				premiseChoices = [premise2, randomLetter2, randomLetter2 + " " + IMP + " " + randomLetter1, randomLetter1];
			} else {
				premise1 = NOT +randomLetter1 + " " + OR + " " + randomLetter2;
				premise2 = randomLetter1;
				conclusion = randomLetter2;
				conclusionChoices = [conclusion, NOT + randomLetter2, NOT + randomLetter1, randomLetter1];
				premiseChoices = [premise2, NOT + randomLetter1, randomLetter2 + " " + IMP + " " + randomLetter1, NOT + randomLetter2];
			}					
			break;
		case 'ADD':
			if (premiseOrder < 0.25) {
				premise1 = randomLetter1;
				premise2 = " ";
				conclusion = randomLetter1 + " " + OR + " " + randomLetter2;
				conclusionChoices = [conclusion, NOT + randomLetter1 + " " + AND + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
				premiseChoices = [conclusion, NOT + randomLetter1 + " " + AND + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
			} else if (premiseOrder < 0.5) {
				premise1 = randomLetter2;
				premise2 = " ";
				conclusion = randomLetter1 + " " + OR + " " + randomLetter2;
				conclusionChoices = [conclusion, NOT + randomLetter1 + " " + AND + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
				premiseChoices = [conclusion, NOT + randomLetter1 + " " + AND + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
			} else if (premiseOrder < 0.75) {
				premise2 = " ";
				premise1 = randomLetter1;
				conclusion = randomLetter2 + " " + OR + " " + randomLetter1;
				conclusionChoices = [conclusion, NOT + randomLetter1 + " " + AND + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
			} else {
				premise2 = " ";
				premise1 = randomLetter2;
				conclusion = randomLetter2 + " " + OR + " " + randomLetter1;
				conclusionChoices = [conclusion, NOT + randomLetter1 + " " + AND + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
				premiseChoices = [conclusion, NOT + randomLetter1 + " " + AND + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
			}									
			break;
		case 'SIMP':
			if (premiseOrder < 0.5) {
				premise1 = randomLetter1 + " " + AND + " " + randomLetter2;
				premise2 = " ";
				conclusion = randomLetter1;
				conclusionChoices = [conclusion, NOT + randomLetter1, NOT + randomLetter2, randomLetter1 + " " + IMP + " " + randomLetter2];
				premiseChoices = [conclusion, NOT + randomLetter1, NOT + randomLetter2, randomLetter1 + " " + IMP + " " + randomLetter2];
			} else {
				premise1 = randomLetter1 + " " + AND + " " + randomLetter2;
				premise2 = " ";
				conclusion = randomLetter2;
				conclusionChoices = [conclusion, NOT + randomLetter1, NOT + randomLetter2, randomLetter1 + " " + IMP + " " + randomLetter2];
				premiseChoices = [conclusion, NOT + randomLetter1, NOT + randomLetter2, randomLetter1 + " " + IMP + " " + randomLetter2];
			}
			break;
		case 'CONJ':
			premise1 = randomLetter1;
			premise2 = randomLetter2;
			conclusion = randomLetter1 + " " + AND + " " + randomLetter2;
			conclusionChoices = [conclusion, NOT + randomLetter1 + " " + OR + " " + randomLetter2, NOT + randomLetter1, randomLetter1 + " " + AND + " " + NOT + randomLetter2];
			premiseChoices = [premise2, NOT + randomLetter1, NOT + randomLetter2, randomLetter1 + " " + OR + " " + randomLetter2];
			break;
		case 'HS':			
			premise1 = randomLetter1 + " " + IMP + " " + randomLetter2;
			premise2 = randomLetter2 + " " + IMP + " " + randomLetter3;
			conclusion = randomLetter1 + " " + IMP + " " + randomLetter3;
			conclusionChoices = [conclusion, randomLetter2 + " " + IMP + " " + randomLetter1, 
						NOT + randomLetter1 + " " + IMP + " " + NOT + randomLetter3, NOT + randomLetter2 + " " + IMP + " " + NOT + randomLetter3];
			premiseChoices = [premise2, randomLetter1 + " " + IMP + " " + randomLetter3, randomLetter3 + " " + IMP + " " + randomLetter1, randomLetter2 + " " + IMP + " " + randomLetter1];
			break;
		case 'CD':
			premise1 = "(" + randomLetter1 + " " + IMP + " " + randomLetter2 + ")" + " " + AND + " " + "(" + randomLetter3 + " " + IMP + " " + randomLetter4 + ")";
			premise2 = randomLetter1 + " " + OR + " " + randomLetter3;
			conclusion = randomLetter2 + " " + OR + " " + randomLetter4;
			conclusionChoices = [conclusion, randomLetter1 + " " + OR + " " + randomLetter4, 
						randomLetter2 + " " + OR + " " + randomLetter3, randomLetter1 + " " + OR + " " + randomLetter2];
			premiseChoices = [premise2, randomLetter3 + " " + AND + " " + randomLetter1, randomLetter1 + " " + OR + " " + randomLetter4, randomLetter3 + " " + OR + " " + randomLetter4];
			break;
	}

	globalconclusion = conclusion;
	globalpremise1 = premise1;
	globalpremise2 = premise2;
	inferencechoices = scramble(conclusionChoices);
	if (currentSubLevel == 2) {
		inferencechoices = scramble(premiseChoices);
	}
}

fillInferenceLine = function (line) {
	//making an example line to put in the .hoverDiv
	if (line.randomLetters[0] == SQ) {
		var fullName = getFullRuleName(line.randomRule);
		$('.hoverDiv').html('<span class = hoverLabel><strong>' + fullName + '</strong></span><br>' + 
							'<div class = \'problemLine line\' id = line' + line.number + '>' +
							'<div class = conclusionBoxExample id = conclusion' + line.number + '>' + line.conclusion + '</div>:' + //'<div class = inline:</div> ' + 
							'<div class = premiseBoxExample id = premiseA' + line.number + '>' + line.premise1 + '</div>, ' + 
							'<div class = premiseBoxExample id = premiseB' + line.number + '>' + line.premise2 + '</div>' + 
							'<div class = \'ruleBoxExample lineRule\' id = lineRule' + line.number + '>' + line.randomRule + '</div>').show();
		$('.hoverDiv').html('<span class = hoverLabel><strong>' + fullName + '</strong></span><br>' + 
												'<div class = \'row problemLine line\' id=line' + line.number + '>' +  
													'<div class = \'col-sm-3 col-md-3\'><div class = conclusionBoxExample id = conclusion' + line.number + '>' + line.conclusion + '</div>:</div>' +  
													'<div class = \'col-sm-4 col-md-4\'><div class = premiseBoxExample id = premiseA' + line.number + '>' + line.premise1 + '</div>, </div> ' +
													'<div class = \'col-sm-3 col-md-3\'><div class = premiseBoxExample id = premiseB' + line.number + '>' + line.premise2 + '</div></div>' +   
													'<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class = \'ruleBoxExample lineRule\' id = lineRule' + line.number + '>' + line.randomRule + '</div></div>' + 
												 '</div>').show();
		return;
	}

	//set the html of the div containing the premises, conclusion, and rule block
	var lineDiv = '<div class = \'row problemLine line\' id = line' + line.number + '><div class = \'col-sm-1 col-md-1\'><div class=lineNumberBox>' + line.number + ')</div></div>';
	var box = '<div class = correctPremise id = correctPremise' + line.number + '>justification</div>';
	var premiseAspan = '<div class = \'col-sm-3 col-md-3\'><div class = premiseBox id = premiseA' + line.number + '>' + line.premise1 + '</div>, </div> ';
	var premiseBspan = '<div class = \'col-sm-3 col-md-3\'><div class = premiseBox id = premiseB' + line.number + '>' + line.premise2 + '</div></div>';
	var conclusionspan = '<div class = \'col-sm-3 col-md-3\'><div class = conclusionBox id = conclusion' + line.number + '>' + line.conclusion + '</div>:</div>';
	var lineRule = '<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class=\'ruleBox lineRule\' id=lineRule' + line.number + '>' + line.randomRule + '</div></div>';
	switch (line.currentSubLevel) {
		//premise sublevel
		case 2:
			if (line.answered) {
				if (line.correct) {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + premiseBspan + lineRule);
				} else {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + '<div class = \'col-sm-3 col-md-3\'><div class = correctPremise id = correctPremise' + line.number + '>justification2</div></div>' + lineRule);
				}
			} else {
				$('#line').html(lineDiv  + conclusionspan + premiseAspan + '<div class = \'col-sm-3 col-md-3\'><div class = correctPremise id = correctPremise' + line.number + '>justification2</div></div>' + lineRule);
				//alert('line html: ' + $('#line').html());
			}	
			$('#correctPremise' + line.number).data('answer', line.premise2);
			$('#correctPremise' + line.number).data('currentRule', line.randomRule);	
			break;
		//conclusion sublevel
		case 1:
			if (line.answered) {
				if (line.correct) {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + premiseBspan + lineRule);
				} else {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + premiseBspan + lineRule);
				}
			} else {
				$('#line').html(lineDiv + 
							'<div class = \'col-sm-3 col-md-3\'><div class = correctConclusion id = correctConclusion' + line.number + '>conclusion</div></div> ' + 
							premiseAspan + premiseBspan + lineRule);				
			}	
			$('#correctConclusion' + line.number).data('answer', line.conclusion);
			$('#correctConclusion' + line.number).data('currentRule', line.randomRule);		
			break;
		//rule sublevel
		default:
			if (line.answered) {
				if (line.correct) {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + premiseBspan + lineRule);
				} else {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + premiseBspan + '<div class = \'col-sm-1 col-md-1\'><div class=vertical><div class = \'ruleBox lineRule\' id = lineRule' + line.number + '>rule</div></div>');
				}
			} else {
				if (line.randomRule == 'ADD' || line.randomRule == 'SIMP') {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + 
							'<div class = vertical></div><div class = correctRule id = correctRule' + line.number + '>rule</div>');
				} else {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + premiseBspan + 
							'<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class = correctRule id = correctRule' + line.number + '>rule</div></div>');
				}
			}
			$('#correctRule' + line.number).data('answer', line.randomRule);
			$('#correctRule' + line.number).data('currentRule', line.randomRule);
	}

	//adjust the font size if the rule is CD
	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	$('#premiseA' + line.number).css('font-size', 16);
	$('#premiseB' + line.number).css('font-size', 16);
	$('#correctPremise' + line.number).css('font-size', 16);
	var smallSize = mobile ? 10 : 12;
	if (line.currentSubLevel == 0 || line.currentSubLevel == 1) {
		if (line.randomRule == 'CD') {
			if ($('#premiseA' + line.number).html().length >= 10) {
				$('#premiseA' + line.number).css('font-size', smallSize);
			}
			if ($('#premiseB' + line.number).html().length >= 10) {
				$('#premiseB' + line.number).css('font-size', smallSize);
			}
		}
	} else {
		if (line.randomRule == 'CD') {
			if ($('#correctPremise' + line.number).html() != 'justification2') {
				$('#correctPremise' + line.number).css('font-size', smallSize);
			}
			if ($('#premiseA' + line.number).html().length >= 10) {
				$('#premiseA' + line.number).css('font-size', smallSize);
			}
		}
	} //end premise sublevel
	
}

AProblemLine.prototype.makeReplacementLineParams = function (randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, premiseOrder, currentSubLevel) {
	//choose the premises and conclusion based on the random rule chosen
	var premise = randomLetter1;
	var conclusion = NOT + NOT + randomLetter1;	
	var conclusionChoices = [];
	var premiseChoices = [];
	switch (randomRule) {
		case 'DN':
			if (premiseOrder < 0.5) {
				premise = randomLetter1;
				conclusion = NOT + NOT + randomLetter1;
			} else {
				premise = NOT + NOT + randomLetter1;
				conclusion = randomLetter1;
			}		
			conclusionChoices = [conclusion, NOT + randomLetter1, NOT + NOT + NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
			premiseChoices = [premise, NOT + randomLetter1, NOT + NOT + NOT + randomLetter1, randomLetter1 + " " + AND + " " + randomLetter2];
			break;
		case 'DeM':
			if (premiseOrder < 0.25) {
				premise = NOT + "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ")";
				conclusion = NOT + randomLetter1 + " " + AND + " " + NOT + randomLetter2;
				conclusionChoices = [conclusion, NOT + "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ")",
									NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2, randomLetter1 + " " + AND + " " + randomLetter2];
				premiseChoices = [premise, NOT + "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ")",
									NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2, randomLetter1 + " " + AND + " " + randomLetter2]
			} else if (premiseOrder < 0.5) {
				conclusion = NOT + "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ")";
				premise = NOT + randomLetter1 + " " + AND + " " + NOT + randomLetter2;
				conclusionChoices = [conclusion, NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2,
									NOT + "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ")", randomLetter1 + " " + AND + " " + randomLetter2];
				premiseChoices = [premise, NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2,
									NOT + "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ")", randomLetter1 + " " + AND + " " + randomLetter2];
			} else if (premiseOrder < 0.75) {
				premise = NOT + "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ")";
				conclusion = NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2;
				conclusionChoices = [conclusion, NOT + "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ")",
									NOT + randomLetter1 + " " + AND + " " + NOT + randomLetter2, randomLetter1 + " " + OR + " " + randomLetter2];
				premiseChoices = [premise, NOT + "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ")",
									NOT + randomLetter1 + " " + AND + " " + NOT + randomLetter2, randomLetter1 + " " + OR + " " + randomLetter2];
			} else {
				conclusion = NOT + "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ")";
				premise = NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2;
				conclusionChoices = [conclusion, NOT + "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ")",
									NOT + randomLetter1 + " " + AND + " " + NOT + randomLetter2, randomLetter1 + " " + OR + " " + randomLetter2];
				premiseChoices = [premise, NOT + "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ")",
									NOT + randomLetter1 + " " + AND + " " + NOT + randomLetter2, randomLetter1 + " " + OR + " " + randomLetter2];
			}		
			break;
		case 'Impl':
			if (premiseOrder < 0.5) {
				premise = randomLetter1 + " " + IMP + " " + randomLetter2;
				conclusion = NOT + randomLetter1 + " " + OR + " " + randomLetter2;
			} else {
				conclusion = randomLetter1 + " " + IMP + " " + randomLetter2;
				premise = NOT + randomLetter1 + " " + OR + " " + randomLetter2;
			}	
			conclusionChoices = [conclusion, randomLetter1 + " " + OR + " " + NOT + randomLetter2, 
								randomLetter2 + " " + IMP + " " + randomLetter1, NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2];	
			premiseChoices = [premise, randomLetter1 + " " + OR + " " + NOT + randomLetter2, 
								randomLetter2 + " " + IMP + " " + randomLetter1, NOT + randomLetter1 + " " + OR + " " + NOT + randomLetter2];
			break;
		case 'CP':
			if (premiseOrder < 0.5) {
				premise = randomLetter1 + " " + IMP + " " + randomLetter2;
				conclusion = NOT + randomLetter2 + " " + IMP + " " + NOT + randomLetter1;
			} else {
				conclusion = randomLetter1 + " " + IMP + " " + randomLetter2;
				premise = NOT + randomLetter2 + " " + IMP + " " + NOT + randomLetter1;
			}	
			conclusionChoices = [conclusion, randomLetter2 + " " + IMP + " " + randomLetter1, 
									NOT + randomLetter1 + " " + IMP + " " + NOT + randomLetter2, randomLetter1 + " " + EQUAL + " "  + randomLetter2];	
			premiseChoices = [premise, randomLetter2 + " " + IMP + " " + randomLetter1, 
									NOT + randomLetter1 + " " + IMP + " " + NOT + randomLetter2, randomLetter1 + " " + EQUAL + " "  + randomLetter2];			
			break;
		case 'Equiv':
			if (premiseOrder < 0.5) {
				premise = randomLetter1 + " " + EQUAL + " " + randomLetter2;
				conclusion = "(" + randomLetter1 + " " + IMP + " " + randomLetter2 + ")" + " " + AND + " " + "(" + randomLetter2 + " " + IMP + " " + randomLetter1 + ")";
			} else {
				conclusion = randomLetter1 + " " + EQUAL + " " + randomLetter2;
				premise = "(" + randomLetter1 + " " + IMP + " " + randomLetter2 + ")" + " " + AND + " " + "(" + randomLetter2 + " " + IMP + " " + randomLetter1 + ")";
			}
			conclusionChoices = [conclusion, 
								"(" + NOT + randomLetter1 + " " + IMP + " " + randomLetter2 + ")" + " " + AND + " " + "(" + NOT + randomLetter2 + " " + IMP + " " + randomLetter1 + ")",
								"(" + randomLetter1 + " " + IMP + " " + NOT + randomLetter2 + ")" + " " + OR + " " + "(" + randomLetter2 + " " + IMP + " " + NOT + randomLetter1 + ")",
								"(" + randomLetter1 + " " + IMP + " " + NOT + randomLetter2 + ")" + " " + AND + " " + "(" + randomLetter2 + " " + IMP + " " + randomLetter1 + ")"];	
			premiseChoices = [premise,
							  "(" + NOT + randomLetter1 + " " + IMP + " " + randomLetter2 + ")" + " " + AND + " " + "(" + NOT + randomLetter2 + " " + IMP + " " + randomLetter1 + ")",
							  "(" + randomLetter1 + " " + IMP + " " + NOT + randomLetter2 + ")" + " " + OR + " " + "(" + randomLetter2 + " " + IMP + " " + NOT + randomLetter1 + ")",
							  "(" + randomLetter1 + " " + IMP + " " + NOT + randomLetter2 + ")" + " " + AND + " " + "(" + randomLetter2 + " " + IMP + " " + randomLetter1 + ")"];	
			break;
		case EMPTY:
			if (premiseOrder < 0.5) {
				premise = randomLetter1 + " " + AND + " " + NOT + randomLetter1;
				conclusion = EMPTY;
			} else {
				conclusion = randomLetter1 + " " + AND + " " + NOT + randomLetter1;
				premise = EMPTY;
			}
			conclusionChoices = [conclusion, randomLetter1 + " " + EQUAL + " " + randomLetter2, 
								randomLetter1 + " " + IMP + " " + randomLetter2, randomLetter2 + " " + IMP + " " + randomLetter1];
			premiseChoices = [premise, randomLetter1 + " " + EQUAL + " " + randomLetter2, 
								randomLetter1 + " " + IMP + " " + randomLetter2, randomLetter2 + " " + IMP + " " + randomLetter1];
			break;
	}

	globalconclusion = conclusion;
	globalpremise = premise;
	replacementchoices = scramble(conclusionChoices);
	if (currentSubLevel == 2) {
		replacementchoices = scramble(premiseChoices);
	}
}

fillReplacementLine = function (line) {
	//making an example line to put in the .hoverDiv
	if (line.randomLetters[0] == SQ) {
		var fullName = getFullRuleName(line.randomRule);
		$('.hoverDiv').html('<span class = hoverLabel><strong>' + fullName + '</strong></span><br>' + '<div class = \'problemLine line\' id = line' + line.number + '>' +
							'<div class = conclusionBoxExample id = conclusion' + line.number + '>' + line.conclusion + '</div>:' + 
							'<div class = premiseBoxExample id = premiseA' + line.number + '>' + line.premise + '</div>, ' +  
							'<div class = \'ruleBoxExample lineRule\' id = lineRule' + line.number + '>' + line.randomRule + '</div>').show();
		$('.hoverDiv').html('<span class = hoverLabel><strong>' + fullName + '</strong></span><br>' + 
												'<div class = \'row problemLine line\' id=line' + line.number + '>' +  
													'<div class = \'col-sm-1 col-md-1\'></div>' + 
													'<div class = \'col-sm-4 col-md-4\'><div class = conclusionBoxExample id = conclusion' + line.number + '>' + line.conclusion + '</div>:</div>' +  
													'<div class = \'col-sm-5 col-md-5\'><div class = premiseBoxExample id = premiseA' + line.number + '>' + line.premise + '</div>, </div> ' +   
													'<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class = \'ruleBoxExample lineRule\' id = lineRule' + line.number + '>' + line.randomRule + '</div></div>' + 
												 '</div>').show();
		return;
	}

	//set the html of the div containing the premises, conclusion, and rule block
	var lineDiv = '<div class = \'row problemLine line\' id = line' + line.number + '><div class = \'col-sm-1 col-md-1\'><div class=lineNumberBox>' + line.number + ')</div></div>';
	var premiseAspan = '<div class = \'col-sm-5 col-md-5\'><div class = premiseBox id = premiseA' + line.number + '>' + line.premise + '</div></div> ';
	var conclusionspan = '<div class = \'col-sm-4 col-md-4\'><div class = conclusionBox id = conclusion' + line.number + '>' + line.conclusion + '</div>:</div>';
	var lineRule = '<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class=\'ruleBox lineRule\' id=lineRule' + line.number + '>' + line.randomRule + '</div></div>';
	switch (line.currentSubLevel) {
		//premise sublevel
		case 2:
			if (line.answered) {
				if (line.correct) {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + lineRule);
				} else {
					$('#line').html(lineDiv + conclusionspan + '<div class = \'col-sm-5 col-md-5\'><div class = correctPremise id = correctPremise' + line.number + '>justification</div></div>' + lineRule);
				}
			} else {
				$('#line').html(lineDiv + conclusionspan + '<div class = \'col-sm-5 col-md-5\'><div class = correctPremise id = correctPremise' + line.number + '>justification</div></div>' + lineRule);
			}		
			$('#correctPremise' + line.number).data('answer', line.premise);
			$('#correctPremise' + line.number).data('currentRule', line.randomRule);
			break;
		//conclusion sublevel
		case 1:	
			if (line.answered) {
				if (line.correct) {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + lineRule);
				} else {
					$('#line').html(lineDiv + '<div class = \'col-sm-4 col-md-4\'><div class = correctConclusion id = correctConclusion' + line.number + '>conclusion</div>:</div>' + premiseAspan + lineRule);
				}
			} else {
				$('#line').html(lineDiv + '<div class = \'col-sm-4 col-md-4\'><div class = correctConclusion id = correctConclusion' + line.number + '>conclusion</div>:</div>' + premiseAspan + lineRule);
			}		
			$('#correctConclusion' + line.number).data('answer', line.conclusion);
			$('#correctConclusion' + line.number).data('currentRule', line.randomRule);
			break;
		//rule sublevel
		default:
			if (line.answered) {
				if (line.correct) {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + lineRule);
				} else {
					$('#line').html(lineDiv + conclusionspan + premiseAspan + '<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class = \'correctRule lineRule\' id = correctRule' + line.number + '>rule</div></div>');
				}
			} else {
				$('#line').html(lineDiv + conclusionspan + premiseAspan + '<div class = \'col-sm-1 col-md-1\'><div class=vertical></div><div class = \'correctRule lineRule\' id = correctRule' + line.number + '>rule</div></div>');
			}			
			$('#correctRule' + line.number).data('answer', line.randomRule);
			$('#correctRule' + line.number).data('currentRule', line.randomRule);
	}

	/*$('#conclusion' + line.number).css('font-size', 16);
	$('#premise' + line.number).css('font-size', 16);
	if (line.randomRule == 'Equiv') {
		if (line.conclusion.indexOf('(') != -1)
			$('#conclusion' + line.number).css('font-size', 12);
	}*/
}

AProblemLine.prototype.makeAlgebraicLineParams = function (randomRule, randomLetter1, randomLetter2, randomLetter3, randomLetter4, premiseOrder, currentSubLevel) {
	//choose the premises and conlusion based on the random rule chosen
	var premise = randomLetter1;
	var conclusion = NOT + NOT + randomLetter1;	
	var conclusionChoices = [];
	switch (randomRule) {
		case 'Comm':
			if (premiseOrder < 0.25) {
				premise = randomLetter1 + " " + OR + " " + randomLetter2;
				conclusion = randomLetter2 + " " + OR + " " + randomLetter1;
				conclusionChoices = [conclusion, randomLetter1 + " " + AND + " " + randomLetter2,
									randomLetter2 + " " + AND + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + OR + " " + "(" + randomLetter2 + ")"];
				premiseChoices = [premise, randomLetter1 + " " + AND + " " + randomLetter2,
									randomLetter2 + " " + AND + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + OR + " " + "(" + randomLetter2 + ")"];
			} else if (premiseOrder < 0.5 ){
				premise = randomLetter2 + " " + OR + " " + randomLetter1;
				conclusion = randomLetter1 + " " + OR + " " + randomLetter2;
				conclusionChoices = [conclusion, randomLetter1 + " " + AND + " " + randomLetter2,
									randomLetter2 + " " + AND + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + OR + " " + "(" + randomLetter2 + ")"];
				premiseChoices = [premise, randomLetter1 + " " + AND + " " + randomLetter2,
									randomLetter2 + " " + AND + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + OR + " " + "(" + randomLetter2 + ")"];
			} else if (premiseOrder < 0.75) {
				premise = randomLetter1 + " " + AND + " " + randomLetter2;
				conclusion = randomLetter2 + " " + AND + " " + randomLetter1;
				conclusionChoices = [conclusion, randomLetter1 + " " + OR + " " + randomLetter2,
									randomLetter2 + " " + OR + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + AND + " " + "(" + randomLetter2 + ")"];
				premiseChoices = [premise, randomLetter1 + " " + OR + " " + randomLetter2,
									randomLetter2 + " " + OR + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + AND + " " + "(" + randomLetter2 + ")"];
			} else {
				premise = randomLetter2 + " " + AND + " " + randomLetter1;
				conclusion = randomLetter1 + " " + AND + " " + randomLetter2;
				conclusionChoices = [conclusion, randomLetter1 + " " + OR + " " + randomLetter2,
									randomLetter2 + " " + OR + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + AND + " " + "(" + randomLetter2 + ")"];
				premiseChoices = [premise, randomLetter1 + " " + OR + " " + randomLetter2,
									randomLetter2 + " " + OR + " " + randomLetter1, "(" + randomLetter1 + ")" + " " + AND + " " + "(" + randomLetter2 + ")"];
			}	
			break;
		case 'Assoc':
			if (premiseOrder < 0.25) {
				premise = randomLetter1 + " " + OR + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")";
				conclusion = "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + OR + " " + randomLetter3;
				conclusionChoices = [conclusion, 
									randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3,
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + OR + " " + randomLetter2 + ") " + OR + " " + randomLetter1];
				premiseChoices = [premise, 
									randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3,
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + OR + " " + randomLetter2 + ") " + OR + " " + randomLetter1];
			} else if (premiseOrder < 0.5) {
				premise = "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + OR + " " + randomLetter3;
				conclusion = randomLetter1 + " " + OR + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")";
				conclusionChoices = [conclusion, 
									randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3,
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + OR + " " + randomLetter2 + ") " + OR + " " + randomLetter1];
				premiseChoices = [premise, 
									randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3,
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + OR + " " + randomLetter2 + ") " + OR + " " + randomLetter1];
			} else if (premiseOrder < 0.75) {
				premise = randomLetter1 + " " + AND + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")";
				conclusion = "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + AND + " " + randomLetter3;
				conclusionChoices = [conclusion, 
									randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3,
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + AND + " " + randomLetter2 + ") " + AND + " " + randomLetter1];
				premiseChoices = [premise, 
									randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3,
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + AND + " " + randomLetter2 + ") " + AND + " " + randomLetter1];
			} else {
				conclusion = randomLetter1 + " " + AND + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")";
				premise = "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + AND + " " + randomLetter3;
				conclusionChoices = [conclusion, 
									randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3,
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + AND + " " + randomLetter2 + ") " + AND + " " + randomLetter1];
				premiseChoices = [premise, 
									randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3,
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter3 + " " + AND + " " + randomLetter2 + ") " + AND + " " + randomLetter1];
			}		
			break;
		case 'Dist':
			if (premiseOrder < 0.25) {
				premise = randomLetter1 + " " + AND + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")";
				conclusion = "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + OR + " (" + randomLetter1 + " " + AND + " " + randomLetter3 + ")";
				conclusionChoices = [conclusion,
									randomLetter1 + " " + OR + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + AND + " (" + randomLetter1 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + ") " + AND + " " + randomLetter3];
				premiseChoices = [premise,
									randomLetter1 + " " + OR + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + AND + " (" + randomLetter1 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + ") " + AND + " " + randomLetter3];
			} else if (premiseOrder < 0.5) {
				premise = "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + OR + " (" + randomLetter1 + " " + AND + " " + randomLetter3 + ")";
				conclusion = randomLetter1 + " " + AND + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")";
				conclusionChoices = [conclusion,
									randomLetter1 + " " + OR + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + AND + " (" + randomLetter1 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + ") " + AND + " " + randomLetter3];
				premiseChoices = [premise,
									randomLetter1 + " " + OR + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + AND + " (" + randomLetter1 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + OR + " " + randomLetter2 + " " + ") " + AND + " " + randomLetter3];
			} else if (premiseOrder < 0.75) {
				premise = randomLetter1 + " " + OR + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")";
				conclusion = "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + AND + " (" + randomLetter1 + " " + OR + " " + randomLetter3 + ")";
				conclusionChoices = [conclusion,
									randomLetter1 + " " + AND + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + OR + " (" + randomLetter1 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + ") " + OR + randomLetter3];
				premiseChoices = [premise,
									randomLetter1 + " " + AND + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + OR + " (" + randomLetter1 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + ") " + OR + randomLetter3];
			} else {
				premise = "(" + randomLetter1 + " " + OR + " " + randomLetter2 + ") " + AND + " (" + randomLetter1 + " " + OR + " " + randomLetter3 + ")";
				conclusion = randomLetter1 + " " + OR + " (" + randomLetter2 + " " + AND + " " + randomLetter3 + ")";
				conclusionChoices = [conclusion,
									randomLetter1 + " " + AND + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + OR + " (" + randomLetter1 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + ") " + OR + randomLetter3];
				premiseChoices = [premise,
									randomLetter1 + " " + AND + " (" + randomLetter2 + " " + OR + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + OR + " (" + randomLetter1 + " " + AND + " " + randomLetter3 + ")",
									"(" + randomLetter1 + " " + AND + " " + randomLetter2 + " " + ") " + OR + randomLetter3];
			}	
			break;
		case 'Abs':
			if (premiseOrder < 0.5) {
				premise = randomLetter1 + " " + IMP + " " + randomLetter2;
				conclusion = randomLetter1 + " " + IMP + " (" + randomLetter1 + " " + AND + " " + randomLetter2 + ")";

			} else {
				premise = randomLetter1 + " " + IMP + " (" + randomLetter1 + " " + AND + " " + randomLetter2 + ")";
				conclusion = randomLetter1 + " " + IMP + " " + randomLetter2;
			}	
			conclusionChoices = [conclusion,
								randomLetter1 + " " + IMP + " (" + randomLetter1 + " " + OR + " " + randomLetter2 + ")",
								randomLetter2 + " " + IMP + " " + randomLetter1,
								randomLetter2 + " " + IMP + " (" + randomLetter1 + " " + AND + " " + randomLetter2 + ")"];	
			premiseChoices = [premise,
								randomLetter1 + " " + IMP + " (" + randomLetter1 + " " + OR + " " + randomLetter2 + ")",
								randomLetter2 + " " + IMP + " " + randomLetter1,
								randomLetter2 + " " + IMP + " (" + randomLetter1 + " " + AND + " " + randomLetter2 + ")"];				
			break;
		case 'Exp':
			if (premiseOrder < 0.5) {
				premise = "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + IMP + " " + randomLetter3;
				conclusion = randomLetter1 + " " + IMP + " (" + randomLetter2 + " " + IMP + " " + randomLetter3 + ")";
			} else {
				premise = randomLetter1 + " " + IMP + " (" + randomLetter2 + " " + IMP + " " + randomLetter3 + ")";
				conclusion = "(" + randomLetter1 + " " + AND + " " + randomLetter2 + ") " + IMP + " " + randomLetter3;
			}
			conclusionChoices = [conclusion,
								randomLetter3 + " " + IMP + " (" + randomLetter1 + " " + IMP + " " + randomLetter2 + ")",
								randomLetter2 + " " + IMP + " " + randomLetter1,
								randomLetter3 + " " + IMP + " " + randomLetter2];
			premiseChoices = [premise,
								randomLetter3 + " " + IMP + " (" + randomLetter1 + " " + IMP + " " + randomLetter2 + ")",
								randomLetter2 + " " + IMP + " " + randomLetter1,
								randomLetter3 + " " + IMP + " " + randomLetter2];
			break;
		case 'Taut':
			if (premiseOrder < 0.25) {
				premise = randomLetter1;
				conclusion = randomLetter1 + " " + OR + " " + randomLetter1;
			} else if (premiseOrder < 0.5) {
				premise = randomLetter1 + " " + OR + " " + randomLetter1;
				conclusion = randomLetter1;
			} else if (premiseOrder < 0.75) {
				premise = randomLetter1;
				conclusion = randomLetter1 + " " + AND + " " + randomLetter1;			
			} else {
				premise = randomLetter1 + " " + AND + " " + randomLetter1;
				conclusion = randomLetter1;
			}
			conclusionChoices = [conclusion,
								randomLetter1 + " " + IMP + " " + randomLetter1,
								randomLetter1 + " " + OR + " " + NOT + randomLetter1,
								randomLetter1 + " " + AND + " " + NOT + randomLetter1];
			premiseChoices = [premise,
								randomLetter1 + " " + IMP + " " + randomLetter1,
								randomLetter1 + " " + OR + " " + NOT + randomLetter1,
								randomLetter1 + " " + AND + " " + NOT + randomLetter1];		
			break;
		
	}
	
	globalconclusion = conclusion;
	globalpremise = premise;
	algebraicchoices = scramble(conclusionChoices);
	if (currentSubLevel == 2) {
		algebraicchoices = scramble(premiseChoices);
	}
}

fillAlgebraicLine = function (line) {
	//making an example line to put in the .hoverDiv
	if (line.randomLetters[0] == SQ) {
		var fullName = getFullRuleName(line.randomRule);
		$('.hoverDiv').html('<span class = hoverLabel><strong>' + fullName + '</strong></span><br>' + '<div class = \'problemLine line\' id = line' + line.number + '>' +
							'<div class = conclusionBoxExample id = conclusion' + line.number + '>' + line.conclusion + '</div>:' + 
							'<div class = premiseBoxExample id = premiseA' + line.number + '>' + line.premise + '</div>, ' +  
							'<div class = \'ruleBoxExample lineRule\' id = lineRule' + line.number + '>' + line.randomRule + '</div>').show();
		return;
	}

	//set the html of the div containing the premises, conclusion, and rule block
	var lineDiv = '<div class = \'problemLine line\' id = line' + line.number + '><div class = lineNumberBox>' + line.number + ')</div>';
	//var box = '<div class = correctRule id = correctRule' + line.number + '>        </div>';
	var box = '<div class = correctPremise id = correctPremise' + line.number + '>justification</div>';
	var premiseAspan = '<div class = premiseBox id = premiseA' + line.number + '>' + line.premise + '</div>,';
	var conclusionspan = '<div class = conclusionBox id = conclusion' + line.number + '>' + line.conclusion + '</div>:';
	var lineRule = '<div class = \'ruleBox lineRule\' id = lineRule' + line.number + '>' + line.randomRule + '</div>';
	switch (line.currentSubLevel) {
		//premise sublevel
		case 2:
			$('#line').html(lineDiv  + conclusionspan + box + '<div class = vertical></div>' + lineRule);
			$('#correctPremise' + line.number).data('answer', line.premise);
			$('#correctPremise' + line.number).data('currentRule', line.randomRule);
			break;
		//conclusion sublevel
		case 1:
			$('#line').html('<div class = \'problemLine line\' id = line' + line.number + '>'+
							'<div class = lineNumberBox>' + line.number + ')</div>'+
							'<div class = correctConclusion id = correctConclusion' + line.number + '>conclusion</div>: ' + 
							'<div class = premiseBox id = premiseA' + line.number + '>' + line.premise + '</div> ' + 
							'<div class = vertical></div>'+
							'<div class = \'ruleBox lineRule\' id = lineRule' + line.number + '>' + line.randomRule + '</div>');
			$('#correctConclusion' + line.number).data('answer', line.conclusion);
			$('#correctConclusion' + line.number).data('currentRule', line.randomRule);
			break;
		//rule sublevel
		default:
			$('#line').html('<div class = \'problemLine line\' id = line' + line.number + '>'+
							'<div class = lineNumberBox>' + line.number + ')</div>'+
							'<div class = conclusionBox id = conclusion' + line.number + '>' + line.conclusion + '</div>: ' + 
							'<div class = premiseBox id = premiseA' + line.number + '>' + line.premise + '</div>' + 
							'<div class = vertical></div>'+
							'<div class = correctRule id = correctRule' + line.number + '>rule</div>');
			$('#correctRule' + line.number).data('answer', line.randomRule);
			$('#correctRule' + line.number).data('currentRule', line.randomRule);
	}
}

//returns a random permutation of the given array (used to select random rules and scramble the premise/conclusion choices when making lines)
scramble = function (array) {
	var scrambled = [];
	var stop = array.length;
	for (var i = 0; i < stop; i++) {
		var random = Math.floor(Math.random() * array.length);
		scrambled[i] = array[random];
		array.splice(random, 1);
	}
	return scrambled;
}

getFullRuleName = function (rule) {
	switch (rule) {
		case 'MP':
			return 'Modus Ponens';
		case 'MT':
			return 'Modus Tollens';
		case 'DS':
			return 'Disjunctive Syllogism';
		case 'ADD':
			return 'Addition';
		case 'SIMP':
			return 'Simplification';
		case 'CONJ':
			return 'Conjunction';
		case 'HS':
			return 'Hypothetical Syllogism';
		case 'CD':
			return 'Constructive Dilemma';
		case 'DN':
			return 'Double Negation';
		case 'DeM':
			return 'DeMorgan\'s Law';
		case 'Impl':
			return 'Implication';
		case 'CP':
			return 'Contrapositive';
		case 'Equiv':
			return 'Equivalence';
		case 'Comm':
			return 'Commutative Law';
		case 'Assoc':
			return 'Associative Law';
		case 'Dist':
			return 'Distributive Law';
		case 'Abs':
			return 'Absorption';
		case 'Exp':
			return 'Exportation';
		case 'Taut':
			return 'Tautology';
	}
}