import { Module } from '@nestjs/common';
import { PublicItemsService } from './public-items.service';
import { PublicItemsController } from './public-items.controller';

@Module({
  controllers: [PublicItemsController],
  providers: [PublicItemsService]
})
export class PublicItemsModule {}
