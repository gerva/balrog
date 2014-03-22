// These two functions use the example code from DataTables found here:
// http://datatables.net/examples/plug-ins/dom_sort.html
//
/* Create an array with the values of all the input boxes in a column */
$.fn.dataTableExt.afnSortData['dom-text'] = function  ( oSettings, iColumn )
{
        var aData = [];
            $( 'td:eq('+iColumn+') input', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
                        aData.push( this.value );
                            } );
                return aData;
};

/* Create an array with the values of all the select options in a column */
$.fn.dataTableExt.afnSortData['dom-select'] = function  ( oSettings, iColumn )
{
        var aData = [];
            $( 'td:eq('+iColumn+') select', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
                        aData.push( $(this).val() );
                            } );
                return aData;
};

/*
    dataTables variables
*/

var dt_mappings = 1;
var dt_backgroundrate = 2;
var dt_priority = 3;
var dt_product = 4;
var dt_version = 5;
var dt_buildid = 6;
var dt_channel = 7;
var dt_locale = 8;
var dt_disribution = 9;
var dt_buildtarget = 10;
var dt_osversion = 11;
var dt_dsitversion = 12;
var dt_comment = 13;
var dt_updatetype = 14;
var dt_headerarch = 15;
var dt_versiondata = 16;
var dt_csrftoken = 17;

var dt_details = [
    dt_version,
    dt_buildid,
    dt_locale,
    dt_disribution,
    dt_buildtarget,
    dt_osversion,
    dt_dsitversion,
    dt_updatetype,
    dt_headerarch,
    dt_versiondata,
    dt_csrftoken,
]

var dt_main = [
    dt_mappings,
    dt_backgroundrate,
    dt_priority,
    dt_product,
    dt_channel,
    dt_updatetype,
    dt_comment,
]

var dt_all =$.merge(dt_main, dt_details);

function open_icon() {
    return '<span class="glyphicon glyphicon-chevron-down"></span>'
};

function close_icon() {
    return '<span class="glyphicon glyphicon-chevron-up"></span>'
};

$(document).ready(function() {
    // Insert a 'details' column to the table
    var nCloneTh = document.createElement( 'th' );
    var nCloneTd = document.createElement( 'td' );
    nCloneTd.innerHTML = '<button class="btn btn-info" type="button">' + open_icon() + '</button>';
    // insert details open/close arrow and header (before Mappings)
    $('#rules_table thead tr').each( function () {
        this.insertBefore( nCloneTh, this.childNodes[0] );
    } );

    $('#rules_table tbody tr').each( function () {
        this.insertBefore(  nCloneTd.cloneNode( true ), this.childNodes[0] );
    } );

    var oTable = $('#rules_table').dataTable({
        "aoColumnDefs": [
             // The aTarget numbers refer to the columns in the dataTable on which to apply the functions
             // hide details
             { "bVisible": false, "aTargets": dt_details },
             { "bSortable": false, "aTargets": [ 0 ] },
             { "bSearchable": "true", "aTargets": dt_all },
//             { "sSortDataType": "dom-select", "aTargets": [ dt_mappings ] },
//             { "sSortDataType": "dom-text", "aTargets":[ 1, 2, 3, 4, 5, 14] },
             { "sType": "numeric", "aTargets": [ dt_backgroundrate,
                                                 dt_priority] },
        ],

//        "fnDrawCallback": function(){
//            $("select","[id*=mapping]").combobox();
//        }
    });

//    $( "#toggle" ).click(function() {
//        $( "select","[id*=mapping]").toggle();
//    });


    /* Add event listener for opening and closing details
     * Note that the indicator for showing which row is open is not controlled by DataTables,
     * rather it is done here
     */
    $('#rules_table tbody td button').live('click', function () {
        var nTr = this.parentNode.parentNode;
        more = "btn-info"
        less = "btn-warning"
        if ( this.className === "btn " + less )
        {
            /* This row is already open - close it */
            $(this).removeClass( less ).addClass( more )
            this.innerHTML = open_icon();
            oTable.fnClose( nTr );
        }
        else
        {
            if ( this.className === "btn " + more ) {
            // ^ this blocks delete/revision buttons to change their shape
            // TODO use id
            /* Open this row */
            $(this).removeClass( more ).addClass( less )
            this.innerHTML = close_icon();
            oTable.fnOpen( nTr, fnFormatDetails(oTable, nTr), 'details' );
            activate_buttons(nTr);
            }
        }
    } );

} );

