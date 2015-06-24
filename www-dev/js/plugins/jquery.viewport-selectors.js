;(function($) {
    $.belowthefold = function(element, container, settings) {
        var fold = $(container).height() + $(container).scrollTop();
        return fold <= $(element).position().top - settings.threshold;
    };

    $.abovethetop = function(element, container, settings) {
        var top = $(container).scrollTop();
        return top >= $(element).position().top + $(element).height() - settings.threshold;
    };

    $.rightofscreen = function(element, container, settings) {
        var fold = $(container).width() + $(container).scrollLeft();
        return fold <= $(element).position().left - settings.threshold;
    };

    $.leftofscreen = function(element, container, settings) {
        var left = $(container).scrollLeft();
        return left >= $(element).position().left + $(element).width() - settings.threshold;
    };

    $.inviewport = function(element, container, settings) {
        return !$.rightofscreen(element, container, settings) && !$.leftofscreen(element, container, settings) && !$.belowthefold(element, container, settings) && !$.abovethetop(element, container, settings);
    };

    $.extend($.expr[':'], {
        "below-the-fold": function(a, i, m) {
            return $.belowthefold(a, window, {threshold : 0});
        },
        "above-the-top": function(a, i, m) {
            return $.abovethetop(a, window, {threshold : 0});
        },
        "left-of-screen": function(a, i, m) {
            return $.leftofscreen(a, window, {threshold : 0});
        },
        "right-of-screen": function(a, i, m) {
            return $.rightofscreen(a, window, {threshold : 0});
        },
        "in-viewport": function(a, i, m) {
            return $.inviewport(a, window, {threshold : 0});
        },
        "in-viewport-150": function(a, i, m) {
            return $.inviewport(a, window, {threshold : 150});
        }
    });

})(jQuery);
