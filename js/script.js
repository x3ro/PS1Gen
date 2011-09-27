$(function() {

	$("#source, #target").accordion({ header: "h3" });

	$( "#targetContainer" ).sortable({
		helper: 'clone',
		revert: true
	}).disableSelection();

	$( "#sourceElements" ).find('li').draggable({
		helper: 'clone',
		connectToSortable: "#targetContainer"
	});

});