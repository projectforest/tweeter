/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

function timeSince(date) {

  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    return `${interval} year(s) ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} month(s) ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} day(s) ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour(s) ago`;
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute(s) ago`;
  }
  //fixed bug -1 second
  return `${Math.floor(seconds+1)} second(s) ago`;
}

$(document).ready(() => {

  

  // precondition take in tweet object, returns single tweet article HTML
  function createTweetElement(tweet) {

    // function escape(str) {
    //   let p = $('<p>').text(str);
    //   return p[0].innerHTML;
    // }
    // recursion for escaping entire tweet
    // function sanitize(obj) {
    //   for(let key in obj) {
    //     if(obj.hasOwnProperty(key)) {
    //       if(obj[key].constructor === Object) {
    //         sanitize(obj[key]);
    //       } else if (obj[key].constructor === String) {
    //         obj[key] = escape(obj[key]);
    //       }
    //     }
    //   }
    // }
    // sanitize(tweet);

    const createdAt = timeSince(tweet.createdAt);

    let avatar = $('<img>').addClass('avatar').attr('src', tweet.user.avatars.small);
    let user = $('<h1>').addClass('user').text(tweet.user.name);
    let handle = $('<p>').addClass('handle').text(tweet.user.handle);
    let header = $('<header>').addClass('header').append(avatar, user, handle);

    let content = $('<p>').addClass('body').text(tweet.content.text);

    let date = $('<p>').addClass('date').text(createdAt);
    let iHeart = $('<i>').addClass('fa fa-heart icon').attr('aria-hidden', 'true');
    let iFlag = $('<i>').addClass('fa fa-flag icon').attr('aria-hidden', 'true');
    let iRetweet = $('<i>').addClass('fa fa-retweet icon').attr('aria-hidden', 'true');
    let footer = $('<footer>').addClass('footer clearfix').append(date, iHeart, iFlag, iRetweet);
    let article = $('<article>').addClass('tweet').attr('data-tweet-id', tweet._id).append(header, content, footer);

    return article;
  }

  // precondition list of tweets objects, appends tweets to .tweets container in index.html
  function renderTweets(tweets) {
    for(let tweet of tweets) {
      $('.tweets').append(createTweetElement(tweet));
    }
  }

  // GETs JSON data from /tweets route
  // passes result to renderTweets()
  function loadTweets() {
    $.getJSON('tweets')
     .then(function(tweets) {
       renderTweets(tweets);
     });
  }

  loadTweets();

  // handles toggling of new-tweet section
  function toggleHandler() {
    $('#nav-bar .compose').on('click', function() {
      $('section.new-tweet').slideToggle('fast', function() {
        $(this).find('.input').focus();
      });
    });
  }
 
  toggleHandler();

  function submitHandler() {
    const form = $('.new-tweet .tweet-form');
    const error = form.find('.error');
    const input = form.find('.input');
    const button = form.find('.submit');
    const counter = form.find('.counter');

    // posts to /tweets, displays tweet when successful
    function postTweet() {
      $.post('tweets', form.serialize())
       .then(function(tweet) {
         $('.tweets').prepend(createTweetElement(tweet));
         input.val('').focus();
         counter.text(140);
       });
    }

    //check for input when exceed limit
    const errorTypes = {
      empty: {
        conditions:
          () => {
            return [input.val().trim() === '', input.val() === null];
          },
        message: 'Error: Input cannot be empty'
      },
      exceeds: {
        conditions:
          () => {
            return [140 - input.val().length < 0];
          },
        message: 'Error: Input exceeds 140 characters'
      }
    };
    const errors = {
      show:
        () => {
          error.text('');
          for(type in errorTypes) {
            for(let c of errorTypes[type].conditions()){
              if(c) {
                error.text(errorTypes[type].message);
                return true;
              }
            }
          }
          return false;
        },
      hide:
        () => {
          error.text('');
        }
    };

    // display error in text area according 
    $(input).on('input', () => {
      errors.show();
    });

    // prevent enter key from pressed
    $(input).on('keypress', event => {
      event.key !== 'Enter' || event.preventDefault();
    });

    $(input).on('blur', () => {
      errors.hide();
    });

    $(button).on('click', () => {
      errors.show();
    });

    // submits form if user enters while in text area
    $(input).on('keydown', event => {
      errors.show() || event.key !== 'Enter' || postTweet();
    });


    $(form).on('submit', event => {
      event.preventDefault();
      errors.show() || postTweet();
    });

  }
  submitHandler();

  function likeHandler() {
    $('.tweets').on('click', '.fa-heart', function() {
      const heart = $(this);
      // if(heart.hasClass('liked')) {
      //   heart.removeClass('liked');
      //   heart.css('color', '');
      // } 
      // else {
      //   heart.addClass('liked');
      //   heart.css('color', 'red');
      // }
      let tweetID = heart.closest('.tweet').data('tweet-id');
      $.post('tweets/' + tweetID).then(function(err, res) {
        if(err) {
          console.log(err);
        }
        console.log(res);
      });
    });
  }
  likeHandler();

});