// details
function detail_item(id, name, value) {
    "use strict";
    // label
    var label = document.createElement( 'label' );
    var element_id = id + '_' + name.toLowerCase().replace(' ', '');
    $(label).attr('for', element_id);
    $(label).prop('class', 'col-sm-3 control-label');
    $(label).text(name);

    // div for input
    var div_input = document.createElement( 'div' );
    $(div_input).prop('class', 'col-sm-6');

    // input
    var input = document.createElement( 'input' );
    $(input).attr('type', 'text');
    $(input).prop('class', 'form-control');
    $(input).attr('id', element_id);
    $(input).attr('value', value);

    // attach input to div_input
    div_input.appendChild(input);

    // form-group
    var form_group = document.createElement( 'div' );
    $(form_group).prop('class', 'form-group col-sm-10');

    // attach label and div_input to form_group
    form_group.appendChild(label);
    form_group.appendChild(div_input);
    return form_group;

    // remove me, just an exepriment
    var row = document.createElement( 'div' );
    $(row).prop('class', 'row');
    row.appendChild(form_group);
    return row;
};

function generic_button(rule_id, name) {
    var button = document.createElement( 'button' );
    $(button).attr('id', rule_id + '_' + name );
    $(button).prop('class', 'btn btn-default');
    $(button).attr('type', 'submit');
    //$(button).attr('name', name);
    $(button).attr('title', name);
    $(button).html(name);
    return button
};

function button_edit(rule_id) {
    return generic_button(rule_id, 'edit');
};

function button_delete(rule_id, versiondata, csrf_token) {
    return generic_button(rule_id, 'delete');
};

function button_revision(rule_id) {
    return generic_button(rule_id, 'revision');
};

// this manages the detail
function fnFormatDetails ( oTable, nTr )
{
    var aData = oTable.fnGetData( nTr );
    var rule_id = $(nTr).attr('id');
    var details = document.createElement( 'div' );

    details.appendChild( detail_item(rule_id, 'Version', aData[5]) );
    details.appendChild( detail_item(rule_id, 'Build Id', aData[6]) );
    details.appendChild( detail_item(rule_id, 'Locale', aData[8]) );
    details.appendChild( detail_item(rule_id, 'Distribution', aData[9]) );
    details.appendChild( detail_item(rule_id, 'Build Target', aData[10]) );
    details.appendChild( detail_item(rule_id, 'OS Version', aData[11]) );
    details.appendChild( detail_item(rule_id, 'Dist Version', aData[12]) );
    details.appendChild( detail_item(rule_id, 'Header Architecture', aData[15]) );
    details.appendChild( detail_item(rule_id, 'Version Data', aData[16]) );
    // buttons
    var buttons = document.createElement( 'div' );
    $(buttons).prop('class', 'btn-group col-sm-offset-2 col-sm-10');
    buttons.appendChild( button_edit(rule_id) );
    buttons.appendChild( button_delete(rule_id) );
    buttons.appendChild( button_revision(rule_id) );
    details.appendChild( buttons );
    return $(details).clone().html();
    //return $('<div>').append($(details).clone()).html();
};


function get_data(nTr) {
    var row = $(nTr);
    var id = row.attr('id').replace('rule_', '');
    var token = $(nTr).next();
    var data = {
        // visible columns
        'mapping': $( '#mapping_r' + id ).html(),
        'backgroundRate': $( '#backgroundRate_r' + id ).html(),
        'priority': $( '#priority_r' + id ).html(),
        'product': $( '#product_r' + id ).html(),
        'channel': $( '#channel_r' + id ).html(),
        'comment': $( '#comment_r' + id ).html(),
        // invisible columns - details
        'version': $( '[id="rule_' + id + '_version"]' ).val(),
        'buildid': $( '[id="rule_' + id + '_buildid"]' ).val(),
        'locale': $( '[id="rule_' + id + '_locale"]' ).val(),
        'distribution': $( '[id="rule_' + id + '_distribution"]' ).val(),
        'buildtarget':  $( '[id="rule_' + id + '_buildtarget"]' ).val(),
        'osversion':    $( '[id="rule_' + id + '_osversion"]' ).val(),
        'distversion':  $( '[id="rule_' + id + '_distversion"]' ).val(),
        'headerarchitecture': $( '[id="rule_' + id + '_headerarchitecture"]' ).val(),
        'versiondata':  $( '[id="rule_' + id + '_versiondata"]' ).val(),
        'token':        $( '[id="' + id + '-csrf_token"]' ).val(),
    };
    return data;
};

