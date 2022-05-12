import { APIObject } from "@mindee/api";
import { Input } from "@mindee/inputs";
import fs from "fs/promises";
import { expect } from "chai";
import path from "path";

describe("test APIObject", () => {
  it("should construct an APIObject", () => {
    const apiObject = new APIObject("dummyToken", "dummyApiName");
    expect(apiObject.apiToken).to.be.equal("dummyToken");
    expect(apiObject.apiName).to.be.equal("dummyApiName");
    expect(apiObject.baseUrl).to.be.equal(
      "https://api.mindee.net/v1/products/mindee"
    );
  });

  it("should return a Response Object with an Receipt inside", async () => {
    const apiObject = new APIObject("dummyToken", "dummyApiName");
    const jsonData = await fs.readFile(
      path.resolve("tests/data/api/receipt/v3/receipt.json")
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const apiResponse = JSON.parse(jsonData);
    const input = new Input({ inputType: "dummy" });
    const response = apiObject.wrapResponse(input, apiResponse, "receipt");
    expect(response.receipt.date.value).to.be.equal("2016-02-26");
    expect(response.receipt.totalTax.value).to.be.equal(1.7);
    expect(response.receipt.checklist.taxesMatchTotalIncl).to.be.true;
    expect(typeof response.receipt.toString()).to.be.equal("string");
  });
});