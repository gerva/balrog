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

$(document).ready(function() {

    /*
     * Insert a 'details' column to the table
     */
    var nCloneTh = document.createElement( 'th' );
    var nCloneTd = document.createElement( 'td' );
    nCloneTd.innerHTML = '<img src="../examples_support/details_open.png">';
    nCloneTd.className = "center";

    $('#rules_table thead tr').each( function () {
        this.insertBefore( nCloneTh, this.childNodes[0] );
    } );

    $('#rules_table tbody tr').each( function () {
        this.insertBefore(  nCloneTd.cloneNode( true ), this.childNodes[0] );
    } );

    var oTable = $('#rules_table').dataTable({
        "aoColumnDefs": [
             // The aTarget numbers refer to the columns in the dataTable on which to apply the functions
             { "sSortDataType": "dom-select", "aTargets":[1] },
             { "sSortDataType": "dom-text", "aTargets":[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
             { "sType": "numeric", "aTargets": [1, 2] }
        ],
        "aoColumns": [ 
              /* open/close image    */
              { "bSortable": false },

              /* Mapping             */
              null,

              /* Background Rate     */
              null,

              /* Priority            */
              null,

              /* Product             */
              null,

              /* Version             */
              null,

              /* Build ID            */
              { "bVisible": false },

              /* Channel             */
              { "bVisible": false },

              /* Locale              */
              { "bVisible": false },

              /* Distribution        */
              { "bVisible": false },

              /* Build Target        */
              { "bVisible": false },

              /* OS Version          */
              { "bVisible": false },

              /* Dist Version        */
              { "bVisible": false },

              /* Comment             */
              { "bVisible": false },

              /* Update Type         */

              { "bVisible": false },

              /* Header Architecture */
              { "bVisible": false },

              /* Update              */
              null,

              /* Clone               */
              null,

              /* Revisions           */
              null 
        ],

        "fnDrawCallback": function(){
            $("select","[id*=mapping]").combobox();
        }
    });

    $( "#toggle" ).click(function() {
        $( "select","[id*=mapping]").toggle();
    });


    /* Add event listener for opening and closing details
     * Note that the indicator for showing which row is open is not controlled by DataTables,
     * rather it is done here
     */
    $('#rules_table tbody td img').live('click', function () {
        var nTr = this.parentNode.parentNode;
        if ( this.src.match('details_close') )
        {
            /* This row is already open - close it */
            this.src = "../examples_support/details_open.png";
            oTable.fnClose( nTr );
        }
        else
        {
            /* Open this row */
            this.src = "../examples_support/details_close.png";
            oTable.fnOpen( nTr, fnFormatDetails(oTable, nTr), 'details' );
        }
    } );

} );


// dataTable ...
// http://www.datatables.net/examples/api/row_details.html
/* Formating function for row details */
function fnFormatDetails ( oTable, nTr )
{
    var aData = oTable.fnGetData( nTr );
    var sOut = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
    sOut += '<tr><td>Product:</td><td>'+aData[4]+'</td></tr>';
    sOut += '<tr><td>Version:</td><td>'+aData[5]+'</td></tr>';
    sOut += '<tr><td>Build ID:</td><td>'+aData[6]+'</td></tr>';
    sOut += '<tr><td>Channel:</td><td>'+aData[7]+'</td></tr>';
    sOut += '<tr><td>Locale:</td><td>'+aData[8]+'</td></tr>';
    sOut += '<tr><td>Distribution:</td><td>'+aData[9]+'</td></tr>';
    sOut += '<tr><td>build Target:</td><td>'+aData[10]+'</td></tr>';
    sOut += '<tr><td>OS Version:</td><td>'+aData[11]+'</td></tr>';
    sOut += '<tr><td>Dist Version:</td><td>'+aData[12]+'</td></tr>';
    sOut += '<tr><td>Comment:</td><td>'+aData[13]+'</td></tr>';
    sOut += '<tr><td>Update Type:</td><td>'+aData[14]+'</td></tr>';
    sOut += '</table>';

    return sOut;
}



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
}

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

}

function submitNewRuleForm(ruleForm, table) {
    url = getRuleAPIUrl();
    data = getData('new_rule', ruleForm);

    //console.log(data);
    preAJAXLoad(ruleForm);

    $.ajax(url, {'type': 'post', 'data': data})
    .error(handleError)
    .success(function(data) {
        $.get(getRuleUrl(data))
        .error(handleError)
        .success(function(data) {
            postAJAXLoad(ruleForm);
            alertify.success('Rule added!');
            table.append(data);
            table.dataTable().fnDraw();
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