// This is a modified version of the jquery-ui combobox example:
// http://jqueryui.com/demos/autocomplete/#combobox
//
(function( $ ) {
    $.widget( "ui.combobox", {
        _create: function() {
            var self = this,
            select = this.element.hide(),
            selected = select.children( ":selected" ),
            value = selected.val() ? selected.text() : "";
            var input = this.input = $( "<input>" ).insertAfter( select ).val( value ) .autocomplete({
                    delay: 0,
                    minLength: 0,
                    source: function( request, response ) {
                        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
                        response( select.children( "option" ).map(function() {
                            var text = $( this ).text();
                            if ( this.value && ( !request.term || matcher.test(text) ) )
                            {
                                return {
                                    label: text.replace(
                                               new RegExp(
                                                   "(?![^&;]+;)(?!<[^<>]*)(" +
                                                   $.ui.autocomplete.escapeRegex(request.term) +
                                                   ")(?![^<>]*>)(?![^&;]+;)", "gi"
                                                   ), "<strong>$1</strong>" ),
                                        value: text,
                                option: this
                                };
                            }
                        }) );
                    },
                    select: function( event, ui ) {
                        ui.item.option.selected = true;
                        self._trigger( "selected", event, {
                            item: ui.item.option
                        });
                    },
                    change: function( event, ui ) {
                        if ( !ui.item ) {
                            var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
                                valid = false;
                            select.children( "option" ).each(function() {
                                if ( $( this ).text().match( matcher ) ) {
                                    this.selected = valid = true;
                                    return false;
                                }
                            });
                            if ( !valid ) {
                                // remove invalid value, as it didn't match anything
                                $( this ).val( "" );
                                select.val( "" );
                                input.data( "autocomplete" ).term = "";
                                return false;
                            }
                        }
                    }
                })
                .addClass( "ui-widget ui-widget-content ui-corner-left" );

            input.data( "autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + item.label + "</a>" )
                    .appendTo( ul );
            };

            this.button = $( "<button type='button'>&nbsp;</button>" )
                .attr( "tabIndex", -1 )
                .attr( "title", "Show All Items" )
                .insertAfter( input )
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                })
                .removeClass( "ui-corner-all" )
                    .addClass( "ui-corner-right ui-button-icon" )

                    .click(function() {
                        // close if already visible
                        if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                            input.autocomplete( "close" );
                            return;
                        }

                        // work around a bug (likely same cause as #5265)
                        $( this ).blur();

                        // pass empty string as value to search for, displaying all results
                        input.autocomplete( "search", "" );
                        input.focus();
                    });
        },

            destroy: function() {
                this.input.remove();
                this.button.remove();
                this.element.show();
                $.Widget.prototype.destroy.call( this );
            },
            // Change the value of the combobox:
            // To do this we need to change both the select box and the input
            newVal: function(value) {
                this.element.val(value);
                this.input.val(value);
            }
    });
}( jQuery ));

function getRuleUrl(rule_id) {
    return SCRIPT_ROOT + '/rules/' + rule_id;
}
function getRuleAPIUrl() {
    return SCRIPT_ROOT + '/rules';
}

function getData(prefix, ruleForm){
    data = {
        'backgroundRate': $('[name='+prefix+'-backgroundRate]', ruleForm).val(),
        'mapping': $('[name='+prefix+'-mapping]', ruleForm).val(),
        'priority': $('[name='+prefix+'-priority]', ruleForm).val(),
        'product': $('[name='+prefix+'-product]', ruleForm).val(),
        'version' : $('[name='+prefix+'-version]', ruleForm).val(),
        'build_id' : $('[name='+prefix+'-build_id]', ruleForm).val(),
        'channel' : $('[name='+prefix+'-channel]', ruleForm).val(),
        'locale' : $('[name='+prefix+'-locale]', ruleForm).val(),
        'distribution' : $('[name='+prefix+'-distribution]', ruleForm).val(),
        'build_target' : $('[name='+prefix+'-build_target]', ruleForm).val(),
        'os_version' : $('[name='+prefix+'-os_version]', ruleForm).val(),
        'dist_version' : $('[name='+prefix+'-dist_version]', ruleForm).val(),
        'comment' : $('[name='+prefix+'-comment]', ruleForm).val(),
        'update_type' : $('[name='+prefix+'-update_type]', ruleForm).val(),
        'header_arch' : $('[name='+prefix+'-header_arch]', ruleForm).val(),
        'data_version': $('[name='+prefix+'-data_version]', ruleForm).val(),
        'csrf_token': $('[name='+prefix+'-csrf_token]', ruleForm).val()
    };
    return data;
};

