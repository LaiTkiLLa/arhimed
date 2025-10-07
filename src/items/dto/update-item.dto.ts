import { CreateItemDto } from './create-item.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateItemDto extends OmitType(CreateItemDto, ['typeId']) {}
