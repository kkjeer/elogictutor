/*GLOBAL (JavaScript) CONSTANTS*/
var AND = "\u2227";					//Character code for ∧
var OR = "\u2228";					//Character code for ∨
var NOT = "\xAC";					//Character code for ¬
var IMP = "\u2192";					//Character code for → (represented by % on server and in php)
var UP = "↑";                       //Character code for ↑ used in working backwards button
var EQUAL = "\u2194";               //Character code for ↔

var PLUS = "\u002B";
var MULT = "\u002a";

/*function JTProblem (fileName) {
	//JTProblem variables
	this.givens = [];
	this.steps = [];
	this.conclusion;
	this.message = '';

	//get the location of the specified file
	var url = document.URL;
    url = url.substring(0,url.indexOf("JT-PartialProblem-index.php"));
    //console.log('url: ' + url);
    var file = url + 'course/' + fileName;
    //console.log('file: ' + file);

    //open the file
    var txtFile = new XMLHttpRequest();
    txtFile.open("GET", file, false);
    txtFile.send();

    //read the contents of the file and use them to set up the JTProblem variables
    if (txtFile.readyState === 4) { //Make sure the document is ready to parse
    	if (txtFile.status === 200) { //Make sure the file was found
    		//all the text in the file
    		var allText = txtFile.responseText;

    		//splits all the text line-by-line
    		var lines = txtFile.responseText.split("\n");
    		//console.log('lines: ' + lines);

    		//handle each line
    		for (var i in lines) {
    			//split each line by space to get the elements of the line
    			var line = lines[i].split(" ");

    			//parse each line element from mathematical symbols to logical symbols
    			for (var j in line) {
    				line[j] = parseElement(line[j]);
    			}
    			//console.log('line: ' + line);

    			//handle the line based on its type (Problem, Given, or Line)
    			if (line[0] == 'Problem:') {
    				this.message = line[line.length - 1];
    				this.conclusion = line[1];
    			} else if (line[0] == 'Given:') {
    				this.givens.push(new GivenLine(line[1]));
    			} else if (line[0] == 'Line:') {
    				//one justification
    				if (line.length == 4) {
    					this.steps.push(new Line(line[1], [line[2]], line[3]));
    				} 
    				//two justifications
    				else if (line.length == 5) {
    					this.steps.push(new Line(line[1], [line[2], line[3]], line[4]));
    				}
    			}
    		}
    	}
    }
}*/

/*********************Meteor can't read in files***************************/

/*AProblem = function (fileName) {
    //console.log('making JTProblem');
    //JTProblem variables
    this.givens = [];
    this.steps = [];
    this.conclusion;
    this.message = '';

    //get the location of the specified file
    var url = document.URL;
    url = url.substring(0,url.indexOf("Meteor-JT-PartialProblem.js"));
    console.log('url: ' + url);
    var file = url + 'course/' + fileName;
    console.log('file: ' + file);

    //open the file
    var txtFile = new XMLHttpRequest();
    txtFile.open("GET", file, false);
    txtFile.send();

    //read the contents of the file and use them to set up the JTProblem variables
    if (txtFile.readyState === 4) { //Make sure the document is ready to parse
        if (txtFile.status === 200) { //Make sure the file was found
            //all the text in the file
            var allText = txtFile.responseText;
            console.log('allText: ' + allText);
            var json = JSON.parse(allText);
            //console.log('json: ' + json);
            //console.log('json.Conclusion: ' + json.Conclusion);
            this.conclusion = parseElement(json.Conclusion);
            for (var g in json.Givens) {
                this.givens.push(new GivenLine(parseElement(json.Givens[g])));
            }
            for (var l in json.Lines) {
                var derived = parseElement(json.Lines[l].Derived);
                var justifications = json.Lines[l].Justifications;
                for (var j in justifications) {
                    justifications[j] = parseElement(justifications[j]);
                }
                var linerule = json.Lines[l].Rule;
                var exclude = json.Lines[l].Exclude;
                var ishidden = json.Lines[l].isHidden;
                //console.log('derived: ' + derived + ' justifications: ' + justifications + ' linerule: ' + linerule + ' exclude: ' + exclude + ' ishidden: ' + ishidden);
                var line = new Line(derived, justifications, linerule, exclude, ishidden);
                line.exclude = exclude;
                line.ishidden = ishidden;
                //console.log('line.derived: ' + line.derived + ' line.premises: ' + line.premises + ' line.rule: ' + line.rule + ' line.exclude: ' + line.exclude + ' line.ishidden: ' + line.ishidden);
                this.steps.push(line);
            }
        }
    }
}*/

