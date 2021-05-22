/*
	Easing properties
	*FADE : nothing
	*SLIDE:
		- direction : horizontal
	*SLICE:
		- direction : horizontal
		- count : 2
	*SQUARE:
		- count : 4
		- random : false
	*circle:
		- origin : center
	
*/

(function($){
	$.fn.mixSlide = function(opt){
		const BOTTOM_POS = "bottom",
			TOP_POS = "top",
			LEFT_POS = "left",
			RIGHT_POS = "right",
			CENTER_POS = "center",
			TOP_LEFT_POS = "top-left",
			TOP_RIGHT_POS = "top-right",
			BOTTOM_LEFT_POS = "bottom-left",
			BOTTOM_RIGHT_POS = "bottom-right";
		const FADE_EASE = "fade",
			SLIDE_EASE = "slide",
			SLICE_EASE = "slice",
			SQUARE_EASE = "square",
			CIRCLE_EASE = "circle",
			EASINGS = [FADE_EASE, SLIDE_EASE, SLICE_EASE, SQUARE_EASE, CIRCLE_EASE];
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
			}else if(options.easing.name == SQUARE_EASE){
				if(typeof options.easing.count == "undefined" || isNaN(options.easing.count) || !Number.isInteger(Math.sqrt(options.easing.count)))
					options.easing.count = 9;
				if(typeof options.easing.random == "undefined")
					options.easing.random = false;
			}else if(options.easing.name == CIRCLE_EASE){
				if(typeof options.easing.origin == "undefined")
					options.easing.origin = "center";
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
						animated_backward = {left:"0"};
					if(easing.direction == VERTICAL_DIR){
						animated_even_forward = {top:"-100%"};
						animated_odd_forward = {top:"100%"};
						animated_backward = {top:"0"};
					}
					// Div over
					let imageIndex = (dir == FORWARD) ? currentTemp : nextTemp;
					$images.find('#mixSlide-div-over').remove();
					$images.append('<div id="mixSlide-div-over"></div>');
					let $divOver = $images.find('#mixSlide-div-over');
					for(let i = 0;i<easing.count;i++){
						$divOver.append('\
							<div class="mixSlide-div-clip slice '+easing.direction+'" data-number="'+i+'">\
								<img src="'+images[imageIndex].src+'"/>\
							</div>'
						);
					}
					let size = (100/easing.count);
					$divOver.find('div').each(function(){
						let number = parseInt($(this).attr('data-number'));
						if(easing.direction == HORIZONTAL_DIR)
							clipSquare($(this), 0, number*size, 100, size);
						else
							clipSquare($(this), number*size, 0, size, 100);
						
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
				}else if(easing.name == SQUARE_EASE){

					let animated_forward = {}, animated_backward = {left:"0", top:"0"};

					let imageIndex = (dir == FORWARD) ? currentTemp : nextTemp;
					let sqrt_count = Math.sqrt(easing.count);
					$images.find('#mixSlide-div-over').remove();
					$images.append('<div id="mixSlide-div-over"></div>');
					let $divOver = $images.find('#mixSlide-div-over');
					let k = 0;
					for(let i = 0;i<sqrt_count;i++){
						for(let j = 0;j<sqrt_count;j++){
							$divOver.append('\
								<div class="mixSlide-div-clip slice '+options.easing.direction+'" data-number="'+k+'" data-x="'+i+'" data-y="'+j+'">\
									<img src="'+images[imageIndex].src+'"/>\
								</div>'
							);
							k++;
						}
					}
					let size = 100/sqrt_count;
					$divOver.find('div').each(function(){
						let x = parseInt($(this).attr('data-x')),
							y = parseInt($(this).attr('data-y')),
							number = parseInt($(this).attr('data-number'));
						clipSquare($(this), x*size, y*size, size)
					});

					let unitSpeed = options.animation.speed/easing.count;
					if(easing.random){
						//Animation width random order
						let number = 0, $element,  x, y, distance_left, distance_top, couples = [];//Couples' elements (x&y)
						do{
							do{
								x = Math.floor(Math.random()*sqrt_count);
								y = Math.floor(Math.random()*sqrt_count);
								
								console.log("x - "+x+", y - "+y);
							}while(couples.indexOf(x+"&"+y) != -1);
							couples.push(x+"&"+y);
							let $element = $divOver.find('div[data-x="'+x+'"][data-y="'+y+'"]');
							animated_forward.left = (Math.floor(Math.random()*2) == 0) ? '-100%' : '100%';
							animated_forward.top = (Math.floor(Math.random()*2) == 0) ? '-100%' : '100%';
							if(dir == FORWARD){
								$imageDivs.eq(nextTemp).css("z-index", "1").show(-1);
								$imageDivs.eq(currentTemp).hide(-1).css("z-index", "0");
								$element.animate(animated_forward, unitSpeed*(number+1));
							}else{
								$element.css(animated_forward);
								if(number == easing.count-1){
									$element.animate(animated_backward, unitSpeed*(number+1), function(){
										$imageDivs.eq(currentTemp).css({"z-index":"0"}).hide(-1);
										$imageDivs.eq(nextTemp).css({"z-index":"1"}).show(-1);
									});
								}else{
									$element.animate(animated_backward, unitSpeed*(number+1));
								}
							}
							number++;

						}while(number < easing.count);
					}else{
						 //Animation with defined order 
						let number = 0, $element;
						if(dir == FORWARD){
							$imageDivs.eq(nextTemp).css("z-index", "1").show(-1);
							$imageDivs.eq(currentTemp).hide(-1).css("z-index", "0");
						}
						animated_forward.left = (Math.floor(Math.random()*2) == 0) ? '-100%' : '100%';
						animated_forward.top = (Math.floor(Math.random()*2) == 0) ? '-100%' : '100%';
						for(let i = 0;i<sqrt_count;i++){
							for(let j = 0;j<sqrt_count;j++){
								$element = $divOver.find('div[data-x="'+i+'"][data-y="'+j+'"]');
								if(dir == FORWARD){
									$imageDivs.eq(nextTemp).css("z-index", "1").show(-1);
									$imageDivs.eq(currentTemp).hide(-1).css("z-index", "0");
									$element.animate(animated_forward, unitSpeed*(number+1));
								}else{
									$element.css(animated_forward);
									if(number == easing.count-1){
										$element.animate(animated_backward, unitSpeed*(number+1), function(){
											$imageDivs.eq(currentTemp).css({"z-index":"0"}).hide(-1);
											$imageDivs.eq(nextTemp).css({"z-index":"1"}).show(-1);
										});
									}else{
										$element.animate(animated_backward, unitSpeed*(number+1));
									}
								}
								number++;
							}
						}
					}
				}else if(easing.name == CIRCLE_EASE){
					let radius = 70,
						origin = "50% 50%";
					if(easing.origin != CENTER_POS)
						radius = 150;
					switch(easing.origin){
						case TOP_LEFT_POS: origin = "0% 0%";break;
						case TOP_RIGHT_POS: origin = "100% 0%";break;
						case BOTTOM_LEFT_POS: origin = "0% 100%";break;
						case BOTTOM_RIGHT_POS: origin = "100% 100%";break;
					}
					if(dir == FORWARD){
						$imageDivs.eq(nextTemp).css({"clip-path":"circle(0% at "+origin+")", "z-index":"1"}).show(-1);
						$imageDivs.eq(currentTemp).css({"z-index":"0"});
						$imageDivs.eq(nextTemp).animate(
							{step:radius},
							{
								duration:options.animation.speed,
								step:function(val){
									$imageDivs.eq(nextTemp).css({"clip-path":"circle("+val+"% at "+origin+")"});
								},
								always : function(){
									$imageDivs.eq(currentTemp).hide(-1);
									$imageDivs.eq(nextTemp).css({"clip-path":"none"}).animate({step:0},0);
								}
							}
						);
					}else{
						$imageDivs.eq(nextTemp).css({"z-index":"0"}).show(-1);
						$imageDivs.eq(currentTemp).css('clip-path', 'circle('+radius+'% at '+origin+')')
						$imageDivs.eq(currentTemp).animate(
							{step:radius},
							{
								duration:options.animation.speed,
								step:function(val){
									$imageDivs.eq(currentTemp).css({"clip-path":"circle("+(radius-val)+"% at "+origin+")"});
								},
								always:function(){
									$imageDivs.eq(nextTemp).css("z-index", "1");
									$imageDivs.eq(currentTemp).css({"clip-path":"none","z-index":"0"}).hide(-1).animate({step:0},0);
									
								}
							}
						);
					}
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
					}, options.animation.delay+options.animation.speed);
				}
				animation();
			}
		});
		return this;
	}
})(jQuery);

function clipSquare($element, x, y, width, height = null){
	if (height == null)
		height = width;
	let P1 = x+"% "+y+"%",
		P2 = (x+width)+"% "+y+"%",
		P3 = (x+width)+"% "+(y+height)+"%",
		P4 = x+"% "+(y+height)+"%";
	$element.css('clip-path', 'polygon('+P1+', '+P2+', '+P3+', '+P4+')');
}