#!/usr/bin/env node

import { Command } from "commander";
import { authCommand } from "./commands/auth.js";
import { uuidCommand } from "./commands/uuid.js";
import { hashCommand } from "./commands/hash.js";
import { caseCommand } from "./commands/case.js";
import { tokensCommand } from "./commands/tokens.js";
import { base64EncodeCommand } from "./commands/base64-encode.js";
import { base64DecodeCommand } from "./commands/base64-decode.js";
import { jwtCommand } from "./commands/jwt.js";
import { timestampCommand } from "./commands/timestamp.js";

const program = new Command();

program
  .name("toolhaus")
  .description("Toolhaus CLI - developer tools in your terminal")
  .version("0.1.0");

program.addCommand(authCommand);
program.addCommand(uuidCommand);
program.addCommand(hashCommand);
program.addCommand(caseCommand);
program.addCommand(tokensCommand);
program.addCommand(base64EncodeCommand);
program.addCommand(base64DecodeCommand);
program.addCommand(jwtCommand);
program.addCommand(timestampCommand);

program.parse();
