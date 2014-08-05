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

var dt_mappings = {
    'col': 1,  'id': 'mapping',
    'label': 'Version','disabled': false,
    'type': 'datalist', 'position': 'main',
    'init_value': '',
};

var dt_backgroundrate = {
    'col': 2, 'id': 'backgroundRate',
    'label': 'Build Id', 'disabled': false,
    'type': 'datalist', 'position': 'main',
    'init_value': 0,
};

var dt_priority = {
    'col': 3, 'id': 'priority',
    'label': 'Priority', 'disabled': false,
    'type': 'input', 'position': 'main',
    'init_value': 0,
};

var dt_product = {
    'col': 4, 'id': 'product',
    'label': 'Product', 'disabled': false,
    'type': 'dropdown', 'position': 'main',
    'init_value': 'Firefox', 'source': get_products(),
};

var dt_version = {
    'col': 5, 'id': 'version',
    'label': 'Version', 'disabled': false,
    'type': 'datalist', 'position': 'details',
    'init_value': '',
};

var dt_buildid = {
    'col': 6, 'id': 'build_id',
    'label': 'Build ID', 'disabled': false,
    'type': 'input', 'position': 'details',
    'init_value': '',
};

var dt_channel = {
    'col': 7, 'id': 'channel',
    'label': 'Channel', 'disabled': false,
    'type': 'input', 'position': 'main',
    'init_value': '',
};
var dt_locale = {
    'col': 8, 'id': 'locale',
    'label': 'Locale', 'disabled': false,
    'type': 'input', 'position': 'details',
    'init_value': '',
};
var dt_distribution = {
    'col': 9, 'id': 'distribution',
    'label': 'Distribution', 'disabled': false,
    'type': 'input', 'position': 'details',
    'init_value': '',
};
var dt_buildtarget = {
    'col': 10, 'id': 'build_target',
    'label': 'Build Target', 'disabled': false,
    'type': 'input', 'position': 'details',
    'init_value': '',
};
var dt_osversion = {
    'col': 11, 'id': 'os_version',
    'label': 'OS Version', 'disabled': false,
    'type': 'input', 'position': 'details',
    'init_value': '',
};

var dt_distversion = {
    'col': 12, 'id': 'dist_version',
    'label': 'Dist Version', 'disabled': false,
    'type': 'input', 'position': 'details',
    'init_value': '',
};

var dt_comment = {
    'col': 13, 'id': 'comment',
    'label': 'Comment', 'disabled': false,
    'type': 'input', 'position': 'main',
    'init_value': '',
};

var dt_updatetype = {
    'col': 14, 'id': 'update_type',
    'label': 'Update Type', 'disabled': false,
    'type': 'dropdown', 'position': 'main',
    'init_value': 'minor', 'source': get_update_type(),
};

var dt_headerarch = {
    'col': 15, 'id': 'headers_architecture',
    'label': 'Headers Architecture', 'disabled': false,
    'type': 'datalist', 'position': 'details',
    'init_value': '',
};

var dt_versiondata = {
    'col': 16, 'id': 'version_data',
    'label': 'Version Data', 'disabled': true,
    'type': 'datalist', 'position': 'details',
    'init_value': 0,
};

var dt_csrftoken = {
    'col': 17, 'id': 'csrf_token',
    'label': '', 'disabled': false,
    'type': 'datalist', 'position': 'details',
    'init_value': 0,  // there's not init_value for csrf token
};


// all elements
var dt_all = [
    dt_version,
    dt_buildid,
    dt_locale,
    dt_distribution,
    dt_buildtarget,
    dt_osversion,
    dt_distversion,
    dt_headerarch,
    dt_versiondata,
    dt_csrftoken,
    dt_mappings,
    dt_backgroundrate,
    dt_priority,
    dt_product,
    dt_channel,
    dt_updatetype,
    dt_comment
];


// main elements
// elements listed here appear in the main area
var dt_main = [];
dt_all.forEach(function(element){
    if ( element.position == 'main' ) {
        dt_main.push(element);
    }
});

// details elements
// elements listed here appear in the detail area
var dt_details = [];
dt_all.forEach(function(element){
    if ( element.position == 'details' ) {
        dt_details.push(element);
    }
});


// columns that will appear in details section
var details_columns = [];
dt_details.forEach(function(element){
    details_columns.push(element.col);
});

// all cloumns
var all_columns = [];
dt_all.forEach(function(element){
    all_columns.push(element.col);
});

// open details icon
function open_icon() {
    return '<span class="glyphicon glyphicon-chevron-down"></span>';
}

// close details icon
function close_icon() {
    return '<span class="glyphicon glyphicon-chevron-up"></span>';
}

