import { Module } from "@nestjs/common";
import { TextGeneratorService } from "./textGenerator.service";

@Module({
    providers: [TextGeneratorService],
    exports: [TextGeneratorService]
})
export class TextGeneratorModule {} 