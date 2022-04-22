const https = require("https");
const { version: sdkVersion } = require("../../package.json");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'URL'.
const { URL } = require("url");
const FormData = require("form-data");
const os = require("os");

const request = (
  url: any,
  method: any,
  headers: any,
  input: any,
  includeWords = false
) => {
  return new Promise(function (resolve, reject) {
    const form = new FormData();
    let body;

    headers["User-Agent"] = `mindee-api-nodejs@v${sdkVersion} nodejs-${
      process.version
    } ${os.type().toLowerCase()}`;
    if (["path", "stream"].includes(input.inputType)) {
      const fileParams = { filename: input.filename };
      form.append("document", input.fileObject, fileParams);
      if (includeWords) form.append("include_mvision", "true");
      headers = { ...headers, ...form.getHeaders() };
    } else if (input.inputType === "base64") {
      const body_obj = { document: input.fileObject };
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if (includeWords) body_obj["include_mvision"] = "true";
      body = JSON.stringify(body_obj);
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = body.length;
    }

    const uri = new URL(url);
    const options = {
      method: method,
      headers: headers,
      hostname: uri.hostname,
      path: `${uri.pathname}${uri.search}`,
    };

    const req = https.request(options, function (res: any) {
      let responseBody: any = [];

      res.on("data", function (chunk: any) {
        responseBody += chunk;
      });

      res.on("end", function () {
        try {
          resolve({
            ...res,
            data: JSON.parse(responseBody),
          });
        } catch (error) {
          console.log(responseBody, error);
        }
      });
    });

    req.on("error", (err: any) => {
      reject(err);
    });

    if (["path", "stream"].includes(input.inputType)) {
      form.pipe(req);
    }

    if (input.inputType === "base64") {
      req.write(body);
      req.end();
    }
  });
};

module.exports = request;
