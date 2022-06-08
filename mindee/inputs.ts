// import fs from "fs/promises";
import { promises as fs } from "fs";
import * as path from "path";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as concat from "concat-stream";

import { Base64Encode } from "base64-stream";
import * as fileType from "file-type";
import * as ArrayBufferEncode from "base64-arraybuffer";

import { errorHandler } from "@errors/handler";
import { PDFDocument } from "pdf-lib";
import { ReadStream } from "fs";

type MIMETYPES_TYPE = "png" | "jpg" | "jpeg" | "webp" | "pdf";

interface InputProps {
  inputType: string;
  file?: Buffer | string | ReadStream;
  allowCutPdf?: boolean;
  filename?: string;
}

export class Input {
  MIMETYPES = {
    png: "image/png",
    jpg: "image/jpg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    pdf: "application/pdf",
  };
  ALLOWED_INPUT_TYPE = ["base64", "path", "stream", "dummy"];
  CUT_PDF_SIZE = 5;
  public file;
  public inputType;
  public allowCutPdf;
  public filename;
  public fileObject?: Buffer | string | ReadStream;
  public filepath?: Buffer | string | ReadStream;
  public fileExtension?: string;

  /**
   * @param {(String | Buffer)} file - the file that will be read. Either path or base64 string, or a steam
   * @param {String} inputType - the type of input used in file ("base64", "path", "dummy").
   *                             NB: dummy is only used for tests purposes
   * @param {String} filename - File name of the input
   * @param allowCutPdf
   * NB: Because of async calls, init() should be called after creating the object
   */
  constructor({ file, inputType, allowCutPdf = true, filename }: InputProps) {
    // Check if inputType is valid
    if (!this.ALLOWED_INPUT_TYPE.includes(inputType)) {
      errorHandler.throw(
        new Error(
          `The input type is invalid. It should be \
          ${this.ALLOWED_INPUT_TYPE.toString()}`
        )
      );
    }
    this.file = file;
    this.filename = filename;
    this.inputType = inputType;
    this.allowCutPdf = allowCutPdf;
  }

  async init() {
    if (this.inputType === "base64") await this.docFromBase64();
    else if (this.inputType === "path") await this.docFromPath();
    else if (this.inputType === "stream") await this.docFromFile();
    else if (this.inputType === "bytes") await this.docFromBytes();
    else this.initDummy();
  }

  async docFromBuffer(encode: string) {
    this.fileObject = this.file;
    this.filepath = undefined;

    if (this.filename === undefined) {
      const mimeType = await fileType.fromBuffer(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Buffer.from(this.fileObject as string, encode)
      );
      if (mimeType !== undefined) {
        this.fileExtension = mimeType.mime.toLowerCase();
        this.filename = `from_${this.inputType}.${mimeType.ext}`;
      } else {
        throw "Could not determine the MIME type. Please specify the 'filename' option.";
      }
    } else {
      const filetype: string | undefined = this.filename.split(".").pop();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.fileExtension = this.MIMETYPES[filetype.toLowerCase()];
    }

    if (this.fileExtension === "application/pdf" && this.allowCutPdf == true) {
      await this.cutPdf();
    }
  }

  async docFromBase64() {
    await this.docFromBuffer("base64");
  }

  async docFromBytes() {
    await this.docFromBuffer("hex");
  }

  async docFromPath() {
    this.fileObject = await fs.readFile(this.file as string);
    this.filepath = this.file;
    if (typeof this.file === "string") {
      this.filename = this.filename || path.basename(this.file);
    }

    // Check if file type is valid
    const filetype: MIMETYPES_TYPE | undefined = this.filename
      ?.split(".")
      .pop() as MIMETYPES_TYPE | undefined;
    if (!filetype || !(filetype in this.MIMETYPES)) {
      errorHandler.throw(
        new Error(
          `File type is not allowed. It must be ${Object.keys(
            this.MIMETYPES
          ).toString()}`
        )
      );
    }
    this.fileExtension = filetype ? this.MIMETYPES[filetype] : "";

    if (
      this.fileExtension.toLowerCase() === "application/pdf" &&
      this.allowCutPdf
    ) {
      await this.cutPdf();
    }
  }

  async docFromFile() {
    this.file = (await this.streamToBase64(this.file)) as string | Buffer;
    this.inputType = "base64";
    await this.docFromBase64();
  }

  initDummy() {
    this.fileObject = "";
    this.filename = "";
    this.filepath = "";
    this.fileExtension = "";
  }

  /**
   * Convert ReadableStream to Base64 encoded String
   *
   * @param {*} stream ReadableStream to encode
   * @returns Base64 encoded String
   */
  async streamToBase64(stream: any) {
    return new Promise((resolve, reject) => {
      const base64 = new Base64Encode();

      const cbConcat = (base64: Base64Encode) => {
        resolve(base64);
      };

      stream
        .pipe(base64)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TO DO : FIX
        .pipe(concat(cbConcat))
        .on("error", (error: any) => {
          reject(error);
        });
    });
  }

  /** Cut PDF if pages > 5 */
  async cutPdf() {
    // convert document to PDFDocument & cut CUT_PDF_SIZE - 1 first pages and last page
    const pdfDocument = await PDFDocument.load(this.fileObject as Buffer, {
      ignoreEncryption: true,
    });
    const splitedPdfDocument = await PDFDocument.create();
    const pdfLength = pdfDocument.getPageCount();
    if (pdfLength <= this.CUT_PDF_SIZE) return;
    const pagesNumbers = [
      ...Array(this.CUT_PDF_SIZE - 1).keys(),
      pdfLength - 1,
    ];
    const pages = await splitedPdfDocument.copyPages(pdfDocument, pagesNumbers);
    pages.forEach((page) => splitedPdfDocument.addPage(page));
    const data = await splitedPdfDocument.save();
    if (this.inputType === "path") {
      this.fileObject = Buffer.from(data);
    } else if (this.inputType === "base64") {
      this.fileObject = ArrayBufferEncode.encode(data);
    }
  }
}
