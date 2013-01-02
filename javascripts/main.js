
$(document).ready(function(){
  $("section h1, section h2").each(function(){
    $("nav ul").append("<li class='tag-" + this.nodeName.toLowerCase() + "'><a href='#" + $(this).text().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,'') + "'>" + $(this).text() + "</a></li>");
    $(this).attr("id",$(this).text().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,''));
    $("nav ul li:first-child a").parent().addClass("active");
  });
  
  $("nav ul li").on("click", "a", function(event) {
    var position = $($(this).attr("href")).offset().top - 190;
    $("html, body").animate({scrollTop: position}, 400);
    $("nav ul li a").parent().removeClass("active");
    $(this).parent().addClass("active");
    event.preventDefault();    
  });
  
  //sectionHeight();
  
  //$('img').load(sectionHeight);
});

fixScale = function(doc) {

  var addEvent = 'addEventListener',
      type = 'gesturestart',
      qsa = 'querySelectorAll',
      scales = [1, 1],
      meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];

  function fix() {
    meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
    doc.removeEventListener(type, fix, true);
  }

  if ((meta = meta[meta.length - 1]) && addEvent in doc) {
    fix();
    scales = [.25, 1.6];
    doc[addEvent](type, fix, true);
  }
};

$(function(){
        //set global variables and cache DOM elements for reuse later
        var form = $('#form').find('form'),
            formElements = form.find('input[type!="submit"],textarea'),
            formSubmitButton = form.find('[type="submit"]'),
            errorNotice = $('#errors'),
            successNotice = $('#success'),
            loading = $('#loading'),
            errorMessages = {
                required: ' is a required field',
                email: 'Adresse email non valide / Invalid email address: '
            }
        //feature detection + polyfills
        formElements.each(function(){
        	//if HTML5 input placeholder attribute is not supported
		if(!Modernizr.input.placeholder){
			var placeholderText = this.getAttribute('placeholder');
			if(placeholderText){
				$(this)
					.addClass('placeholder-text')
					.val(placeholderText)
					.bind('focus',function(){
						if(this.value == placeholderText){
							$(this)
								.val('')
								.removeClass('placeholder-text');
						}
					})
					.bind('blur',function(){
						if(this.value == ''){
							$(this)
								.val(placeholderText)
								.addClass('placeholder-text');
						}
					});
			}
		}
		
		//if HTML5 input autofocus attribute is not supported
		if(!Modernizr.input.autofocus){
			if(this.getAttribute('autofocus')) this.focus();
		}
        });

        //to ensure compatibility with HTML5 forms, we have to validate the form on submit button click event rather than form submit event. 
	//An invalid html5 form element will not trigger a form submit.
	formSubmitButton.bind('click',function(){
		var formok = true,
			errors = [];
			
		formElements.each(function(){
			var name = this.name,
				nameUC = name.ucfirst(),
				value = this.value,
				placeholderText = this.getAttribute('placeholder'),
				type = this.getAttribute('type'), //get type old school way
				isRequired = this.getAttribute('required'),
				minLength = this.getAttribute('data-minlength');
			
			//if HTML5 formfields are supported			
			if( (this.validity) && !this.validity.valid ){
				formok = false;
				
				console.log(this.validity);
				
				//if there is a value missing
				if(this.validity.valueMissing){
					errors.push(nameUC + errorMessages.required);	
				}
				//if this is an email input and it is not valid
				else if(this.validity.typeMismatch && type == 'email'){
					errors.push(errorMessages.email + nameUC);
				}
				
				this.focus(); //safari does not focus element an invalid element
				return false;
			}
			
			//if this is a required element
			if(isRequired){	
				//if HTML5 input required attribute is not supported
				if(!Modernizr.input.required){
					if(value == placeholderText){
						this.focus();
						formok = false;
						errors.push(nameUC + errorMessages.required);
						return false;
					}
				}
			}
                        
                        //if HTML5 input email input is not supported
			if(type == 'email'){ 	
				if(!Modernizr.inputtypes.email){ 
					var emailRegEx = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; 
				 	if( !emailRegEx.test(value) ){	
						this.focus();
						formok = false;
						errors.push(errorMessages.email + nameUC);
						return false;
					}
				}
			}
			
			//check minimum lengths
			if(minLength){
				if( value.length < parseInt(minLength) ){
					this.focus();
					formok = false;
					errors.push(nameUC + errorMessages.minlength + minLength + ' charcters');
					return false;
				}
			}
		});
		
		//if form is not valid
		if(!formok){
			
			//animate required field notice
			$('#req-field-desc')
				.stop()
				.animate({
					marginLeft: '+=' + 5
				},150,function(){
					$(this).animate({
						marginLeft: '-=' + 5
					},150);
				});
			
			//show error message 
			showNotice('error',errors);
			
		}
		//if form is valid
		else {
			loading.show();
			$.ajax({
				url: form.attr('action'),
				type: form.attr('method'),
				data: form.serialize(),
				success: function(){
					showNotice('success');
					form.get(0).reset();
					loading.hide();
				}
			});
		}
		
		return false; //this stops submission off the form and also stops browsers showing default error messages
		
	});

        //other misc functions
	function showNotice(type,data)
	{
		if(type == 'error'){
			successNotice.hide();
			errorNotice.find("li[id!='info']").remove();
			for(x in data){
				errorNotice.append('<li>'+data[x]+'</li>');	
			}
			errorNotice.show();
		}
		else {
			errorNotice.hide();
			successNotice.show();	
		}
	}
	
	String.prototype.ucfirst = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

});
