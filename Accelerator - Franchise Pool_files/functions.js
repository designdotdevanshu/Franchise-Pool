/**
 * JS Functionality 
 *
 * Provides helper functions to enhance the theme experience.
 */

var $ = jQuery;
var emailfilter = /^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i;
var hash;

var siteURL = get_hostname(document.location.href); // + '/tool-foundry';
var ajaxURL = siteURL + '/wp-admin/admin-ajax.php';

var windowWidth;
var containerWidth;

var scrollSpeed = 50; // speed in milliseconds
var current = 0; // set the default position
var direction = 'h'; // set the direction
var scrollOffset = -60;
var deviceName = '';

var impactSliderLoaded = false;
//var $bxsliderCommittee;

var screen_md = 840;
var screen_sm = 720;


// journal page ajax
var $articlesList;
var $articlesFilters;
var cat = '';
var paged = 1;
var ajaxInProcess = false;


( function( $ ) {
  
  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  };
  
  
  $.fn.equalizeHeights = function(){
    return this.height( Math.max.apply(this, $(this).map(function(i,e){return $(e).height()}).get() ) )
  }
  var showLoading = function() {
    $('#page').append('<div class="spinner__wrapper"><div class="spinner"></div></div>');
  }
  var hideLoading = function() {
    if($('.spinner__wrapper').length > 0) $('.spinner__wrapper').remove();
  }
  
  function scrollToElement(selector, time, verticalOffset, callback) {
    time = typeof(time) != 'undefined' ? time : 500;
    verticalOffset = typeof(verticalOffset) != 'undefined' ? verticalOffset : 0;
    element = $(selector);
    offset = element.offset();
    offsetTop = offset.top + verticalOffset;
    t = ($(window).scrollTop() - offsetTop);
    if (t <= 0) t *= -1
    t = parseInt(t * .5);
    if (t < time) t=time
    if (t > 1500) t=1500
    $('html, body').animate({
      scrollTop: offsetTop
    }, t, 'easeInOutCirc', callback);
  } 

  /**
  * Returns a random integer between min and max
  * Using Math.round() will give you a non-uniform distribution!
  */
  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  
  //Close Toggle Menu
  function closeToggleMenu(){
    var $pageSlide = $('.pageSlide');
    $pageSlide.stop().animate({ 'right': '-100%' }, 400);
    $pageSlide.removeClass('open');
  }
  
//  https://www.codementor.io/lautiamkok/js-tips-creating-a-simple-parallax-scrolling-with-css3-and-jquery-efp9b2spn
  function isInViewport(node, offset) {
    var  offset = offset || 0;
    var rect = node.getBoundingClientRect()
    return (
      (rect.height > 0 || rect.width > 0) &&
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      (rect.top + offset) <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }
  
  $.fn.isInViewport = function(offset=0.5) {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    
    var triggerOffset = parseInt($(window).height() * offset);
    return elementBottom > viewportTop && (elementTop+triggerOffset) < viewportBottom;
  };
  
  function inView(el) {
    var  offset = offset || 0;
    
    return (
      (rect.height > 0 || rect.width > 0) &&
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      (rect.top + offset) <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }
  
  
  function copyEmailToClipboard(str) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(str).select();
    document.execCommand("copy");
    $temp.remove();
  }
  
  function ajaxJournalData() {
    ajaxInProcess = true;
    ajaxLinkURL = ajaxURL+'?action=tf_journal_tiles';
//    ajaxURL = 'http://localhost:8888/tool-foundry/wp-admin/admin-ajax.php?action=tf_journal_tiles';
    $.ajax({
      url: ajaxLinkURL,
      type: 'POST',
      action : '',
      data: {'cat': cat, 'paged': paged},
      success: function(result) {
//        alert(JSON.stringify(result.data))
        if(result.success==1){
          var data = result.data;
          $articlesList.empty();
          if(data){
            $articlesList.append(data);
          }
          hideLoading();
          ajaxInProcess = false;
        } else { //Print error msg
          hideLoading();
          alert(result.message);
          ajaxInProcess = false;
        }
      },
      error: function(e) {
        hideLoading();
        alert('Error while fetching results.');
        ajaxInProcess = false;
      }
    });
  }
  
  
  var body    = $( 'body' ), _window = $( window );
 
  ( function() {
    var $pageSlide = $('.pageSlide');
    // Menu Toggle on small screen sizes
    var $navigation = $('#site-navigation');
    if($navigation.length > 0) {
      var isOpen = 0;
      var $pageSlide = $('.pageSlide');
      var pageSlideWidth = parseInt($pageSlide.width()) + 100;
      $toggleMenuContent = '<div class="toggle-container">';
      $toggleMenuContent += $navigation.html();
      $toggleMenuContent += '</div>';
      $pageSlide.html($toggleMenuContent);
      
      $('.menu-toggle').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).toggleClass('menu-toggle--active');
        if( $pageSlide.hasClass('open') ){
          $pageSlide.stop().animate({ 'right': '-'+pageSlideWidth+'px' }, 400);
        } else {
          $pageSlide.stop().animate({ 'right': '0' }, 400);
        }
        $pageSlide.toggleClass('open');
      });
    }
    
    $(document).on('click', function closeMenu(e){
      if( !$(e.target).hasClass('open') && $(e.target).attr('id')!="s") {
        if( $pageSlide.hasClass('open') ){
          var pageSlideWidth = parseInt($pageSlide.width()) + 100;
          $('.menu-toggle').toggleClass('menu-toggle--active');
          $pageSlide.stop().animate({ 'right': '-'+pageSlideWidth+'px' }, 400);
          $pageSlide.toggleClass('open');
        }
      }
    });
    
    $('a[href^="mailto:"]').each(function() {
      var $item = $(this);
      $item.click(function(e) {
        e.preventDefault();
        var email = $item.attr('href');
        email = email.replace('mailto:', '')
        copyEmailToClipboard(email);
        alert('Email address copied to clipboard');
      });
    });
//
//
//    
//    
//    if($('.copy-email').length > 0) {
//      $('.copy-email').each(function() {
//        $(this).click(function(e) {
//          
//          var email = $(this).data('email');
//          if(!(email) || email=='') {
//            email = 'hello@toolfoundry.org';
//          }
//          copyEmailToClipboard(email);
//          alert('Email address copied to clipboard');
//        });
//      });
//    }
    
    wow = new WOW({
      boxClass: 'wow', // default
      animateClass: 'animated', // default
      offset: 0, // default
      mobile: true, // default
      live: true, // default
    }).init();
    
    if($('.sticky-header').length > 0) {
      scrollOffset = -90;
      $('.sticky-header').sticky({topSpacing:60, zIndex: 999});
    }
    if($('#sticky-sidebar').length > 0) {
      scrollOffset = -75;
      if($('.page-template-default').length > 0) {
        $('#sticky-sidebar').stickySidebar({
          topSpacing: 100,
          bottomSpacing: 120,
          containerSelector: '.main-content',
          innerWrapperSelector: '.sidebar__inner',
          minWidth: screen_sm
        });
      } else {
        $('#sticky-sidebar').stickySidebar({
          topSpacing: 100,
          bottomSpacing: 120,
          containerSelector: '.main-content',
          innerWrapperSelector: '.sidebar__inner',
          minWidth: screen_md
        });
      }
    }
    
    if($('.slider').length > 0) {
      $('.slider .bxslider').bxSlider({
        speed: 800,
        auto: true,
        pager: true,
        controls: true,
        stopAutoOnClick: false,
        pause: 6000,
        autoHover: true,
        infiniteLoop: false,
        hideControlOnEnd: true,
//        easing: 'easeInOut',
        slideSelector: 'div.slide'
      });
    }
    
    $(window).scroll(function() {
      if($('.home-impact-stories').length > 0) {
        $('.home-impact-stories').each(function() {
          var $wrapper = $(this);
          var $slider = $('.bxslider', $wrapper);
          if($(this).isInViewport(.25) && !(impactSliderLoaded)) {
            impactSliderLoaded =  true;
            $slider.bxSlider({
              speed: 800,
              mode: 'fade',
              auto: true,
              pager: false,
              controls: true,
              stopAutoOnClick: true,
              pause: 6000,
              autoHover: true,
              slideSelector: 'div.slide',
              onSlideNext: function($slideElement, oldIndex, newIndex){
                $oldSlideElement = $('.home-impact-stories slide:eq('+oldIndex+')');
                $('.t2, .t4', $oldSlideElement).hide();
                $('.t2, .t4', $slideElement).addClass('s2 fadeInLeft');

              },
              onSliderLoad: function(c) {
                $currentSlideElement = $('.slide:eq(0)', $slider);
                $('.t2, .t4', $currentSlideElement).addClass('s2 fadeInLeft');
              }
            });
          }
        });
      }
    });
    
    if($('[data-bgimg-hero]').length > 0) {
      $('[data-bgimg-hero]').each(function() {
        var $hero = $(this);
        var hero_bgimg = $hero.attr('data-bgimg-hero');
        $('<img/>').attr('src', hero_bgimg).on('load', function() {
          $(this).remove(); // prevent memory leaks as @benweet suggested
          $hero.css('background-image', 'url('+hero_bgimg+')');
          window.setTimeout(function() {
            $('.logo-hero').addClass('logo-anim');
          }, 500);
          
        });
      });
    }
    
    if($('[data-bgimg]').length > 0) {
      $('[data-bgimg]').each(function() {
        bgimg = $(this).attr('data-bgimg');
        $(this).css({
          'background-image': 'url('+bgimg+')'
        });
      });
    }
    
    
    $('.btn-view-top').click(function(e) {
      e.preventDefault();
      scrollToElement($('body'), 600, -55);
    });
    
    
    
    if($('body').hasClass('device-tablet')) {
      deviceName = 'tablet';
    }
    
    if(window.location.hash) {
      hash = window.location.hash.replace(/^.*#/, ''); 
      if(hash != ''){
        if($("#"+hash).length > 0){
            scrollToElement($("#"+hash), 800, scrollOffset);
        }
        if($("a[name='"+hash+"']").length > 0){
            scrollToElement($("a[name='"+hash+"']"), 800, scrollOffset);
        }
      }
    }
    
    //Rules Sidebar Menu
    if($('.interlinks-menu').length > 0){
      $('.interlinks-menu a').on('click', function(e){
        $name = $(this).attr("href");
        $scrollTo = $name.replace("#", "");

        if($("#"+$scrollTo).length > 0){
          scrollToElement($("#"+$scrollTo), 800, scrollOffset);
        } else if ($("a[name='"+$scrollTo+"']").length > 0){
          scrollToElement($("a[name='"+$scrollTo+"']"), 800, scrollOffset);
        }
      });
    }
    
    //Additional Resources page - Interlinks
    if($('.interlink').length > 0){
      $('.interlink').on('click', function(e){
        e.preventDefault();
        $name = $(this).attr("href");
        $scrollTo = $name.replace("#", "");

        if($("#"+$scrollTo).length > 0){
          scrollToElement($("#"+$scrollTo), 800, scrollOffset);
        } else if ($("a[name='"+$scrollTo+"']").length > 0){
          scrollToElement($("a[name='"+$scrollTo+"']"), 800, scrollOffset);
        }
      });
    }
    
    if($('.page-navigation').length > 0) {
      $('.page-navigation').each(function() {
        var $wrapper = $(this);
        var $list = $('ul', $wrapper);
        var $pointer = $('.pointer', $wrapper);
        var pw = $pointer.width();
        $('a', $list).each(function() {
          var $item = $(this);
          $item.click(function(e) {
            e.preventDefault();
            $name = $item.attr("href");
            $scrollTo = $name.replace("#", "");

            if($("#"+$scrollTo).length > 0){
              scrollToElement($("#"+$scrollTo), 800, scrollOffset);
            } else if ($("a[name='"+$scrollTo+"']").length > 0){
              scrollToElement($("a[name='"+$scrollTo+"']"), 800, scrollOffset);
            }
          });
        });
      });
    }
    
    
    if($('.link-modal-partners').length > 0) {
      var slideNo = 0;
      $('#modal-partners').modal('hide');
      $('.link-modal-partners').on('click', function(e){
        e.preventDefault();
        var $item = $(this);
        slideNo = $item.data('slide');
        $('#modal-partners').modal({ show: 'true' });
      });
      
      $('#modal-partners').on('shown.bs.modal', function (e) {
        var $bxslider = $('.bxslider', $(this));
        $bxslider.bxSlider({
          startSlide: slideNo,
          controls: true,
          pager: false,
          pause: 500,
          speed: 800,
          nextText: '<i class="icon icon-angle-right"></i>',
          prevText: '<i class="icon icon-angle-left"></i>'
        });
      });
    }
    
//    if($('.link-modal-examples').length > 0) {
//      var slideNo = 0;
//      $('#modal-examples').modal('hide');
//      $('.link-modal-examples').on('click', function(e){
//        e.preventDefault();
//        var $item = $(this);
//        slideNo = $item.data('slide');
//        $('#modal-examples').modal({ show: 'true' });
//      });
//      
//      $('#modal-examples').on('shown.bs.modal', function (e) {
//        var $bxslider = $('.bxslider', $(this));
//        var options = {
//          startSlide: slideNo,
//          controls: true,
//          pager: false,
//          pause: 500,
//          speed: 800,
//          adaptiveHeight: true,
//          nextText: '<i class="icon icon-angle-right"></i>',
//          prevText: '<i class="icon icon-angle-left"></i>'
//        };
//        if ($bxslider.parent().hasClass('bx-viewport')){
//          $bxslider.destroySlider();
//          $bxslider.reloadSlider(options);
//        } else {
//          $bxslider.bxSlider(options);
//        }
//      });
//    }
    
    if($('.link-modal-committee').length > 0) {
      var $bxsliderCommittee = $('#modal-committee .bxslider');
      var slideNo = 0;
      $('#modal-committee').modal('hide');
      $('.link-modal-committee').on('click', function(e){
        e.preventDefault();
        var $item = $(this);
        slideNo = $item.data('slide');
        $('#modal-committee').modal({ show: 'true' });
      });

      $('#modal-committee').on('hidden.bs.modal', function (e) {
        $bxsliderCommittee.destroySlider();
      });


      $('#modal-committee').on('shown.bs.modal', function (e) {
        var options = {
          startSlide: slideNo,
          controls: true,
          pager: false,
          pause: 500,
          speed: 800,
          nextText: '<i class="icon icon-angle-right"></i>',
          prevText: '<i class="icon icon-angle-left"></i>'
        };
        $bxsliderCommittee.bxSlider(options);
      });
    }
    
    
//    if($('.link-about-modal').length > 0){
//      var slideNo = 0;
//      $('#siteModal').modal('hide');
//      
//      $('.link-about-modal').on('click', function(e){
//        e.preventDefault();
//        var $item = $(this);
//        slideNo = $item.data('slide');
//        $('#siteModal').modal({ show: 'true' }); //Open Modal
//      });
//      
//      
//      $('#siteModal').on('shown.bs.modal', function (e) {
//        var $bxslider = $('.bxslider', $(this));
//        $bxslider.bxSlider({
//          startSlide: slideNo,
//          controls: true,
//          pager: false,
//          pause: 500,
//          speed: 800,
//          nextText: '<i class="icon icon-angle-right"></i>',
//          prevText: '<i class="icon icon-angle-left"></i>'
//        });
//      });
//    }
    
    if($('.journal-slider').length > 0) {
      if($('.journal-slider li').length > 1) {
        $('.journal-slider .bxslider').bxSlider({
          speed: 800,
          auto: true,
          pager: true,
          controls: true,
          stopAutoOnClick: false,
          pause: 6000,
          autoHover: true,
        });
      }
    }
    
    
    
    
    
    $(window).scroll(function() {
      var scrolled = $(window).scrollTop()
      $('.parallax').each(function(index, element) {
        var initY = $(this).offset().top;
        var height = $(this).height();
        var endY  = initY + $(this).height();

        // Check if the element is in the viewport.
        var visible = isInViewport(this);
        if(visible && $(window).width() >= screen_md) {
          var diff = scrolled - initY
          var ratio = Math.round((diff / height) * 100)
          $(this).css('background-position','center ' + (parseInt(-(ratio * .5)-height) + 'px'))
        }
      });
      
      if($('#sticky-sidebar').length > 0) {
        $('a[name]').each(function(index, element) {
          if($(this).isInViewport()) {
            var $sidebar = $('#sticky-sidebar');
            $('li', $sidebar).removeClass('active');
            var $li = $('a[href="#'+$(this).attr('name')+'"]').parents('li');
            $li.addClass('active');
          }
        });
      }
      if($('.page-navigation').length > 0) {
        $('a[name]').each(function(index, element) {
          if($(this).isInViewport()) {
            var $navigation = $('.page-navigation');
            $('li', $navigation).removeClass('active');
            
            var $li = $('a[href="#'+$(this).attr('name')+'"]').parents('li');
            if($li.length > 0) {
              var $pointer = $('.pointer', $navigation);
              var pw = $pointer.width();
              w = parseInt($li.width());
              pl = parseInt($li.position().left);
              np = pl+((w-pw)/2);
              $pointer.css({'left': np+'px', 'opacity': '1'});
            }
          }
        });
      }
      
    });
    
    $(window).resize(function() {
      if($(window).width() >= 992 ){
        if( $pageSlide.hasClass('open') ){
          var pageSlideWidth = parseInt($pageSlide.width()) + 100;
          $('.menu-toggle').toggleClass('menu-toggle--active');
          $pageSlide.stop().animate({ 'right': '-'+pageSlideWidth+'px' }, 400);
          $pageSlide.toggleClass('open');
        }
      }
    });
    
    
    //Resize Home bottom section columns
    if($('#bottom-sections').length > 0){
      $('#bottom-sections .col-text').equalizeHeights();
      $(window).resize(function(){
        $('#bottom-sections .col-text').equalizeHeights();
      });
    }
    
    if($('.invent').length > 0){
      if($(window).width() >= screen_md) {
        $('.invent, .connect').equalizeHeights();
      }
      $(window).resize(function(){
        if($(window).width() >= screen_md) {
          $('.invent, .connect').equalizeHeights();
        } else {
          $('.invent, .connect').css({'height': 'auto'});
        }
      });
    }
    
    
    
    if($('.articles-filter').length > 0) {
      $('.articles-filter').each(function() {
        $articlesFilters = $('.articles-filter');
        $articlesList = $('.articles-list');
        $('li', $articlesFilters).each(function() {
          var $item = $(this);
          $('a', $item).click(function(e) {
            e.preventDefault();
            if(ajaxInProcess) return false;
            if($item.hasClass('active')) return false;
            showLoading();
            cat = $item.data('term_id');
            paged = 1;
            ajaxJournalData(true);
            
            var newUrl = siteURL+"/journal/";
            if(cat && cat!=='undefined') {
              newUrl += "?cat="+cat;
            }
            window.history.replaceState(null, null, newUrl);
            
            
            $('.active', $articlesFilters).removeClass('active');
            $item.addClass('active');
          });
        });
        
        
        if($('.pagination').length > 0){
          $('.pagination a').live('click', function(e){
            e.preventDefault();
            if(ajaxInProcess) return false;
            showLoading();
            var $item = $(this);
            if($item.hasClass('next')){
              paged = paged + 1;
            } else if($item.hasClass('prev')){
              paged = paged - 1;
            } else {
              paged = parseInt($item.text());
            }
            
            var qs_paged = getUrlParameter('paged');
            var qs_cat = getUrlParameter('cat');
            var newUrl = siteURL+"/journal/page/"+paged+'/';
            if(qs_cat && qs_cat!=='undefined') {
              newUrl += "?cat="+qs_cat;
            }
            window.history.replaceState(null, null, newUrl);
            ajaxJournalData(false); //isReset
          });
        }
      });
    }
  } )();
} )( jQuery );

function get_hostname(url) {
  var m = ((url||'')+'').match(/^https?:\/\/[^/]+/);
  return m ? m[0] : null;
}