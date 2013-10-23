/*global window, document, $ */

(function($) {
    "use strict";

    var areWeMobileYet = false;

    function endsWith(line, str) {
        var lastIndex = line.lastIndexOf(str);
        return (lastIndex != -1) && (lastIndex + str.length == line.length);
    }

    /**
     * Close all open header slides
     */
    function closeSlides(callback) {
        $(".mobile-slide").slideUp("fast", function done() {
            $(".mobile-slide-button").removeClass("active");
            callback();
        });
    }

    /**
     * Open a named header slide, close others
     */
    function openSlide(elem, button) {

        // Don't reopen if already open
        var alreadyVisible = false;

        if(elem.is(":visible")) {
            alreadyVisible = true;
        }

        function openAfterClose() {
            if(!alreadyVisible) {
                elem.slideDown();
                button.addClass("active");
            }
        }

        var anyVisible = $(".mobile-slide:visible").size() > 0;

        if(anyVisible) {
            closeSlides(openAfterClose);
        } else {
            openAfterClose();
        }
    }

    /**
     * Make elements "tile link" by applying a click handler which will take to the first <a>
     * target inside the element.
     *
     * @param {Object} jQuery selector of tiles.
     */
    function applyTileLinks(selector) {

        selector = $(selector);

        selector.click(function(e) {
                        
            var $this = $(this);
            var a = $this.find("a");
            var elem = a.get(0);
            
            e.preventDefault();
            
            if(!$this.attr("href")) {
                window.location = a.attr("href");
                return false;
            } else {
                // The tile was a link itself, let native link handling take over
                return true;
            }
        });

        selector.addClass("mobile-tile-link");
    }

    /**
     * Mangle HTML so that
     *
     * - portal tabs are moved to mobile menu
     *
     * - quick links are moved to mobile menu
     */
    function createMenu() {

        var target = $("#mobile-menu-entries");

        // Move tabs
        $("#portal-globalnav li").each(function() {
            var t = $(this).clone(false);
            t.appendTo(target);
        });


        // Move quick menu
        target = $("#mobile-quick-link-entries");
        $(".globalnav #effect li").each(function() {
            var t = $(this).clone(false);
            t.appendTo(target);
        });

        // Create switcher
        $("#mobile-menu-button").click(function(e) {
            e.preventDefault();
            openSlide($("#mobile-slide-menu"), $("#mobile-menu-button"));
            return false;
        });

    }

    /**
     * Create hidden mobile search
     */
    function createSearch() {
        var e = $("#portal-searchbox");
        e.detach();
        e.appendTo("#mobile-slide-search");

        e.show(); // post CSS load enabling, to prevent page load flicker

        //e.find("[name=SearchableText]").attr("type", "search");

        // Create switcher
        $("#mobile-search-button").click(function(e) {
            e.preventDefault();
            openSlide($("#mobile-slide-search"), $("#mobile-search-button"));
            return false;
        });

        // No live search for mobile
        $("#LSResult").remove();

    }

    /**
     * Move "Next" to the end of the listing bar
     */
    function fixListingBar() {

        $(".listingBar").each(function() {
            var $this = $(this);
            var a = $this.find(".next").detach();
            a.appendTo($this);
        });
    }

    /**
     * Used by news aggregator view http://127.0.0.1:45442/iwlearn/news/aggregator
     *
     * Convert <dd> <dt> styles listing to mobile tile links.
     *
     */
    function fixFolderListing() {

        // Select raw folder listing and AT topic listing
        var itemBodies = $(".template-folder_listing #content-core dd, .template-atct_topic_view #content-core dd, .portaltype-contactdb #content-core dd, .template-search .searchResults dd");

        var items = itemBodies.each(function() {
            var dd = $(this);
            var dt = dd.prev();
            var heading = dt.html();
            dt.remove();
            dd.prepend(heading);
        });

        // Tilefy news items
        if(items.size() > 0) {
            applyTileLinks(itemBodies);

            // Clean icons
            items.find("img").hide();
        }


    }

    /**
     * Apply tile links on the various parts of the site.
     */
    function createTileLinkSections() {

        // Exception makes the rule
        if($(document.body).hasClass("section-archive")) {
            return;
        }

        applyTileLinks(".portletItem, .portletFooter, .tileItem");
    }

    /**
     * Determine if we have loaded mobile.css thru CSS3 media query
     *
     * One trick: https://github.com/viljamis/detectMQ.js/blob/master/detectMQ.js but needs newer devices
     */
    function isMobile() {

        // Query thru jQuery for maximum compatibility
        var color = $(document.body).css("backgroundColor");
        return (color.toLowerCase() == "rgb(255, 255, 254)");
    }

    /**
     * Override Plone's default content icons behavior
     *
     */
    function disableIcons() {
        $(document.body).removeClass("icons-on");
    }


    /**
     * Fix content images aligned to left or right edge
     */
    function defloat(selector) {

        selector = $(selector);

        // Replace inline float styles
        selector.attr("style", "diplay: block !important; margin: 1em auto; float: none; clear: none");
        // Make surrounding <a> also a block
        selector.parent("a").attr("style", "display: block; margin: 0 auto; text-align: center");
    }


    function defloatImages() {
        defloat(".portaltype-feedfeederitem #content-core img, .template-document_view #content-core img");
    }

    function defloatEventDetails() {
        defloat(".eventDetails");
    }

    /* In-page table of contents */
    function defloatTOC() {
        defloat(".toc");
    }


    /**
     *  Fix some layout on project page thumbnail
     * http://localhost:45442/iw-projects/2571
     */
    function defloatProjectPage() {
        //defloat(".portaltype-project .thumbnail");
    }


    /**
     * Jump direclty over /events calendar view
     *
     */
    function skipEventCalendar() {

        if(endsWith(window.location.href, "abt_iwlearn/events")) {
            // EXception makes the rule
            return;
        }

        if(endsWith(window.location.href, "/events")) {
            // Navigate deeper
            window.location = window.location + "/aggregator/list-of-upcoming-events";
        }
    }

    /**
     * Mangle HTML on the client side so that it matches mobile layout.
     *
     * Do changes what we cannot achieve with pure CSS.
     *
     * - Move menus
     *
     * - Install mobile specific jQuery UI widgets
     *
     * NOTE: Currently some of the changes cannot be pulled back. If you shrink browser window and enlarge again
     * some content might be lost in the process.
     */
    function mobilize() {
       
        if(areWeMobileYet) {
            return;
        }

        createMenu();
        createSearch();
        createTileLinkSections();

        fixListingBar();
        fixFolderListing();

        defloatImages();
        defloatEventDetails();
        defloatProjectPage();
        defloatTOC();

        disableIcons();

        skipEventCalendar();

        areWeMobileYet = true;
    }

    $(document).ready(function() {


        // Detect if we need to run mobile mangle and do it only once
        if(isMobile()) {
            mobilize();
        }

        // Also go mobile when browser window is shrinked
        // note that this is
        $(window).resize(function() {
            if(isMobile()) {
                mobilize();
            }
        });

    });

})(jQuery);