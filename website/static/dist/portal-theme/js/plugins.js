/* Sidebar Menu*/
$(document).ready(function () {
    $('.nav > li > a').click(function () {
        if ($(this).attr('class') != 'active') {
            $('.nav li ul').slideUp();
            $(this).next().slideToggle();
            $('.nav li a').removeClass('active');
            $(this).addClass('active');
        }
    });

    /* Top Stats Show Hide */

    $("#topstats").click(function () {
        $(".topstats").slideToggle(100);
    });


    /* Sidepanel Show-Hide */

    $(".sidepanel-open-button").click(function () {
        $(".sidepanel").toggle(100);
    });


    /* Sidebar Show-Hide On Mobile */

    $(".sidebar-open-button-mobile").click(function () {
        $(".sidebar").toggle(150);
    });


    /* Sidebar Show-Hide */

    $('.sidebar-open-button').click(function () {
        if ($('.sidebar').hasClass('hidden')) {
            $('.sidebar').removeClass('hidden');
            $('.content').css({
                'marginLeft': 250
            });
        } else {
            $('.sidebar').addClass('hidden');
            $('.content').css({
                'marginLeft': 0
            });
        }
    });


    /* ===========================================================
     PANEL TOOLS
     ===========================================================*/
    /* Minimize */

    $(".panel-tools .minimise-tool").click(function (event) {
        $(this).parents(".panel").find(".panel-body").slideToggle(100);

        return false;
    });


    /* Close */

    $(".panel-tools .closed-tool").click(function (event) {
        $(this).parents(".panel").fadeToggle(400);

        return false;
    });


    /* Search */

    $(".panel-tools .search-tool").click(function (event) {
        $(this).parents(".panel").find(".panel-search").toggle(100);

        return false;
    });


    /* expand */
    $('.panel-tools .expand-tool').click(function () {
        if ($(this).parents(".panel").hasClass('panel-fullsize')) {
            $(this).parents(".panel").removeClass('panel-fullsize');
        }
        else {
            $(this).parents(".panel").addClass('panel-fullsize');

        }
    });


    /* ===========================================================
     Widget Tools
     ===========================================================*/


    /* Close */

    $(".widget-tools .closed-tool").click(function (event) {
        $(this).parents(".widget").fadeToggle(400);

        return false;
    });


    /* expand */


    $('.widget-tools .expand-tool').click(function () {
        if ($(this).parents(".widget").hasClass('widget-fullsize')) {
            $(this).parents(".widget").removeClass('widget-fullsize');
        }
        else {
            $(this).parents(".widget").addClass('widget-fullsize');

        }
    });


    /* pixxett Alerts */
    /* Default */

    $(".pixxett-alert .closed").click(function (event) {
        $(this).parents(".pixxett-alert").fadeToggle(350);

        return false;
    });


    /* Click to close */

    $(".pixxett-alert-click").click(function (event) {
        $(this).fadeToggle(350);

        return false;
    });

});


/* Tooltips */
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
})


/* Page Loading */
$(window).load(function () {
    $(".loading").fadeOut(750);
})


/* Update Fixed */
/* Version 1.2 */
$('.profilebox').click(function () {
    $(".sidepanel").hide();
})
