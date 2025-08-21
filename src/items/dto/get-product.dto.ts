import { Products } from '../entities/products.entity';
import { GetProduct } from '../interfaces/get-product.interface';

export class GetProductDto {
  static mapModel(model: Products): GetProduct {
    return {
      id: model.id,
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
        //   return {
        //     id: property.property.id,
        //     title: property.property.title,
        //     rank: property.property.rank,
        //     isRequired: property.property.isRequired,
        //     isDisabled: property.property.isDisabled,
        //     fieldType: property.property.fieldType,
        //     fieldMask: property.property.fieldMask,
        //     value: property.value,
        //     properties:
        //       property.property.fieldType === 'select'
        //         ? property.property.propertyValues.map(propertyValue => ({
        //             label: propertyValue.value,
        //             value: propertyValue.value
        //           }))
        //         : undefined
        //   };
      })
    };
  }
}
