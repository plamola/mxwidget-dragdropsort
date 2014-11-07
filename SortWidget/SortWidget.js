/**
 Sort Widget
 ========================

 @file      : SortWidget.js
 @version   : 0.1
 @author    : Matthijs Dekker
 @date      : 10-01-2013
 @copyright : Trivento
 @license   : Please contact our sales department.

 Documentation
 =============
 This widget can be used to sort items using drag&drop
 The entity to sort must have a integer attribute for the sortorder and a string attribute for display purposes
 The integer attribute will be updated.


 Open Issues
 ===========


 */
//{
    // "use strict";

dojo.provide("SortWidget.SortWidget");
mendix.dom.insertCss(mx.moduleUrl('SortWidget') + "ui/SortWidget.css");


mendix.widget.declare('SortWidget.SortWidget', {
    //DECLARATION
    addons:[dijit._Templated],
    inputargs:{
        entity:'',
        sortAttribute:'',
        displayAttribute:'',
        XPath:'',
        emptyCaption:''
    },

    // Global variables
    sortId:'',
    mySortAttribute:'',


    templatePath:dojo.moduleUrl('SortWidget') + "templates/SortWidget.html",

    postCreate:function () {

        if (typeof(jQuery) == "undefined") {
            dojo.require("SortWidget.lib.jquery");
            dojo.require("SortWidget.lib.jquery-ui");
        }
        dojo.require("SortWidget.lib.sortable");
        this.startmywidget();
        this.actRendered();
    },

    startmywidget:function () {
        this.sortId = this.id + "_ul";
        this.mySortAttribute = this.sortAttribute;

        var xpath = "//" + this.entity+ this.XPath;
        mx.data.get({
            xpath:xpath,
            filter:{
                sort:[
                    [this.sortAttribute, "Asc"]
                ],
                attributes:[this.sortAttribute , this.displayAttribute],
                depth:0
            },
            callback:dojo.hitch(this, this.renderContent),
            error:dojo.hitch(this, function (err) {
                console.log("Unable to retrieve data for xpath '" + xpath + "': " + err);
                this.setMessage(this.divNode.id, 'Error retrieving data','widgetCriticalError');
            })
        });

    },

    setMessage:function (widgetId,message, clazz) {
        var span = mendix.dom.span(message);
        mendix.dom.addClass(span, clazz);
        var div = jQuery("#"+widgetId)[0];
        dojo.empty(div);
        div.appendChild(span);
    },


    renderContent:function (objArray) {
        dojo.empty(this.outputNode);

        this.outputNode.setAttribute("id", this.sortId);
        this.outputNode.setAttribute("sortAttribute", this.sortAttribute);


        for (var i = 0; i < objArray.length; i++) {

            var object = objArray[i];
            var displayAttribute = object.getAttribute(this.displayAttribute);

            var li = mendix.dom.li('');
            mendix.dom.addClass(li, "sortWidget_item");
            li.setAttribute("id", "sortWidgetItem_" + object.getGUID());

            var span = mendix.dom.span('');
            mendix.dom.addClass(span, "sortWidget_icon");
            li.appendChild(span);

            var text = document.createTextNode(displayAttribute);
            li.appendChild(text);

            this.outputNode.appendChild(li);
        }

        if (objArray.length == 0) {
            this.setMessage(this.divNode.id, this.emptyCaption, 'widgetNoData');
            console.log('SortWdiget: ' + this.id + ' is empty');
        } else {
            this.addSortHandler();
        }
    },

    addSortHandler:function () {

        jQuery("#" + this.sortId).on("sortstop", function (event, ui) {

            var parentId = event.target.getAttribute('id');
            var sortAttribute = event.target.getAttribute('sortAttribute');

            var children = jQuery("#" + parentId + " > li");
            var guids = [];
            for (var i = 0; i < children.length; i++) {
                guids[i] = children[i].getAttribute("id").split('_')[1];
            }

            // update on server
            mx.data.get({
                guids:guids,
                callback:dojo.hitch(this, updateOnServer),
                error:dojo.hitch(this, function (err) {
                    console.log("Unable to retrieve data: " + err);
                })
            });
            function updateOnServer(objArray) {
                var widgetId = this.id.replace('_ul', '');
                for (var x = 0; x < guids.length; x++) {
                    for (var j = 0; j < objArray.length; j++) {
                        var mxobject = objArray[j];

                        if (guids[x] == mxobject.getGUID()) {
                            if (parseInt(mxobject.getAttribute(sortAttribute)) != (x + 1)) {
                                console.log(widgetId + ': Move ' + +mxobject.getAttribute(sortAttribute) + ' -> ' + (x + 1));
                                mxobject.set(sortAttribute, x + 1);
                                mxobject.commit({
                                    callback:function () {
                                        //just commit ...
                                    },
                                    error:dojo.hitch(this, function (err) {
                                        console.error(widgetId + ": Commit on server failed: " + err);
                                        //this.setMessage(widgetId, 'Update in database failed; widget disabled','widgetCriticalError');

                                        var div = jQuery("#"+widgetId)[0];
                                        var span = mendix.dom.span('Update in database failed; widget disabled');
                                        mendix.dom.addClass(span, 'widgetCriticalError');
                                        dojo.empty(div);
                                        div.appendChild(span);
                                    })
                                });
                            }
                            break;
                        }
                    }
                }
            }
        });
    },


    uninitialize:function () {
    }
});
//}