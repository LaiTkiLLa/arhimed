import { Products } from '../entities/products.entity';
import { GetProduct } from '../interfaces/get-product.interface';

export class GetProductDto {
  static mapModel(model: Products): GetProduct {
    return {
      id: model.id,
      title: model.title,
      article: model.article,
      productTypeId: model.typeId,
      productProperties: model.productAttributeValues.map(property => {
        return {
          id: property.id,
          title: property.productAttributeProperty.title,
          rank: property.productAttributeProperty.rank,
          isRequired: property.productAttributeProperty.isRequired,
          isDisabled: property.productAttributeProperty.isDisabled,
          fieldType: property.productAttributeProperty.fieldType,
          value: property.value
        };
      })
    };
  }
}