// this function changes the rules table doing the following actions:
// * hides the details
// * scales the main elements so they fit in the page
// * adds the button for expanding the details

function create_rules_table() {
// $(document).ready(function() {
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
        // disable automatic column width calculation
        "bAutoWidth": false,
        "aoColumnDefs": [
             // The aTarget numbers refer to the columns in the dataTable on which to apply the functions
             // hide details
             { "bVisible": false, "aTargets": details_columns },
             // make the 1st column (hide/show details) not sortable
             { "bSortable": false, "aTargets": [ 0 ] },
             // make all columns searchable
             { "bSearchable": "true", "aTargets": all_columns },
             // background rate and priority are numeric fields, so just tell
             // datatables we want to sort them in a numeric fashion
             { "sType": "numeric", "aTargets": [ dt_backgroundrate.col - 1 ,
                                                 dt_priority.col - 1] },
             // size of columns
             { "sWidth": "5%",  "aTargets": [0] },
             { "sWidth": "20%", "aTargets": [ dt_mappings -1 ] },
             { "sWidth": "8%",  "aTargets": [ dt_backgroundrate - 1, ] },
             { "sWidth": "5%",  "aTargets": [ dt_priority - 1, ] },
             { "sWidth": "7%",  "aTargets": [ dt_product - 1, ] },
             { "sWidth": "10%", "aTargets": [ dt_channel.col - 1, ] },
             { "sWidth": "10%", "aTargets": [ dt_comment - 1, ] },
             { "sWidth": "15%", "aTargets": [ dt_updatetype - 1, ] },
        ],
    });

    /* Add event listener for opening and closing details
     * Note that the indicator for showing which row is open is not controlled by DataTables,
     * rather it is done here
     */
    $('#rules_table tbody').on('click', 'button', function () {
        var nTr = this.parentNode.parentNode;
        var more = "btn-default closed";
        var less = "btn-warning opened";
        if ( this.className === "btn " + less )
        {
            // This row is already open - close it
            $(this).removeClass( less ).addClass( more );
            this.innerHTML = open_icon();
            remove_editable_fields_on_row( oTable, nTr );
            $( nTr ).removeClass('active');
            oTable.fnClose( nTr );
        }
        else
        {
            if ( this.className === "btn " + more ) {
            // Open this row
            $(this).removeClass( more ).addClass( less );
            this.innerHTML = close_icon();
            $( nTr ).attr('class', 'active');
            oTable.fnOpen( nTr, fnFormatDetails(oTable, nTr), 'details active' );
            activate_buttons(nTr);
            }
        }
    } );
}

// format the details section
function detail_item(id, element, value, disabled=false) {
    "use strict";
    // label
    var label = document.createElement( 'label' );
    var element_id = element.id + '_' + id;
    if ( value == 'None' ) {
        value = '';
    }
    var div = document.createElement( 'div' );
    $( div ).prop('class', 'col-sm-10');
    $( label ).attr('for', 'input_' + element_id);
    $( label ).prop('class', 'control-label col-sm-2');
    $( label ).text(element.label);

    // div for input
    var div_input = document.createElement( 'div' );
    $( div_input ).prop('class', 'col-sm-8');

    // input
    var input = document.createElement( 'input' );
    $( input ).attr('type', 'text');
    $( input ).attr('id', 'input_' + element_id);
    $( input ).attr('value', value);
    $( input ).prop('class', 'form-control');
    $( input ).prop('disabled', disabled);

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
}

// wrapper for buttons, it has all the elements needed (div/button/..)
function generic_button(rule_id, name) {
    var button = document.createElement( 'button' );
    $( button ).attr('id', rule_id + '_' + name );
    $( button ).prop('class', 'btn btn-default');
    $( button ).attr('type', 'submit');
    $( button ).attr('title', name);
    $( button ).html( name );
    return button;
}


// edit button
function button_edit(rule_id) {
    return generic_button(rule_id, 'edit');
}


// delete button
function button_delete(rule_id, versiondata, csrf_token) {
    return generic_button(rule_id, 'delete');
}

// revision button
function button_revision(rule_id) {
    return generic_button(rule_id, 'revision');
}

// scales the input_element
function resize_input_element( input_element, size=7 ) {
    "use strict";
    var div = document.createElement( 'div' );
    // in a 12 columns layout, col-sm-6 is 50%
    $( div ).prop('class', 'form-group col-sm-12'); // + size);
    div.appendChild( input_element );
    return div;
}

// a generic input filed element
function standard_input( nTr, element, value) {
    "use strict";
    var rule_id = nTr.id;
    var element_id = document.getElementById(element.id + '_' + rule_id);
    $( element_id ).empty();

    var input = document.createElement( 'input' );
    $( input ).prop('class', 'form-control');
    if ( value != 'None' ) {
        $( input ).attr('value', value);
    }
    $( input ).attr('id', 'input_' + element.id + '_' + rule_id );

    var wrapper = resize_input_element( input );
    element_id.appendChild( wrapper );
}

