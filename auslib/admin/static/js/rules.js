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

var dt_mappings = { 'col': 1, 'id': 'mapping', 'type': 'combobox', };
var dt_backgroundrate = { 'col': 2, 'id': 'backgroundRate', 'type': 'text', };
var dt_priority = { 'col': 3, 'id': 'priority', 'type': 'text', };
var dt_product = { 'col': 4, 'id': 'product', 'type': 'select', };
var dt_version = { 'col': 5, 'id': 'version', 'type': 'text', };
var dt_buildid = { 'col': 6, 'id': 'build_id', 'type': 'text', };
var dt_channel = { 'col': 7, 'id': 'channel', 'type': 'text', };
var dt_locale = { 'col': 8, 'id': 'locale', 'type': 'text', };
var dt_distribution = { 'col': 9, ':id': 'distribution', 'type': 'text', };
var dt_buildtarget = { 'col': 10, 'id': 'build_target', 'type': 'text', };
var dt_osversion = { 'col': 11, 'id': 'os_version', 'type': 'text', };
var dt_distversion = { 'col': 12, 'id': 'dist_version', 'type': 'text', };
var dt_comment = { 'col': 13, 'id': 'comment', 'type': 'text', };
var dt_updatetype = { 'col': 14, 'id': 'update_type', 'type': 'text', };
var dt_headerarch = { 'col': 15, 'id': 'headers_architecture', 'type': 'text', };
var dt_versiondata = { 'col': 16, 'id': 'version_data', 'type': 'text', };
var dt_csrftoken = { 'col': 17, 'id': 'csrf_token', 'type': 'text', };

dt_version.label = 'Version';
dt_buildid.label ='Build Id';
dt_locale.label = 'Locale';
dt_distribution.label = 'Distribution';
dt_buildtarget.label = 'Build Target';
dt_osversion.label = 'OS Version';
dt_distversion.label = 'Dist Version';
dt_headerarch.label = 'Header Architecture';
dt_versiondata.label = 'Version Data';

// details elements
var dt_details = [
    dt_version.col,
    dt_buildid.col,
    dt_locale.col,
    dt_distribution.col,
    dt_buildtarget.col,
    dt_osversion.col,
    dt_distversion.col,
    dt_headerarch.col,
    dt_versiondata.col,
    dt_csrftoken.col,
]

// main elements
var dt_main = [
    dt_mappings.col,
    dt_backgroundrate.col,
    dt_priority.col,
    dt_product.col,
    dt_channel.col,
    dt_updatetype.col,
    dt_comment.col,
]

// all elements
var dt_all = $.merge(dt_main, dt_details).sort(function(a,b){return a-b});

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
    nCloneTd.innerHTML = '<button class="btn btn-default closed" type="button">' + open_icon() + '</button>';
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
//             { "sSortDataType": "dom-text", "aTargets": [ dt_main ]  },
             { "sType": "numeric", "aTargets": [ dt_backgroundrate.col - 1 ,
                                                 dt_priority.col - 1] },
             { "sWidth": "20%", "aTargets": [dt_comment.col - 1, ] },
             { "sWidth": "20%", "aTargets": [dt_channel.col - 1, dt_mappings.col - 1] },
        ],
/*
        "fnDrawCallback": function(){
            $("select","[id*=mapping]").combobox();
        }
*/
    });
