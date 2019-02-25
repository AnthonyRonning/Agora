'use strict';

//likes buttons
//we use localStorage to store information about liked posts. it's just for simulation of work likes.
$('.blog').on('click', '.blog__item-social--like', function () {
  
  let post = $(this).attr('data-post-id');
  console.log('post like', post);
  
  let like = $(this).context.innerText;
  like = parseInt(like.split(' ')[1]);
  let start ='<i class=\'mdi mdi-heart\'></i> ';
  let end = ' <span>likes</span>';
  
  if ($(this).hasClass('blog__item-social--active')) {
    $(this).removeClass('blog__item-social--active');
    like -= 1;
    localStorage.removeItem(post);
  } else {
    $(this).addClass('blog__item-social--active');
    like +=1;
    localStorage.setItem(post, post);
  }
  
  $(this).html(start + like + end);
  $(this).addClass('blog__item-social--clicked');
  
  var myVar;
  myVar = setTimeout(function () {
    $('.blog__item-social--clicked').removeClass('blog__item-social--clicked');
  }, 500)
});

//create posts' preview on blog page
$(function () {
  $.getJSON('posts.json', function (data) {
    
    //category filter
    if (getUrlVars()['category']) {
      data.post = $.grep(data.post, function (n, i) {
        return (n.type.toLowerCase() === getUrlVars()['category']);
      });
      
      $('.blog__filter-type').text('Category');
      $('.blog__filter-chosen').text(data.post[0].category);
    }
    
    let month = getUrlVars()['month'];
    let year = getUrlVars()['year'];
    
    if (month && year) {
      let date = new Date(month + ' ' + year);
      
      data.post = $.grep(data.post, function (n, i) {
        let postDate = new Date(n.date);
        return (postDate.getMonth() === date.getMonth() && postDate.getFullYear() === date.getFullYear());
      });
      
      $('.blog__filter-type').text('Archive');
      $('.blog__filter-chosen').text(month + ' ' + year);
    }
    
    // add blog list on page
    let page = getUrlVars()['p'] ? getUrlVars()['p'] : '1';
    let posts_amount = data.post.length;
    if (((posts_amount - 1) / 6).toString() <= page) {
      $('.blog__btn-prev').remove();
    }
    
    let posts = data.post.slice((page - 1) * 6, page * 6);
  
    $.each(posts, function (i, a) {
      let like = localStorage.getItem(a.id) ? ' blog__item-social--active' : '';
      let likes = localStorage.getItem(a.id) ? a.likes + 1 : a.likes;
      let blog_post = '<div class=\'blog__item card\'>' +
        '<a href=\'' + a.link + '\' class=\'blog__item-link\'/>' +
        '<div class=\'blog__item-img-wrap\'>' +
        '<div class=\'blog__item-img\' style=\'background-image: url(' + a.img + ')\'></div>' +
        '</div>' +
        '<div class=\'blog__item-content\'>' +
        '<a class=\'blog__item-content-category link link--accent\' href=\'13_blog_filter.html?category=' + a.type + '\'>' + a.category + '</a>' +
        '<p class=\'blog__item-content-date\'>' + a.date + '</p>' +
        '<h4 class=\'blog__item-content-title\'>' + a.title + '</h4>' +
        '<p class=\'blog__item-content-preview\'>' + a.preview + '</p>' +
        '<div class=\'blog__item-content-bottom\'>' +
        '<p class=\'blog__item-social\'><i class=\'mdi mdi-eye\'></i> ' + a.views + ' <span>views</span></p>' +
        '<a class=\'blog__item-social link link--accent\' href=\'' + a.link + '#comments\'><i class=\'mdi mdi-comment\'></i> ' + a.comments + ' <span>comments</span></a>' +
        '<a class=\'blog__item-social blog__item-social--like link link--accent' + like + '\' data-post-id=\''+ a.id +
        '\'><i class=\'mdi mdi-heart\'></i> ' + likes + ' <span>likes</span></a>' +
        '</div>' +
        '</div>' +
        '</div>';
      $(blog_post).appendTo('.blog__wrap');
    });
    
    if (page === '1') {
      $('.blog__btn-next').remove();
    }
  });
});

//page-btns logic
$('.blog__btn-prev').on('click', function (e) {
  e.preventDefault();
  let page = getUrlVars()['p'] ? getUrlVars()['p'] : '1';
  page = parseInt(page) + 1;
  
  let vars = getUrlVars();
  let link = '';
  $.each(vars, function (index) {
    if (index !== 'p')
      link += index + '=' + vars[index] + '&'
  });
  
  window.open('13_blog_filter.html?' + link + 'p=' + page, '_self')
});

$('.blog__btn-next').on('click', function (e) {
  e.preventDefault();
  let page = getUrlVars()['p'] ? getUrlVars()['p'] : '1';
  page = parseInt(page) - 1;
  
  let vars = getUrlVars();
  let link = '';
  $.each(vars, function (index) {
    if (index !== 'p')
      link += index + '=' + vars[index] + '&'
  });
  
  window.open('13_blog_filter.html?' + link + 'p=' + page, '_self')
});

function getUrlVars() {
  let vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}