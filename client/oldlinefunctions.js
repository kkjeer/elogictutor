//appends a line excluding only the rule
function appendProblemLineExcludingRule (line) {
	//append the div containing the entire line, the line number, the conclusion, and the first premise
	$('#tdLinePartial').append('<div class = \'problemLine unjustified\' id = problemLine' + lastLineAddedPartial + '><div class = lineNumberBox id = lineNumber' + lastLineAddedPartial + '>' + lastLineAddedPartial + 
		')</div><div class = conclusionBox id = derived' + lastLineAddedPartial + '>' + line.derived + 
		'</div><div class = colonDiv>:</div><div class = premiseBox id = premise' + lastLineAddedPartial + '0>' + line.premises[0] + '</div>');

	//append the second premise if necessary
	if (line.premises.length == 2) {
		$('#problemLine' + lastLineAddedPartial).append('<div class = inlineDiv>,</div><div class = premiseBox2 id = premise' + lastLineAddedPartial + '1>' + line.premises[1] + '</div>');
	}

	//append a vertical line before the rule
	$('#problemLine' + lastLineAddedPartial).append('<div class = vertical></div>');

	//append the droppable/tap-able rule box to accept a bordered rule from the #tdRules div
	$('<div class = correctRule id = correctRule' + lastLineAddedPartial + '>rule</div>').data('answer', line.rule).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		var correctRule = document.getElementById('correctRule' + lastLineAddedPartial);
		//var hammer = Hammer(correctRule).on('tap', function(event) {
		$('#correctRule' + lastLineAddedPartial).click(function (event) {
			var target = event.target;
			var targetid = target.id;
			handleAnswer(targetid);
		});
	} else {
		$('#correctRule' + lastLineAddedPartial).droppable({
		accept: '.bordered',	
		drop: handleProblemDrop
	});
	}

	//close the containing div and increment lastLineAddedPartial
	$('#tdLinePartial').append('</div>');
	lastLineAddedPartial++;
	changeColors(colorSchemes[colorIndex]);
	$('#ruleInstructionsPartial').html('Drag a ' + colorSchemes[colorIndex].rulecolorname + ' rule into the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete the line.<br><br>Double-click a rule<br>to see an example. Double-click the example to remove it.');
	
}

//appends a line excluding only one premise
function appendProblemLineExcludingPremise (line) {
	//append the div containing the entire line, the line number, and the conclusion
	$('#tdLinePartial').append('<div class = \'problemLine unjustified\' id = problemLine' + lastLineAddedPartial + '><div class = lineNumberBox>' + lastLineAddedPartial + 
		')</div><div class = conclusionBox id = derived' + lastLineAddedPartial + '>' + line.derived + '</div><div class = colonDiv>:</div>');

	//if there is only one premise, append it as a droppable box
	if (line.premises.length == 1) {
		$('<div class = correctPremise id = correctPremise' + lastLineAddedPartial + '>justification</div>').data('answer', line.premises[0]).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			var correctPremise = document.getElementById('correctPremise' + lastLineAddedPartial);
			//var hammer = Hammer(correctPremise).on('tap', function(event) {
			$('#correctPremise' + lastLineAddedPartial).click(function (event) {
				var target = event.target;
				var targetid = target.id;
				handleAnswer(targetid);
		});
		} else {
			$('#correctPremise' + lastLineAddedPartial).draggable({
				accept: '.draggable',
				drop: handleProblemDrop
			});
		}
	} else if (line.premises.length == 2) {
		//append the first premise
		$('#problemLine' + lastLineAddedPartial).append('<div class = premiseBox>' + line.premises[0] + '</div><div class = inlineDiv>,</div>');

		//append the second premise as a droppable box
		$('<div class = correctPremise2 id = correctPremise' + lastLineAddedPartial + '>justification</div>').data('answer', line.premises[1]).data('number', lastLineAddedPartial).data('derived', line.derived).appendTo('#problemLine' + lastLineAddedPartial);
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			var correctPremise2 = document.getElementById('correctPremise' + lastLineAddedPartial);
			//var hammer = Hammer(correctPremise2).on('tap', function(event) {
			$('#correctPremise2' + lastLineAddedPartial).click(function (event){
				var target = event.target;
				var targetid = target.id;
				handleAnswer(targetid);
		});
		} else {
			$('#correctPremise' + lastLineAddedPartial).draggable({
				accept: '.draggable',
				drop: handleProblemDrop
			});
		}
	}

	//append the rule with a vertical bar before it
	$('#problemLine' + lastLineAddedPartial).append('<div class = vertical></div><div class = ruleBox>' + line.rule + '</div>');

	//close the div and increment lastLineAddedPartial
	$('#tdLinePartial').append('</div>');
	lastLineAddedPartial++;
	changeColors(colorSchemes[colorIndex]);
	$('#ruleInstructionsPartial').html('Drag a ' + colorSchemes[colorIndex].dragcolorname + ' justification into the ' + colorSchemes[colorIndex].dropcolorname + ' box to complete the line.');
}