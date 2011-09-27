$(function() {

	$( "#targetContainer" ).sortable({
		helper: 'clone',
		revert: true
	}).disableSelection();

	$( "#sourceElements" ).find('li').draggable({
		helper: 'clone',
		connectToSortable: "#targetContainer"
	});

	new PS1Gen(
		$( "#targetContainer" ),
		$( "#wysiwyg" ),
		null
	);

});


var PS1Gen = function(targetArea, wysiwygContainer, sourceContainer) {
	var self = this;

	// The container where elements are dragged to.
	this.targetArea = targetArea;

	// The container where the WYSIWYG view of the current PS1
	// configuration is rendered to.
	this.wysiwygContainer = wysiwygContainer;

	// The container element where the bash source code for the
	// current PS1 configuration is written to.
	this.sourceContainer = sourceContainer;

	// Holds the current tput color value during rendering.
	this.color = null;

	this.targetArea.bind("sortchange", function() { self.regenerate(); });
	this.targetArea.bind("sortupdate", function() { self.regenerate(); });
	this.targetArea.find('select').live('change', function() { self.regenerate(); });
	this.targetArea.find('input').live('keyup', function() { self.regenerate(); });

	this.reset();
};

PS1Gen.prototype = {

	/*
	 * Reset to a clean state for re-rendering
	 */
	reset: function() {
		this.resetStyle();
		this.wysiwygContainer.children().remove();
	},

	resetStyle: function() {
		this.color = 7;
	},


	/*
	 * Re-generate the WYSIWYG window and the source code
	 * view after a target area change.
	 */
	regenerate: function() {
		var self = this;

		this.reset();

		this.targetArea.children().each(function() {
			self.renderElement(this);
		});

	},


	/*
	 * Render the given element to the target area.
	 */
	renderElement: function(element) {
		var element = $(element);

		if($.trim(element.text()).length === 0) {
			return;
		}

		var content;

		if(element.hasClass('textElement')) {
			content = this.renderTextElement(element);
		} else if(element.hasClass('colorElement')) {
			content = this.renderColorElement(element);
		} else if(element.hasClass('resetElement')) {
			this.resetStyle();
		} else {
			throw "Unexpected element dropped into target area in #renderElement()";
		}

		this.wysiwygContainer.append(content);
	},


	/*
	 * Map the tput colors to RGB values recognized by CSS
	 */
	tputColorToRGB: function(colorCode) {
		var colors = {
			0: "black",
			1: "red",
			2: "green",
			3: "yellow",
			4: "blue",
			5: "magenta",
			6: "cyan",
			7: "white"
		};

		return colors[colorCode];
	},


	/*
	 * Replace common bash placeholders with sample values so that they
	 * are displayed nicely in the WYSIWYG view.
	 */
	replaceBashKeywords: function(text) {
		text = text.replace(/\\a/g, "");
		text = text.replace(/\\u/g, "user");
		text = text.replace(/\\h/g, "host");
		text = text.replace(/\\H/g, "host.name");
		text = text.replace(/\\j/g, "2");
		text = text.replace(/\\n/g, "<br>");
		text = text.replace(/\\r/g, "");
		text = text.replace(/\\s/g, "bash");
		text = text.replace(/\\t/g, "HH:MM:SS");
		text = text.replace(/\\T/g, "HH:MM:SS");
		text = text.replace(/\\@/g, "am");
		text = text.replace(/\\v/g, "2.00");
		text = text.replace(/\\V/g, "2.00.0");
		text = text.replace(/\\w/g, "/home/user");
		text = text.replace(/\\W/g, "~");
		text = text.replace(/\\!/g, "0");
		text = text.replace(/\\#/g, "0");
		text = text.replace(/\\\$/g, "$");
		text = text.replace(/\\\\/g, "\\");
		text = text.replace(/\\[.+?\\]/g, "");
		return text;
	},


	/***************************************
	*
	*	Render methods for all elements
	*
	***************************************/

	renderTextElement: function(element) {
		var text =  element.find('input').val();
		text = this.replaceBashKeywords(text);

		var obj = $('<code>' + text + '</code>');
		obj.css('color', this.tputColorToRGB(this.color));

		return obj;
	},


	renderColorElement: function(element) {
		this.color = parseInt(element.find('select').val());
	}



};

