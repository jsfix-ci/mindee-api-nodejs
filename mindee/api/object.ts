// const Response = require("./response");
import { Response } from "./response";
// const errorHandler = require("../errors/handler");
import { errorHandler } from "../errors/handler";
// const request = require("./request");
import { request } from "./request";

/**
 * Base class for APIs (APIReceipt & APIInvoice)
 *  @param {String} apiToken - Token of the API used for parsing document
 *  @param {String} apiName - Name of the API used for parsing document
 */
class APIObject {
  apiToken: string | undefined;
  baseUrl: string;
  apiName: string;

  constructor(apiToken = undefined, apiName = "") {
    this.apiToken = apiToken;
    this.baseUrl = "https://api.mindee.net/v1/products/mindee";
    this.apiName = apiName;
  }

  /**
   */
  parse() {
    if (!this.apiToken) {
      errorHandler.throw({
        error: new Error(
          `Missing API token for ${this.apiName}. \
          Have you create a mindee Client with a ${this.apiName}Token in parameters ?`
        ),
      });
    }
  }

  /** 
    @param {String} url - API url for request
    @param {Input} inputFile - input file for API
    @param {Boolean} includeWords - Include Mindee vision words in Response
    @returns {Response}
  */
  async _request(url: string, inputFile: any, includeWords = false) {
    const headers = {
      "X-Inferuser-Token": this.apiToken,
    };
    const response = await request(
      `${this.baseUrl}${url}`,
      "POST",
      headers,
      inputFile,
      includeWords
    );
    return this.wrapResponse(inputFile, response, this.apiName);
  }

  /** 
    @param {String} inputFile - Input object
    @param {} response - HTTP response
    @param {Document} documentType - Document class in {"Receipt", "Invoice", "Financial_document"}
    @returns {Response}
  */
  wrapResponse(inputFile: any, response: any, documentType: any) {
    if (response.statusCode > 201) {
      const errorMessage = JSON.stringify(response.data, null, 4);
      errorHandler.throw(
        new Error(
          `${this.apiName} API ${response.statusCode} HTTP error: ${errorMessage}`
        ),
        false
      );
      return new Response({
        httpResponse: response,
        documentType: documentType,
        document: undefined,
        input: inputFile,
        error: true,
      });
    }
    return new Response({
      httpResponse: response,
      documentType: documentType,
      document: inputFile,
      input: inputFile,
    });
  }
}

module.exports = APIObject;