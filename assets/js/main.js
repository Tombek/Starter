var project = {
    init: function(){
        $(document).foundation();

        // If it's home page, launch init of home page
        if($("body").hasClass('home')){ project.homepage.init(); }

        $(window).on('now resize', function(){
            
        });
    },
    homepage: {
        init: function(){

        }
    }
};

$(function() {
    project.init();
});