// generic option input element
function option_input( nTr, element, options, value ) {
    "use strict";
    var rule_id = nTr.id;
    var select = document.createElement( 'select' );
    $( select ).prop('class', 'form-control');
    $( select ).attr('id', 'input_' + element.id + '_' + rule_id );
    options.forEach(function(entry) {
        var option = document.createElement( 'option' );
        if ( value == entry ) {
            $( option ).attr('selected', 'selected');
        }
        option.innerHTML = entry;
        select.appendChild(option);
    });
    var element_id = document.getElementById(element.id + '_' + rule_id);
    $( element_id ).empty();
    var wrapper = resize_input_element( select, 12 );
    element_id.appendChild( wrapper );
}


function reset_element(element, rule_id, value) {
    "use strict";
    var element = document.getElementById(element.id + '_' + rule_id);
    $( element ).empty();
    element.innerHTML = value;
}


function remove_editable_fields_on_row( oTable, nTr ) {
    // removes the any input fields from current row,
    // this function is called before fnClose
    "use strict";
    var aData = oTable.fnGetData( nTr );
    var rule_id = nTr.id;
    var elements = [dt_mappings, dt_backgroundrate, dt_priority, dt_product,
                    dt_channel, dt_comment, dt_updatetype];
    elements.forEach(function(element){
        reset_element(element, rule_id, aData[element.col]);
    });
}


// datalist element (for mapping)
function add_datalist( nTr, element, value ) {
    "use strict";
    var rule_id = nTr.id;
    var element_id = document.getElementById(element.id + '_' + rule_id);
    // datalist id == list_mappings_<num>
    // mappings id == input_mappings_<num>
    $( element_id ).empty();

    // select current datalist
    var datalist = document.createElement( 'datalist' );
    var datalist_id = 'list_' + element.id + '_' + rule_id;
    $( datalist ).attr( 'id', datalist_id );

    var input = document.createElement( 'input' );
    $( input ).prop( 'class', 'form-control' );
    $( input ).attr( 'id', 'input_' + element.id + '_' + rule_id );
    $( input ).attr( 'list', datalist_id );
    $( input ).attr( 'value', value );
    element_id.appendChild( input );

    get_mappings( value, function(mappings) {
        mappings.mappings.forEach(function(mapping) {
            // our backend provides a json formatted lists of mappings
            // forEach() iterates through the results;
            // results are generated on server side with the following
            // query (more or less...)
            //
            // select mappings where mapping like '%<current_value>%'
            //
            // create a new option for each result provided by the backend
            var option = document.createElement( 'option' );
            // and set the option value to 'mapping'
            $( option ).attr('value', mapping);
            // append option to datalist
            datalist.appendChild( option );
        });
    });
    element_id.appendChild( datalist );
}

function update_datalist(current_mappings) {
    // select this mappings input
    var current_value = $( current_mappings ).val();
    var datalist_id = $(current_mappings).attr('id').replace('input', 'list');
    $( datalist_id ).empty();
    var datalist = document.getElementById(datalist_id);
    // and now repopulate it with new values
    get_mappings( current_value, function(mappings) {
        mappings.mappings.forEach(function(mapping) {
            var option = document.createElement( 'option' );
            // and set the option value to 'mapping'
            $( option ).attr('value', mapping);
            // append option to datalist
            datalist.appendChild( option );
        });
    });
    // no need to append datalist to other elements.
}


// get a list of products, do no hardcode, add an entry point in the backend
function get_products() {
    "use strict";
    // get them from the db as "mappings" does
    return ['', 'Firefox', 'Fennec', 'Thunderbird'];
}

function get_update_type(){
    return [ 'minor', 'major' ];
}

// formats the main section of the rules table
function fnFormatMain( oTable, nTr ) {
    "use strict";
    var aData = oTable.fnGetData( nTr );
    var rule_id = nTr.id;
    var products = get_products();
    add_datalist( nTr, dt_mappings, aData[dt_mappings.col]);

    // update datalist when input changes
    var current_mappings = '#input_' + dt_mappings.id + '_' + rule_id;
    $( current_mappings ).keyup( function() {
        update_datalist(current_mappings);
    });
    standard_input( nTr, dt_backgroundrate, aData[dt_backgroundrate.col]);
    standard_input( nTr, dt_priority, aData[dt_priority.col]);
    option_input( nTr, dt_product, products, aData[dt_product.col]);
    standard_input( nTr, dt_channel, aData[dt_channel.col]);
    standard_input( nTr, dt_comment, aData[dt_comment.col]);
    var update_type = get_update_type();
    option_input( nTr, dt_updatetype, update_type, aData[dt_updatetype.col]);
}


