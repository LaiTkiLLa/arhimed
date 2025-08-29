import { Assemblies } from '../entities/assemblies.entity';
import { GetAssemblyInfo } from '../interfaces/get-assembly-info.inteface';

export class GetAssemblyInfoDto {
  static mapModel(model: Assemblies): GetAssemblyInfo {
    return {
      id: model.id,
      article: model.article,
      products: model.products.map(product => {
        return {
          id: product.id,
          article: product.article,
          title: product.title,
          quantity: 5,
          type: {
            id: product.typeId,
            title: product.type.title
          },
          attributes: product.productAttributeValues.map(el => {
            return {
              value: el.value,
              title: el.productAttributeProperty.title,
              id: el.productAttributePropertyId,
              isRequired: el.productAttributeProperty.isRequired,
              isDisabled: el.productAttributeProperty.isDisabled,
              fieldType: el.productAttributeProperty.fieldType
            };
          })
        };
      })
    };
  }
}