/*********************Had to switch back to hardcoded problems since Meteor apparently can't read files 
                        (it found the correct JSON file but thinks the contents are some strange HTML file)*********************/

AProblem = function () {
    var conclusion0 = parseElement('S>T');
    var givens0 = [new GivenLine(parseElement('-(P+R)')), new GivenLine(parseElement('-R>(-S+Q)')), new GivenLine(parseElement('Q>T'))];
    var steps0 = [new Line(parseElement("-P*-R"), [parseElement("-(P+R)")], "DeM", "allbutderived", false),
                  new Line(parseElement("-R"), [parseElement("-P*-R")], "SIMP", "allbutderived", false),
                  new Line(parseElement("-S+Q"), [parseElement("-R>(-S+Q)"), parseElement("-R")], "MP", "allbutderived", false),
                  new Line(parseElement("S>Q"), [parseElement("-S+Q")], "Impl", "allbutderived", true),
                  new Line(parseElement("S>T"), [parseElement("S>Q"), parseElement("Q>T")], "HS", "allbutderived", true)];

   var conclusion1 = parseElement('Q');
   var givens1 = [new GivenLine(parseElement('P>(Q*T)')), new GivenLine(parseElement('P+R')), new GivenLine(parseElement('-R'))];
   var steps1 = [new Line(parseElement("P"), [parseElement("-R"), parseElement("P+R")], "DS", "allbutderived", false),
                  new Line(parseElement("Q*T"), [parseElement("P>(Q*T)"), parseElement("P")], "MP", "allbutderived", true),
                  new Line(parseElement("Q"), [parseElement("Q*T")], "SIMP", "allbutderived", true)]; 

   var conclusion2 = parseElement('-(A+C)');
   var givens2 = [new GivenLine(parseElement('A>B')), new GivenLine(parseElement('-(B+C)'))];
   var steps2 = [new Line(parseElement("-B*-C"), [parseElement("-(B+C)")], "DeM", "allbutderived", false),
                  new Line(parseElement("-B"), [parseElement("-B*-C")], "SIMP", "allbutderived", false),
                  new Line(parseElement("-A"), [parseElement("-B"), parseElement("A>B")], "MT", "allbutderived", true),
                  new Line(parseElement("-C"), [parseElement("-B*-C")], "SIMP", "allbutderived", true),
                  new Line(parseElement("-A*-C"), [parseElement("-A"), parseElement("-C")], "CONJ", "allbutderived", true),
                  new Line(parseElement("-(A+C)"), [parseElement("-A*-C")], "DeM", "allbutderived", true)];

    this.problems = [new Problem(conclusion0, givens0, steps0), new Problem(conclusion1, givens1, steps1), new Problem(conclusion2, givens2, steps2)];
}

//parses a line element by replacing the mathematical symbols entered in the file (-, +, etc.) with logical symbols(NOT, OR, etc.);
function parseElement (element) {
	var parsed = '';
	parsed = element.replace(/-/g, NOT);
	parsed = parsed.replace(/\+/g, ' ' + OR + ' ');
	parsed = parsed.replace(/\*/g, ' ' + AND + ' ');
	parsed = parsed.replace(/>/g, ' ' + IMP + ' ');
	parsed = parsed.replace(/=/g, ' ' + EQUAL + ' ');
	return parsed;
}

function Problem (conclusion, givens, steps) {
    this.conclusion = conclusion;
    this.givens = givens;
    this.steps = steps;
}

//currently used constructor
function Line (derived, premises, rule, exclude, ishidden) {
    this.derived = derived; 
    this.premises = premises; 
    this.rule = rule;

    //these variables are not being set in the constructor - need to explicitly set them after creating a new Line 
    this.exclude = exclude; 
    this.ishidden = ishidden;

    //these variables are also not being set in the constructor - need to explicitly set them in JTPartialProblem
    this.droppedpremises = [];
    this.premisesdropped = 0; //the number of correct premises that have been dropped onto the line
    this.ruledropped = false; //whether the correct rule has been dropped onto the line
    this.justified = false;
}

//creates a new GivenLine object
function GivenLine (derived) {
	this.derived = derived;
	this.premises = [];
	this.rule = 'Given';
}