import * as https from "https";
import * as os from "os";

import { version as sdkVersion } from "../../package.json";
import { URL } from "url";
import FormData from "form-data";
import { Input } from "@mindee/inputs";

const MINDEE_API_URL = "https://api.mindee.net/v1";
const USER_AGENT = `mindee-api-nodejs@v${sdkVersion} nodejs-${
  process.version
} ${os.type().toLowerCase()}`;
const OWNER = "mindee";

const INVOICE_URL_NAME = "invoices";
const INVOICE_VERSION = "3";

export class Endpoint {
  api_keys: string;
  url_name: string;
  private owner: string;
  private version: string;
  private url_root: string;

  constructor(
    owner: string,
    url_name: string,
    version: string,
    api_key: string
  ) {
    this.owner = owner;
    this.url_name = url_name;
    this.version = version;
    this.api_keys = api_key;
    this.url_root = `${MINDEE_API_URL}/products/${owner}/${url_name}/v${version}`;
  }

  request(method: string, input: Input, includeWords = false) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      let body;
      let headers: { [key: string]: string | number } = {};

      headers["User-Agent"] = USER_AGENT;
      headers["Authorization"] = this.api_keys;
      if (["path", "stream"].includes(input.inputType)) {
        const fileParams = { filename: input.filename };
        form.append("document", input.fileObject, fileParams);
        if (includeWords) form.append("include_mvision", "true");
        headers = { ...headers, ...form.getHeaders() };
      } else if (input.inputType === "base64") {
        const body_obj: any = { document: input.fileObject };
        if (includeWords) body_obj["include_mvision"] = "true";
        body = JSON.stringify(body_obj);
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = body.length;
      }

      const uri = new URL(this.url_root);
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
            console.error(responseBody, error);
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
  }
}

export class InvoiceEndpoint extends Endpoint {
  constructor(api_key: string) {
    super(OWNER, INVOICE_URL_NAME, INVOICE_VERSION, api_key);
  }
}
