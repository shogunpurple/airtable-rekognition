import AWS from "aws-sdk";
import axios from "axios";

const REGION = "eu-west-2";

AWS.config.update({
  region: REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const rekognition = new AWS.Rekognition();

// async function fetchImage(url) {
//   // await authenticate();
//   const response = await fetch(url);
//   const blob = await response.blob();

//   const reader = new FileReader();
//   return new Promise(resolve => {
//     reader.onload = function() {
//       resolve(this.result);
//     }
//     reader.readAsDataURL(blob);
//   });
// }
function getBase64BufferFromURL(url) {
  return axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => new Buffer(response.data, "base64"))
    .catch((error) => {
      console.log("[ERROR]", error);
    });
}

// async function authenticate() {
//   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: '',
//   });
// }

export async function processImage(image) {
  AWS.region = REGION;
  const imageBytes = await getBase64BufferFromURL(image.url);
  var params = {
    Image: {
      Bytes: imageBytes,
    },
  };
  const labelPromise = rekognition.detectLabels(params).promise();
  const celebritiesPromise = rekognition.recognizeCelebrities(params).promise();
  const nsfwLabelsPromise = rekognition
    .detectModerationLabels(params)
    .promise();

  const [labels, celebrities, nsfwLabels] = await Promise.all([
    labelPromise,
    celebritiesPromise,
    nsfwLabelsPromise,
  ]);

  return {
    labels: labels.Labels,
    celebrity: celebrities.CelebrityFaces[0],
    nsfwLabels: nsfwLabels.ModerationLabels,
  };
}
