# mixSlide-jquery-plug-in
 A slideshow in javascript width jquery 

#Code informations
 Author : Nkouanang Kepseu vivian porel (vporel)
 Version : 1.0 Beta
 Technologies : jQuery (javascript)

##FEATURES
###Plug-in options
 	*autoplay:boolean
	*controls : {
		active:boolean
		position:string ("top" | "bottom")
	}
	*thumbs : { //small images
		active:boolean
		position:string ("top" | "bottom" | "left" | "right")
	}
	*animation : {
		speed : integer (seconds)
		delay : integer (seconds) 
	}
	*easing : {
		name : string
		//Others options
	}

###Differents options according to transitions (easing)
	"fade"
		nothing else
	"slide"
		direction:string ("vertical" | "horizontal")
	"slice"
		direction:string ("vertical" | "horizontal")
		count : integer (max:20)



 
