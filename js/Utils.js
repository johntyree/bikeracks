var Utils = (function($) {
    return {
        takeAPhoto: function takeAPhoto(id, callback) {
            console.log('start');
            var photoChooser = $('#photoChooser');
            photoChooser.click();
            photoChooser.on('change', function() {
                console.log('change fired');
                var file = photoChooser[0].files[0];
                console.log(file);
                var reader = new FileReader();
                reader.onload = function() {
                    console.log('loaded');
                    var imgdiv = $('#rack-img-' + id);
                    var img = imgdiv.children('img');
                    imgdiv.removeClass('hidden');
                    img.attr('src', reader.result);
                    dataURL = reader.result;
                    callback && callback(reader.result);
                };
                reader.onerror = function() {
                    alert('Error uploading file!');
                };
                reader.readAsDataURL(file);
            });
        }
    };
}(jQuery));
