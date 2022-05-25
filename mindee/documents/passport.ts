import { Document } from "@documents/document";
import { Field, DateField as Date } from "@documents/fields";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as MRZ from "mrz";

export class Passport extends Document {
  country: Field;
  id_number: Field;
  birth_date: Date;
  expiry_date: Date;
  issuance_date: Date;
  birth_place: Field;
  gender: Field;
  surname: Field;
  mrz1: Field;
  mrz2: Field;
  given_names: Field[];
  full_name: Field;
  mrz: Field;

  constructor({ apiPrediction, inputFile, pageNumber }: any) {
    super(inputFile);
    this.country = new Field({ prediction: apiPrediction.country, pageNumber });
    this.id_number = new Field({
      prediction: apiPrediction.id_number,
      pageNumber,
    });
    this.birth_date = new Date({
      prediction: apiPrediction.birth_date,
      valueKey: "value",
      pageNumber,
    });
    this.expiry_date = new Date({
      prediction: apiPrediction.expiry_date,
      valueKey: "value",
      pageNumber,
    });
    this.issuance_date = new Date({
      prediction: apiPrediction.issuance_date,
      valueKey: "value",
      pageNumber,
    });
    this.birth_place = new Field({
      prediction: apiPrediction.birth_place,
      pageNumber,
    });
    this.gender = new Field({ prediction: apiPrediction.gender, pageNumber });
    this.surname = new Field({ prediction: apiPrediction.surname, pageNumber });
    this.mrz1 = new Field({ prediction: apiPrediction.mrz1, pageNumber });
    this.mrz2 = new Field({ prediction: apiPrediction.mrz2, pageNumber });
    this.given_names = this.#getGivenNames(
      apiPrediction.given_names,
      pageNumber
    );
    this.full_name = this.constructFullName(pageNumber) as Field;
    this.mrz = this.constructMRZ(pageNumber) as Field;
  }

  #getGivenNames(given_names: any, pageNumber: number): Field[] {
    const result: Field[] = [];
    given_names.forEach((given_name: any) => {
      result.push(new Field({ prediction: given_name, pageNumber }));
    });
    return result;
  }

  #checkMRZ() {
    let checks = {};
    if (this.mrz1 && this.mrz2) {
      const mrz = MRZ.parse([this.mrz1, this.mrz2]);
      checks = {
        mrz_valid: this.isMRZValid(mrz),
        mrz_valid_birth_date: this.isBirthDateValid(mrz),
        mrz_valid_expiry_date: this.isExpiryDateValid(mrz),
        mrz_valid_id_number: this.isIdNumberValid(mrz),
        mrz_valid_surname: this.isSurnameValid(mrz),
        mrz_valid_country: this.isCountryValid(mrz),
      };
    }
    return checks;
  }

  isMRZValid(mrz: any): boolean {
    const check = mrz.valid;
    if (check) this.mrz.confidence = 1.0;
    return check;
  }

  isBirthDateValid(mrz: any): boolean {
    const check =
      mrz.fields.birthDate && mrz.fields.birthDate === this.birth_date;
    if (check) this.birth_date.confidence = 1.0;
    return check;
  }

  isExpiryDateValid(mrz: any): boolean {
    const check =
      mrz.fields.expirationDate &&
      mrz.fields.expirationDate === this.expiry_date;
    if (check) this.expiry_date.confidence = 1.0;
    return check;
  }

  isIdNumberValid(mrz: any): boolean {
    const check =
      mrz.fields.documentNumber && mrz.fields.documentNumber === this.id_number;
    if (check) this.id_number.confidence = 1.0;
    return check;
  }

  isSurnameValid(mrz: any): boolean {
    const check = mrz.lastName === this.surname;
    if (check) this.surname.confidence = 1.0;
    return check;
  }

  isCountryValid(mrz: any): boolean {
    const check = mrz.nationality === this.country;
    if (check) this.country.confidence = 1.0;
    return check;
  }

  constructFullName(pageNumber: number): Field | undefined {
    if (
      this.surname &&
      this.given_names.length > 0 &&
      this.given_names[0].value
    ) {
      const full_name = {
        value: `${this.given_names[0].value} ${this.surname.value}`,
        confidence: Field.arrayConfidence([this.surname, this.given_names[0]]),
      };
      return new Field({
        prediction: full_name,
        pageNumber: pageNumber,
        reconstructed: true,
      });
    }
  }

  constructMRZ(pageNumber: number): Field | undefined {
    if (this.mrz1.value && this.mrz2.value) {
      const mrz = {
        value: `${this.mrz1.value}${this.mrz2.value}`,
        confidence: Field.arrayConfidence([this.mrz1, this.mrz2]),
      };
      return new Field({
        prediction: mrz,
        pageNumber: pageNumber,
        reconstructed: true,
      });
    }
  }
}
