dojo.provide("SortWidget.lib.sortable");

$(function() {
    //var x = $( "[id^='SortWidget_SortWidget']" );
    var x = jQuery(".SortWidget_sortable");
    x.sortable({
        placeholder: "ui-state-highlight"
    });
    x.disableSelection();
});