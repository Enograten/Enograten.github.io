$('.slider').slick({
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    adaptiveHeight: true
  });
 $('.slider-single').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.slider-nav'
  });
  $('.slider-nav').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.slider-single',
    dots: true,
  });


  $('.add_more .minus').click(function(){
    let countProduct = $('.add_more .value_2').val();
    if ( countProduct > 1) {
        countProduct--;
    }
    $('.add_more .value_2').val(countProduct)
  })
  $('.add_more .plus').click(function(){
    let countProduct = $('.add_more .value_2').val();
        countProduct++;
    $('.add_more .value_2').val(countProduct)
  })


  $('.tovar_value .minuss').click(function(){
    let countProduct = $(this).parent().find('.value').val();
    if ( countProduct > 1) {
        countProduct--;
    }
    $(this).parent().find('.value').val(countProduct);
    console.log(countProduct)
  })
  $('.tovar_value .pluss').click(function() {
    let countProduct = $(this).parent().find('.value').val();
    countProduct++;
    console.log(countProduct)
    $(this).parent().find('.value').val(countProduct);
  })
  AOS.init();