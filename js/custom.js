jQuery(document).ready(function($) {
	$('.box-post').click(function(){
		if( !$(this).hasClass('visibility')){
			$(this).addClass('visibility');
			elementClick = jQuery(this).children(".collapse");
			$(elementClick).slideDown();
		}else{
			$(this).removeClass('visibility');
			elementClick = jQuery(this).children(".collapse");
			$(elementClick).slideUp();
		}
	});
});