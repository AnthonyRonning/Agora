$(function () {
  $('a[href^=\'#\']').on('click', function () {
    let target = $(this).attr('href');
    $('html, body').animate({scrollTop: $(target).offset().top - 64}, 800);
    return false;
  });
});