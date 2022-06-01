// interface ListFieldConstructor {
//   prediction: { [key: string]: any };
//   page_id: number;
//   constructed: boolean;
// }

export class ListFieldItem {
  content: any;
  confidence: number;
  polygon: any;

  constructor(prediction: any) {
    this.content = prediction["content"];
    this.confidence = prediction["confidence"];
    this.polygon = prediction["polygon"];
  }
}

export class ListField {
  values: any[];
  confidence: number;
  constructed: boolean;
  page_id: number;

  constructor(
    prediction: { [key: string]: any },
    page_id: number,
    constructed = false
  ) {
    this.values = [];
    this.confidence = prediction["confidence"];
    this.constructed = constructed;
    this.page_id = page_id;

    if (Object.prototype.hasOwnProperty.call(prediction, "values")) {
      prediction["values"].forEach((field: any) => {
        this.values.push(new ListFieldItem(field));
      });
    }
    //
    // if (prediction.hasOwnProperty("values")) {
    //   prediction["values"].forEach((field: any) => {
    //     this.values.push(new ListFieldItem(field));
    //   });
    // }
  }
}
