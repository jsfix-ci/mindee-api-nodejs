import * as https from "https";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { version as sdkVersion } from "../../package.json";

import { URL } from "url";
import FormData from "form-data";
import * as os from "os";

export const request = (
  url: any,
  method: any,
  headers: any,
  input: any,
  includeWords = false
) => {
  return new Promise(function (resolve, reject) {
    let form = new FormData();

    headers["User-Agent"] = `mindee-api-nodejs@v${sdkVersion} nodejs-${
      process.version
    } ${os.type().toLowerCase()}`;

    const fileParams = { filename: input.filename };

    if (input.inputType === "base64") {
      form.append(
        "document",
        Buffer.from(input.fileObject, "base64"),
        fileParams
      );
    } else {
      form.append("document", input.fileObject, fileParams);
    }
    if (includeWords) {
      form.append("include_mvision", "true");
    }
    headers = { ...headers, ...form.getHeaders() };

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
      form.pipe(req);
    }
  });
};
