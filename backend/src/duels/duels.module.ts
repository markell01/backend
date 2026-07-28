import { Module } from "@nestjs/common";
import { DuelsWebsocketGateway } from "./duels.gateway";
import { TextGeneratorModule } from "../textGenerator/textGenerator.module";

@Module({
    imports: [TextGeneratorModule],
    providers: [DuelsWebsocketGateway]
})
export class DuelsModule {}