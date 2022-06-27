import { Command } from "commander";
import { Client } from "../mindee/index";

const program = new Command();

interface OtsCliConfig {
  help: string;
  requiredKeys: Array<string>;
  docType: string;
  configFunc: string;
}

const OTS_DOCUMENTS = new Map<string, OtsCliConfig>([
  [
    "invoice",
    {
      help: "Invoice",
      requiredKeys: ["invoice"],
      docType: "invoice",
      configFunc: "configInvoice",
    },
  ],
  [
    "receipt",
    {
      help: "Expense Receipt",
      requiredKeys: ["receipt"],
      docType: "receipt",
      configFunc: "configReceipt",
    },
  ],
  [
    "passport",
    {
      help: "Passport",
      requiredKeys: ["passport"],
      docType: "passport",
      configFunc: "configPassport",
    },
  ],
  [
    "financial",
    {
      help: "Financial Document (receipt or invoice)",
      requiredKeys: ["invoice", "receipt"],
      docType: "financialDoc",
      configFunc: "configFinancialDoc",
    },
  ],
]);

async function predictCall(command: string, inputPath: string, options: any) {
  const info = OTS_DOCUMENTS.get(command);
  const mindeeClient = new Client();
  if (!info) {
    throw `Invalid document type ${command}`;
  }
  if (info.requiredKeys.length > 1) {
    throw "Not yet implemented, sorry :-(";
  } else {
    // @ts-ignore
    mindeeClient[info.configFunc](options[`${info.docType}Key`]);
  }
  const doc = mindeeClient.docFromPath(inputPath);
  const result = await doc.parse(command);
  if (result.document) {
    console.log(result.document.toString());
  }
}

export function cli() {
  program.name("mindee");

  OTS_DOCUMENTS.forEach((info, name) => {
    const prog = program.command(name);

    info.requiredKeys.forEach((keyName) => {
      prog.option(
        `--${keyName}-key <${keyName}>`,
        `API key for ${keyName} document endpoint`
      );
    });
    prog.option("--no-cut-pages", "Don't cut document pages");
    prog.argument("<input_path>", "Full path to the file");
    prog.action((inputPath: string, options: any, command: any) => {
      predictCall(command.name(), inputPath, options);
    });
  });
  program.parse(process.argv);
}
