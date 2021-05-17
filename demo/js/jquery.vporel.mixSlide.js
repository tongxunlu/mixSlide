/*
	Easing properties
	*FADE : nothing
	*SLIDE:
		- direction : horizontal
	*SLICE:
		- direction : horizontal
		- count : 2
	
*/

(function($){
	$.fn.mixSlide = function(opt){
		const BOTTOM_POS = "bottom",
			TOP_POS = "top",
			LEFT_POS = "left",
			RIGHT_POS = "right";
		const FADE_EASE = "fade",
			SLIDE_EASE = "slide",
			SLICE_EASE = "slice",
			EASINGS = [FADE_EASE, SLIDE_EASE, SLICE_EASE];
		const FORWARD = "forward",
			BACKWARD = "backward";
		const VERTICAL_DIR = "vertical",
			HORIZONTAL_DIR = "horizontal",
			SKEW_1_DIR = "skew1";
			SKEW_2_DIR = "skew2";
		const CONTROLS_PREV_CODE = "&#10094",
			CONTROLS_NEXT_CODE = "&#10095",
			CONTROLS_PAUSE_CODE = "&#9208",
			CONTROLS_PLAY_CODE = "&#9205";
		const PAUSE_STATE = "pause",
			PLAY_STATE = "play";

		var defaults = {
			animation:{
				speed:1,
				delay:3
			},
			easing : {
				name : SLIDE_EASE,
				direction : HORIZONTAL_DIR
			},
			autoplay : true,
			controls : {
				active :false,
				position : TOP_POS
			},
			thumbs : {
				active : false,
				position : BOTTOM_POS
			},
			labels:true
		}
		let options = $.extend(true, defaults, opt);
		//Checking the integrity of the parameters
		options.animation.speed = options.animation.speed*1000;
		options.animation.delay = options.animation.delay*1000;
		if(EASINGS.indexOf(options.easing.name) != -1){
			if(options.easing.name == SLIDE_EASE){
				if(typeof options.easing.direction == "undefined")
					options.easing.direction = HORIZONTAL_DIR;
			}else if(options.easing.name == SLICE_EASE){
				if(typeof options.easing.direction == "undefined")
					options.easing.direction = HORIZONTAL_DIR;
				if(typeof options.easing.count == "undefined" || isNaN(options.easing.count))
					options.easing.count = 2;
			}
		}else{
			options.easing.name = FADE_EASE;
		}
		//End checking
		let $obj = $(this);
		this.each(function(){
			let images = [];
			let $imageDivs = $obj.find('div');
			for(let i = 0;i<$imageDivs.length;i++){
				$imageDivs.eq(i).addClass("mixSlide-image");
				images.push({
					src:$imageDivs.eq(i).find('img').attr('src'),
					label : $imageDivs.eq(i).find('p').text()
				});
			}
			$obj.find('.mixSlide-image').wrapAll('<div id="mixSlide-images"></div>');
			$obj.find('#mixSlide-images').wrap('<div id="mixSlide-container"></div>');
			let $container = $obj.find('#mixSlide-container'),
				$images = $container.find('#mixSlide-images');
			$imageDivs.css('z-index','0').hide(-1);
			$imageDivs.eq(0).show(-1).css('z-index','1');
			let currentImageIndex = 0,
				lastImageIndex = images.length - 1;
				
			if(options.thumbs.active){
				let thumbs_code = '<div id="mixSlide-thumbs" class="'+options.thumbs.position+'">';
				for(let i = 0; i < images.length; i++){
					thumbs_code += '<span class="mixSlide-thumb"data-image-index="'+i+'"><img src="'+images[i].src+'"/></span>';
				}
				thumbs_code += "</div>";
				$container.append(thumbs_code);
				$container.find('#mixSlide-thumbs span').click(function(){
					let indexImage = parseInt($(this).attr('data-image-index'));
					if(indexImage > currentImageIndex)
						changeImage(FORWARD, indexImage);
					else if(indexImage < currentImageIndex)
						changeImage(BACKWARD, indexImage);
				});
			}

			$container.append('<div id="mixSlide-controls" class="'+options.controls.position+'"></div>');
			let $controls = $container.find("#mixSlide-controls");

			if(options.controls){
				//Petits boutons de controls
				let controls_code = '\
					<div id="mixSlide-slide-buttons">\
						<span id="mixSlide-prev">'+CONTROLS_PREV_CODE+'</span>\
						<span id="mixSlide-next">'+CONTROLS_NEXT_CODE+'</span>\
						<span id="mixSlide-slide-state" data-state="'+PAUSE_STATE+'">'+CONTROLS_PLAY_CODE+'</span>\
					</div>';
				$controls.append(controls_code);
				if(!options.thumbs.active){
					let points_code = '<div id="mixSlide-points">';
					for(let i = 0; i < images.length; i++){
						points_code += '<span class="mixSlide-point"data-image-index="'+i+'"></span>';
					}
					points_code += "</div>";
					$controls.append(points_code);
					$controls.find('#mixSlide-points span').click(function(){
						let indexImage = parseInt($(this).attr('data-image-index'));
						if(indexImage > currentImageIndex)
							changeImage(FORWARD, indexImage);
						else if(indexImage < currentImageIndex)
							changeImage(BACKWARD, indexImage);
					});
				}
				$controls.find('#mixSlide-prev').click(function(){changeImage(BACKWARD);});
				$controls.find('#mixSlide-next').click(function(){changeImage(FORWARD);});
			}
			function changeImage(dir, nextImageIndex = -1){
				if(nextImageIndex == -1){
					nextImageIndex = currentImageIndex+1;
					if(dir == BACKWARD){
						nextImageIndex = currentImageIndex-1;
						if(nextImageIndex < 0){
							nextImageIndex = lastImageIndex;
						}
					}
					if(dir == FORWARD && nextImageIndex > lastImageIndex){
						nextImageIndex = 0;
					}
				}
				//Variables for animation
				let currentTemp = currentImageIndex, nextTemp = nextImageIndex;
				let easing = options.easing;
				if(easing.name == FADE_EASE){
					$imageDivs.eq(nextTemp).css("z-index", "1").fadeIn(options.animation.speed);
					$imageDivs.eq(currentTemp).fadeOut(options.animation.speed).css("z-index", "0");
				}else if(easing.name == SLIDE_EASE){
					let animated_property_forward = {left:"-100%"},
						animated_property_backward = {left:"0"};
					if(easing.direction == VERTICAL_DIR){
						animated_property_forward.left = "0";
						animated_property_forward.top = "-100%";
						animated_property_backward.top = "0";
					}else if(easing.direction == SKEW_1_DIR){
						animated_property_forward.top = "-100%";
						animated_property_backward.top = "0";
					}else if(easing.direction == SKEW_2_DIR){
						animated_property_forward.bottom = "-100%";
						animated_property_backward.bottom = "0";
					}
					if(dir == FORWARD){
						$imageDivs.eq(nextTemp).show(-1);
						$imageDivs.eq(currentTemp).animate(animated_property_forward, 
							options.animation.speed, function(){
								$(this).css({"z-index":"0"}).css(animated_property_backward).hide(-1);
								$imageDivs.eq(nextTemp).css("z-index", "1");
							}
						);
					}else{
						$imageDivs.eq(currentTemp).css({"z-index":"0"});
						$imageDivs.eq(nextTemp).css(animated_property_forward).css({"z-index":"1"}).show(-1);
						$imageDivs.eq(nextTemp).animate(animated_property_backward, 
							options.animation.speed, function(){
								$imageDivs.eq(currentTemp).hide(-1);
							}
						);
					}
				}else if(easing.name == SLICE_EASE){
					let animated_even_forward = {left:"-100%"},
						animated_odd_forward = {left:"100%"},
						animated_backward = {left:"0"},
						image_changed_property = "height",
						div_margin_changed = "top";
					if(easing.direction == VERTICAL_DIR){
						animated_even_forward = {top:"-100%"};
						animated_odd_forward = {top:"100%"};
						animated_backward = {top:"0"};
						image_changed_property = "width";
						div_margin_changed = "left";
					}
					let imageIndex = (dir == FORWARD) ? currentTemp : nextTemp;
					// Div over
					$images.find('#mixSlide-div-over').remove();
					$images.append('<div id="mixSlide-div-over"></div>');
					let $divOver = $images.find('#mixSlide-div-over');
					for(let i = 0;i<options.easing.count;i++){
						$divOver.append('\
							<div class="mixSlide-div-clip slice '+options.easing.direction+'" data-number="'+i+'">\
								<img src="'+images[imageIndex].src+'"/>\
							</div>'
						);
					}
					let size = (100/easing.count);
					$divOver.find('div').each(function(){
						let number = parseInt($(this).attr('data-number'));
						let P1 = "0% "+number*size+"%",
							P2 = "100% "+number*size+"%",
							P3 = "100% "+((number+1)*size)+"%",
							P4 = "0% "+((number+1)*size)+"%";
						if(easing.direction == VERTICAL_DIR){
							P1 = number*size+"% 0%";
							P2 = number*size+"% 100%";
							P3 = ((number+1)*size)+"% 100%";
							P4 = ((number+1)*size)+"% 0%";
						}
						$(this).css('clip-path', 'polygon('+P1+','+P2+','+P3+','+P4+')');
						if(dir == FORWARD){
							$imageDivs.eq(nextTemp).css("z-index", "1").show(-1);
							$imageDivs.eq(currentTemp).hide(-1).css("z-index", "0");
							if(number%2 == 0){
								$(this).animate(animated_even_forward, options.animation.speed);
							}else{
								$(this).animate(animated_odd_forward, options.animation.speed);
							}
						}else{
							if(number%2 == 0){
								$(this).css(animated_even_forward);
								$(this).animate(animated_backward, options.animation.speed);
							}else{
								$(this).css(animated_odd_forward);
								$(this).animate(animated_backward, options.animation.speed, function(){
									$imageDivs.eq(currentTemp).css({"z-index":"0"}).hide(-1);
									$imageDivs.eq(nextTemp).css({"z-index":"1"}).show(-1);
								});
							}
						}
					});

				}
				currentImageIndex = nextImageIndex;
				refresh();
			}
			function refresh(){
				$controls.find('#mixSlide-points span').removeClass('active');
				$container.find('#mixSlide-points span').eq(currentImageIndex).addClass('active');
				$container.find('#mixSlide-thumbs span').removeClass('active');
				$container.find('#mixSlide-thumbs span').eq(currentImageIndex).addClass('active');
			}
			refresh();
			if(options.autoplay){
				function animation(){
					setTimeout(function(){
						changeImage(FORWARD);
						animation();
					}, options.animation.delay);
				}
				animation();
			}
		});
		return this;
	}
})(jQuery);