// this manages the detail
function fnFormatDetails ( oTable, nTr ) {
    "use strict";
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
                    dt_headerarch, dt_versiondata,];
    elements.forEach(function(element) {
        details.appendChild( detail_item( rule_id,
                                          element,
                                          aData[element.col],
                                          element.disabled));
    });
    // csfr_token, it's already invisible
    $( details ).append( aData[dt_csrftoken.col] );
    // buttons
    var buttons = document.createElement( 'div' );
    $( buttons ).prop('class', 'btn-group col-sm-offset-2 col-sm-10');
    buttons.appendChild( button_edit(rule_id) );
    buttons.appendChild( button_delete(rule_id) );
    buttons.appendChild( button_revision(rule_id) );
    details.appendChild( buttons );
    details.appendChild( div_space_bottom );
    return $( details ).clone().html();
}


function getRuleUrl(rule_id) {
    "use strict";
    var rule_number = rule_id.replace('rule_', '');
    rule_number = rule_number.replace('r_', '');
    return SCRIPT_ROOT + '/rules/' + rule_number;
}

function submitRuleForm(rule_id, data){
    "use strict";
    var url = getRuleUrl(rule_id);

    // post data to url
    $.ajax(url, {'type': 'post', 'data': data, 'dataType': 'json'})
        .error(function (request, status, error) {
            // ops... error!
            var bad_element = request.responseText;
            var message = 'Error updating rule: ' + rule_id;
            message = message + ' ' + bad_element + ' has a wrong value!';
            message = message + ' ' + '(click to remove this message)';
            // Alertify.log(message, "error", 5);
            alertify.error(message);
        })
        .success(function(data) {
            $('#input_data_version_' + rule_id).val(data.new_data_version);
            alertify.success('Rule updated!');
        });
}

function deleteRule(rule_id, versiondata, token) {
    "use strict";
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

function getRuleAPIUrl() {
    return SCRIPT_ROOT + '/rules';
}

function getData( rule_id ) {
    "use strict";
    rule_id = '_' + rule_id;
    // $( '#input_' + dt_mappings.id + rule_id ).val
    var rule_nu = rule_id.replace('_rule_', '');
    // returns the default value, not the one entered
    var mapping_value = document.getElementById( 'input_' + dt_mappings.id + rule_id ).value;
    var data = {
        'backgroundRate': $( '#input_' + dt_backgroundrate.id + rule_id ).val(),
        'mapping'       : mapping_value,
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
        'csrf_token'    : $( '#' + rule_nu + '-' + dt_csrftoken.id ).val(),
    };
    return data;
}


function get_mappings(value, callback) {
    var url = SCRIPT_ROOT + '/mappings/' + value;
    return $.ajax(url, {
        type: 'get',
        dataType: 'json',
        success: callback,
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
        var data = getData( nTr.id );
        var button_id = $( this ).attr('id');
        button_id = button_id.split('_')[1];
        $( this ).click(function() {
            deleteRule(button_id, data.versiondata, data.token);
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
}


function edit_row( nTr ) {
    "use strict";
    var rule_id = nTr.id;
    /* rule_id = rule_id.replace('rule_', '_r'); */
    var data = getData( rule_id );
    // window.console && console.log(data);
    submitRuleForm( nTr.id, data );
}


function transform_to_datalist(id, element) {
    "use strict";
    $( id ).clone().attr('type','datalist').insertAfter( id ).prev().remove();
}

function transform_to_input(id, element) {
    "use strict";
    // there's nothing to do here
}

function transform_to_dropdow(id, element) {
    "use strict";
    // select input parent and...
    var dropdown_parent = $( id ).parent();
    // remove the input field
    $( id ).remove();
    // create a  select element
    var select = $( '<select>' ).appendTo( dropdown_parent );
    // and set the form-control field (for bootstrap)
    $( select ).prop('class', 'form-control');
    var options = [];
    // now get all options
    element.source.forEach(function(option){
        var option_element = $( '<option>' ).appendTo( $( select ) );
        $( option_element ).attr('value', option);
        $( option_element ).text(option);
    });
}

function create_datatable_add_rule() {
    "use stict";
    // Insert a 'details' column to the table
    dt_all.forEach(function(element){
        var item_id = "#new_rule-" + element.id + "_new";
        switch (element.type) {
            case 'datalist':
                transform_to_datalist(item_id, element);
                break;
            case 'input':
                transform_to_input(item_id, element);
                break;
            case 'dropdown':
                transform_to_dropdow(item_id, element);
                break;
        }

    });
}