function submitRuleForm(rule_id){
    var ruleForm = $('#rules_form');
    var url = getRuleUrl(rule_id);
    var data = getData(rule_id, ruleForm);

    return $.ajax(url, {'type': 'post', 'data': data, 'dataType': 'json'})
        .error(handleError)
        .success(function(data) {
            $('[name='+rule_id+'-data_version]', ruleForm).val(data.new_data_version);
            alertify.success('Rule updated!');
        });
};

function deleteRule(rule_id, versiondata, token) {
    var data = $.param({
        'data_version': versiondata,
        'csrf_token': token,
    });
    var url = getRuleUrl(rule_id) + '?' + data;
    return $.ajax(url, {'type': 'delete', 'data': data, 'dataType': 'json'})
        .error(handleError)
        .success(function(data) {
            table = $('#rules_table').dataTable();
            row = $('#rule_' + rule_id).get(0);
            table.fnDeleteRow(row);
            alertify.success('Rule deleted!');
        });
}

function submitNewRuleForm(ruleForm, table) {
    url = getRuleAPIUrl();
    data = getData('new_rule', ruleForm);

    preAJAXLoad(ruleForm);

    $.ajax(url, {'type': 'post', 'data': data})
    .error(handleError)
    .success(function(data) {
        $.get(getRuleUrl(data))
        .error(handleError)
        .success(function(data) {
            postAJAXLoad(ruleForm);
            alertify.success('Rule added!');
            table.dataTable().fnAddTr($(data)[0]);
        });
    });
}

function cloneRule(ruleForm, newRuleForm, ruleId){
    $('[name*=new_rule-backgroundRate]', newRuleForm).val($('[name='+ruleId+'-backgroundRate]', ruleForm).val());
    $('[name*=new_rule-mapping]', newRuleForm).combobox('newVal', $('[name='+ruleId+'-mapping]', ruleForm).val());
    $('[name*=new_rule-priority]', newRuleForm).val($('[name='+ruleId+'-priority]', ruleForm).val());
    $('[name*=new_rule-product]', newRuleForm).val($('[name='+ruleId+'-product]', ruleForm).val());
    $('[name*=new_rule-version]', newRuleForm).val($('[name='+ruleId+'-version]', ruleForm).val());
    $('[name*=new_rule-build_id]', newRuleForm).val($('[name='+ruleId+'-build_id]', ruleForm).val());
    $('[name*=new_rule-channel]', newRuleForm).val($('[name='+ruleId+'-channel]', ruleForm).val());
    $('[name*=new_rule-locale]', newRuleForm).val($('[name='+ruleId+'-locale]', ruleForm).val());
    $('[name*=new_rule-distribution]', newRuleForm).val($('[name='+ruleId+'-distribution]', ruleForm).val());
    $('[name*=new_rule-build_target]', newRuleForm).val($('[name='+ruleId+'-build_target]', ruleForm).val());
    $('[name*=new_rule-os_version]', newRuleForm).val($('[name='+ruleId+'-os_version]', ruleForm).val());
    $('[name*=new_rule-dist_version]', newRuleForm).val($('[name='+ruleId+'-dist_version]', ruleForm).val());
    $('[name*=new_rule-comment]', newRuleForm).val($('[name='+ruleId+'-comment]', ruleForm).val());
    $('[name*=new_rule-update_type]', newRuleForm).val($('[name='+ruleId+'-update_type]', ruleForm).val());
    $('[name*=new_rule-header_arch]', newRuleForm).val($('[name='+ruleId+'-header_arch]', ruleForm).val());
}

function activate_buttons(nTr) {
    // edit
    $( ":button[id$='_edit']" ).click(function() {
        alert('edit: not implemented yet');
    });

    // delete
    $( ":button[id$='_delete']" ).each(function() {
        var data = get_data(nTr);
        var button_id = $( this ).attr('id');
        button_id = button_id.split('_')[1];
        $( this ).click(function() {
            deleteRule(button_id, data['versiondata'], data['token']);
        });
    });

    // revision
    $( ":button[id$='_revision']" ).each(function() {
        var button_id = $( this ).attr('id');
        button_id = button_id.split('_')[1];
        $( this ).click(function() {
            window.location = '/rules/' + button_id + '/revisions/' ;
            return false;
        });
    });
};
