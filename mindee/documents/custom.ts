import { Document } from "@documents/document";
import { ListField } from "@documents/fields";

export class CustomDocument extends Document {
  fields: { [key: string]: any };
  page_id: number;

  constructor({ inputFile, prediction, page_id }: any) {
    super(inputFile);
    this.fields = {};
    this.page_id = page_id;

    Object.keys(prediction).forEach((field_name) => {
      const field_prediction = prediction[field_name];
      const complete_field = new ListField(field_prediction, page_id);
      this.fields[field_name] = complete_field;
    });
  }
}
