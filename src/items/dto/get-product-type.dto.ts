import { ProductTypes } from '../entities/product-types.entity';

export class GetProductTypeDto {
  static mapModel(model: ProductTypes) {
    return {
      id: model.id,
      title: model.title,
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
              value: value.value
            };
          })
        };
      })
    };
  }
}
