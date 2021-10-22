var base64ToImage = require("base64-to-image");

exports.randomNumber = function (length) {
  var text = "";
  var possible = "123456789";
  for (var i = 0; i < length; i++) {
    var sup = Math.floor(Math.random() * possible.length);
    text += i > 0 && sup == i ? "0" : possible.charAt(sup);
  }
  return Number(text);
};

exports.saveImage = async (base64) => {
  var timeInMss = new Date().getTime();
  var baseUrl = `${process.env.FILE_UPLOAD_SERVER}`;
  var base64Str = base64;
  var path = "./uploads/";
  var optionalObj = { fileName: timeInMss, type: "png" };
  let imageInfo = await base64ToImage(base64Str, path, optionalObj);
  let image_url = baseUrl + "/uploads/" + timeInMss + ".png";
  return image_url;
};