/*
    $( "#toggle" ).click(function() {
        $( "select","[id*=mapping]").toggle();
    });
*/


    /* Add event listener for opening and closing details
     * Note that the indicator for showing which row is open is not controlled by DataTables,
     * rather it is done here
     */
    $('#rules_table tbody').on('click', 'button', function () {
        var nTr = this.parentNode.parentNode;
        more = "btn-default closed"
        less = "btn-warning opened"
        if ( this.className === "btn " + less )
        {
            // This row is already open - close it
            $(this).removeClass( less ).addClass( more )
            this.innerHTML = open_icon();
            remove_editable_fields_on_row( oTable, nTr );
            $( nTr ).removeClass('active');
            oTable.fnClose( nTr );
        }
        else
        {
            if ( this.className === "btn " + more ) {
            // Open this row
            $(this).removeClass( more ).addClass( less )
            this.innerHTML = close_icon();
            $( nTr ).attr('class', 'active');
            oTable.fnOpen( nTr, fnFormatDetails(oTable, nTr), 'details active' );
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
    if ( value == 'None' ) {
        value = '';
    }
    var div = document.createElement( 'div' );
    $( div ).prop('class', 'col-sm-10');

    $( label ).attr('for', 'input_' + element_id);
    $( label ).prop('class', 'control-label col-sm-2');
    $( label ).text(name);

    // div for input
    var div_input = document.createElement( 'div' );
    $( div_input ).prop('class', 'col-sm-8');

    // input
    var input = document.createElement( 'input' );
    $( input ).attr('type', 'text');
    $( input ).prop('class', 'form-control');
    var short_id = id.replace('rule_', '_r');
    var input_id = element_id.replace(id, '');
    $( input ).attr('id', 'input' + input_id + short_id );
    $( input ).attr('value', value);

    // attach input to div_input
    div_input.appendChild(input);

    // form-group
    var form_group = document.createElement( 'div' );
    $( form_group ).prop('class', 'form-group');

    // attach label and div_input to form_group
    form_group.appendChild( label );
    form_group.appendChild( div_input );

    div.appendChild( form_group );
    return div;
};


function generic_button(rule_id, name) {
    var button = document.createElement( 'button' );
    $( button ).attr('id', rule_id + '_' + name );
    $( button ).prop('class', 'btn btn-default');
    $( button ).attr('type', 'submit');
    $( button ).attr('title', name);
    $( button ).html( name );
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


function resize_input_element( input_element, size=7 ) {
    "use strict";
    var div = document.createElement( 'div' );
    // in a 12 columns layout, col-sm-6 is 50%
    $( div ).prop('class', 'form-group col-sm-12'); // + size);
    div.appendChild( input_element );
    return div;
}


function standard_input( nTr, element_name, value) {
    "use strict";
    var rule_id = nTr.id
    rule_id = rule_id.replace('rule_', '_r');
    var element_id = document.getElementById(element_name + rule_id);
    $( element_id ).empty();

    var input = document.createElement( 'input' );
    $( input ).prop('class', 'form-control');
    if ( value != 'None' ) {
        $( input ).attr('value', value);
    };
    $( input ).attr('id', 'input_' + element_name + rule_id );

    var wrapper = resize_input_element( input );
    element_id.appendChild( wrapper );
};


function option_input( nTr, element_name, options, value ) {
    "use strict";
    var rule_id = nTr.id
    rule_id = rule_id.replace('rule_', '_r');
    var select = document.createElement( 'select' );
    $( select ).prop('class', 'form-control');
    $( select ).attr('id', 'input_' + element_name + rule_id );
    options.forEach(function(entry) {
        var option = document.createElement( 'option' );
        if ( value == entry ) {
            $( option ).attr('selected', 'selected');
        }
        option.innerHTML = entry;
        select.appendChild(option);
    });
    var rule_id = nTr.id
    rule_id = rule_id.replace('rule_', '_r');
    var element_id = document.getElementById(element_name + rule_id);
    $( element_id ).empty();
    var wrapper = resize_input_element( select, 12 );
    element_id.appendChild( wrapper );
};


function reset_element(element, rule_id, value) {
    "use strict";
    var element = document.getElementById(element.id + rule_id);
    $( element ).empty();
    element.innerHTML = value;
};


function remove_editable_fields_on_row( oTable, nTr ) {
    // removes the any input fields from current row,
    // this function is called before fnClose
    "use strict";
    var aData = oTable.fnGetData( nTr );
    var rule_id = nTr.id;
    rule_id = rule_id.replace('rule_', '_r');

    var elements = [dt_mappings, dt_backgroundrate, dt_priority, dt_product,
                    dt_channel, dt_comment, dt_updatetype]
    elements.forEach(function(element){
        reset_element(element, rule_id, aData[element.col]);
    });
};


function add_datalist( nTr, element_name, value ) {
    "use strict";
    //
    var rule_id = nTr.id
    rule_id = rule_id.replace('rule_', '_r');

    var element_id = document.getElementById(element_name + rule_id);
    var e_id = element_name + rule_id;
    var element_id = document.getElementById(e_id);;
    $( element_id ).empty();

    var datalist = document.createElement( 'datalist' );
    $( datalist ).attr( 'id', element_name );

    var input = document.createElement( 'input' );
    $( input ).prop( 'class', 'form-control' );
    $( input ).attr( 'id', 'input_' + element_name + rule_id );
    $( input ).attr( 'id', 'input_' + element_name + rule_id );
    $( input ).attr( 'list', element_name );
    $( input ).attr( 'value', value );
    element_id.appendChild( input );

    get_mappings( function(mappings) {
        mappings['mappings'].forEach(function(mapping) {
            var option = document.createElement( 'option' );
            $( option ).attr('value', mapping);
            datalist.appendChild( option );
        });
    });
    element_id.appendChild( datalist );
};

function get_products() {
    "use strict";
    // get them from the db as "mappings" does
    return ['', 'Firefox', 'Fennec', 'Thunderbird'];
}

function fnFormatMain( oTable, nTr ) {
    "use strict";
    var aData = oTable.fnGetData( nTr );
    var rule_id = nTr.id
    var products = get_products();
    add_datalist( nTr, dt_mappings.id, aData[dt_mappings.col]);
    standard_input( nTr, dt_backgroundrate.id, aData[dt_backgroundrate.col]);
    standard_input( nTr, dt_priority.id, aData[dt_priority.col]);
    option_input( nTr, dt_product.id, products, aData[dt_product.col]);
    standard_input( nTr, dt_channel.id, aData[dt_channel.col]);
    standard_input( nTr, dt_comment.id, aData[dt_comment.col]);
    var update_type = [ 'minor', 'major' ];
    option_input( nTr, dt_updatetype.id, update_type, aData[dt_updatetype.col]);
};


// this manages the detail
function fnFormatDetails ( oTable, nTr ) {
    fnFormatMain(oTable, nTr);
    var aData = oTable.fnGetData( nTr );
    var rule_id = nTr.id;
    var details = document.createElement( 'div' );

    var div_space_top = document.createElement( 'div' );
    $( div_space_top ).prop('class', 'spacer10');
    var div_space_bottom = div_space_top.cloneNode( true );

    details.appendChild( div_space_top );
    var elements = [dt_version, dt_buildid, dt_locale, dt_distribution,
                    dt_buildtarget, dt_osversion, dt_distversion,
                    dt_headerarch, dt_versiondata]
    elements.forEach(function(element) {
        details.appendChild( detail_item( rule_id,
                                          element.label,
                                          aData[element.col]));
    });
    // buttons
    var buttons = document.createElement( 'div' );
    $( buttons ).prop('class', 'btn-group col-sm-offset-2 col-sm-10');
    buttons.appendChild( button_edit(rule_id) );
    buttons.appendChild( button_delete(rule_id) );
    buttons.appendChild( button_revision(rule_id) );
    details.appendChild( buttons );
    details.appendChild( div_space_bottom );
    return $( details ).clone().html();
};


function getRuleUrl(rule_id) {
    "use strict";
    var rule_number = rule_id.replace('rule_', '');
    rule_number = rule_number.replace('r_', '');
    return SCRIPT_ROOT + '/rules/' + rule_number;
};

function getRuleAPIUrl() {
    return SCRIPT_ROOT + '/rules';
};

function getData( rule_id ) {
    "use strict";
    var rule_number = rule_id.replace('_r', '');
    var data = {
        'backgroundRate': $( '#input_' + dt_backgroundrate.id + rule_id ).val(),
        'mapping'       : $( '#mapping' + rule_id ).text(),
        'priority'      : $( '#input_' + dt_priority.id + rule_id ).val(),
        'product'       : $( '#input_' + dt_product.id + rule_id ).val(),
        'version'       : $( '#input_' + dt_version.id + rule_id ).val(),
        'build_id'      : $( '#input_' + dt_buildid.id + rule_id ).val(),
        'channel'       : $( '#input_' + dt_channel.id + rule_id ).val(),
        'locale'        : $( '#input_' + dt_locale.id + rule_id ).val(),
        'distribution'  : $( '#input_' + dt_distribution.id + rule_id ).val(),
        'build_target'  : $( '#input_' + dt_buildtarget.id + rule_id ).val(),
        'os_version'    : $( '#input_' + dt_osversion.id + rule_id ).val(),
        'dist_version'  : $( '#input_' + dt_distversion.id + rule_id ).val(),
        'comment'       : $( '#input_' + dt_comment.id + rule_id ).val(),
        'update_type'   : $( '#input_' + dt_updatetype.id + rule_id ).val(),
        'header_arch'   : $( '#input_' + dt_headerarch.id + rule_id ).val(),
        'data_version'  : $( '#input_' + dt_versiondata.id + rule_id ).val(),
        'csrf_token'    : $( '#new_rule-csrf_token' ).val()
    };
    return data;
};


function get_mappings(callback) {
    var url = SCRIPT_ROOT + '/mappings';
    $.ajax(url, {
        type: 'get',
        dataType: 'json',
        success: callback,
    });
};

function submitRuleForm(rule_id, data){
    var url = getRuleUrl(rule_id);

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


function activate_buttons( nTr ) {
    // edit
    $( ":button[id$='_edit']" ).click(function() {
        edit_row( nTr );
    });

    // delete
    $( ":button[id$='_delete']" ).each(function() {
        var data = getData(nTr.id );
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


function edit_row( nTr ) {
    "use strict";
    var rule_id = nTr.id
    rule_id = rule_id.replace('rule_', '_r');
    console.log('not implemented yet');
    var data = getData( rule_id );
    console.log( data );
    submitRuleForm( nTr.id, data );
};
