import { ProductTypes } from '../entities/product-types.entity';
import { GetProductTypeInfo } from '../interfaces/get-product-type-info.interface';
import { ProductFieldTypes } from '../../common/enums/products.enum';

export class GetProductTypeDto {
  static mapModel(model: ProductTypes): GetProductTypeInfo {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      markedForDeletion: model.deletedByAdminAt ? true : false,
      attributes: model.attributes.map(attribute => {
        return {
          id: attribute.id,
          title: attribute.title,
          rank: attribute.rank,
          isRequired: attribute.isRequired,
          isDisabled: attribute.isDisabled,
          fieldType: attribute.fieldType,
          values: attribute.attributeValues.map(value => {
            return {
              id: value.id,
              value:
                attribute.fieldType === ProductFieldTypes.slider ? value.value.replace(',', '.') : value.value
            };
          })
        };
      })
    };
  }
}
