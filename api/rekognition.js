import AWS from "aws-sdk";
import { globalConfig } from "@airtable/blocks";
import axios from "axios";


async function getBase64BufferFromURL(url) {
  return axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then((response) => new Buffer(response.data, "base64"))
    .catch((error) => {
      console.log("[ERROR]", error);
    });
}

function initRekognition() {
  const REGION = globalConfig.get("awsRegion");
  const ACCESS_KEY = globalConfig.get("accessKey");
  const SECRET_KEY = globalConfig.get("secretKey");
  AWS.region = REGION;
  AWS.config.update({
    region: REGION,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  });
  return new AWS.Rekognition();
}

export async function processImage(image) {
  const rekognition = initRekognition();

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
