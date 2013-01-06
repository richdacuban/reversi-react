// wait for images to finish
$(window).bind('load', function() {
    $('.clock').html(timeString());
    setInterval(function() {
        $('.clock').html(timeString());
    }, 1000);

    // set the iPad screen width
    var iPadWidth = $('.ipad').width();
    var pageWidth = iPadWidth*.8095;
    $screen = $('.screen');
    $screen.width(pageWidth).height(.973*pageWidth*3/4);

    // prime the FSM (show the table of contents)
    $toc = $('.toc');
    $toc.css({
        top: '0px',
        left: '0px'
    }).show();

    // pass the clicks through to the FSM
    $('.screen img').click(function(e) {
        fsm.handleClick($(this), e);
    });
});

// an FSM object to handle all the state transitions
var fsm = {
    state: 'toc',

    // handles a click on the given object with the given event
    handleClick: function ($this, e) {
        // get the click coords
        var x, y;
        if (e.offsetX !== undefined) {
            x = e.offsetX
            y = e.offsetY
        }
        // fucking Firefox
        else {
            var targetOffset = $(e.target).offset();
            x = e.pageX - targetOffset.left;
            y = e.pageY - targetOffset.top;
        }

        // convert to percentage values
        x = x/$this.width();
        y = y/$this.height();

        // yay for FSMs!!!
        switch (this.state) {
            // table of contents
            case 'toc':
                // to fridge
                if (x.between(.894, .993) && y.between(.034, .175)) {
                    // hide and show
                    $this.hide();
                    $('.fridge').show();

                    // state
                    this.state = 'fridge';
                }
                // to recipe 1
                else if (x.between(.243, .401) && y.between(.524, .71)) {
                    this.recipe1init(e);
                }

                // to recipe 2
                else if (x.between(.467, .658) && y.between(.721, .98)) {
                    console.log('recipe 2!!');
                }
                break;

            // fridge
            case 'fridge':
                // to toc
                if (x.between(.797, .951) && y.between(.121, .19)) {
                    $this.hide();
                    $('.toc').show();
                    this.state = 'toc';
                }
                // to recipe 1
                else if (x.between(.172, .419) && y.between(.231, .558)) {
                    console.log('recipe 1!!');
                }
                break;

            // recipe 1 (see no speak no cookies)
            case 'recipe-1':
                // click handlers

                break;

            // recipe 2 (hot, sweet, and sticky)
            case 'recipe-2':
                break;
        }
    },

    // initializes all elements and handlers for recipe 1
    recipe1init: function(e) {
        // hide and show
        $('.screen img').hide();
        var $recipe1 = $('.recipe-1')
        .css({
            top: '0px',
            left: '0px'
        }).show();
        var $recipe2pre = $('.recipe-2-preview')
        .css({
            top: '0px',
            left: $recipe1.width() + 'px'
        }).show();
        var $recipe2 = $('.recipe-2')
        .css({
            top: '0px',
            left: $recipe1.width() + 'px'
        });

        // initialization
        this.state = 'recipe-1';
        var $screen = $('.screen').addClass('scrollable');

        // handle scrolling
        $screen.scroll(function(e) {
            // proceed to recipe 2
            if ($recipe2pre.width() - e.currentTarget.scrollLeft < 2) {
                $screen.removeClass('scrollable');
                $recipe2.show();
                $recipe2pre.hide();
                $screen.animate({
                    scrollLeft: 0,
                    scrollTop: 0
                }, 2000);
                $recipe1.animate({
                    left: '-' + $recipe1.width() + 'px'
                }, 2000, function() {
                    $recipe1.hide();
                });
                $recipe2.animate({
                    left: '0px'
                }, 2000, function() {
                    fsm.state = 'recipe-2';
                    $screen.unbind('scroll');
                });
            }

            // hide the preview (disallow horizontal scrolling) when scrolled too far down
            else if (!$screen.hasClass('vertical') && (e.currentTarget.scrollTop >= $recipe2pre.height() - $('.screen').height())) {
                $screen.removeClass('scrollable').addClass('vertical');
                $screen.animate({
                    scrollLeft: 0
                }, 'fast');
            }

            // show the preview (allow horizontal scrolling) when scrolled high enough
            else if (!$screen.hasClass('scrollable') && (e.currentTarget.scrollTop < $recipe2pre.height() - $('.screen').height())) {
                $screen.removeClass('vertical').addClass('scrollable');
            }
        });
    },

    recipe2init: function() {

    }
}

// returns an iDevice-style time string
function timeString() {
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var amPm;
    if (hours > 12) {
        amPm = 'PM';
        hours -= 12;
    } else
        amPm = 'AM';

    if (hours == 0)
        hours = 12;

    return hours + ':' + minutes + ' ' + amPm;
}

// shorthand comparator
Number.prototype.between = function(lower, upper) {
    return this.valueOf() > lower && this.valueOf() < upper;
}