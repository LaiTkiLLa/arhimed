import { Assemblies } from '../entities/assemblies.entity';
import { GetAssemblyInfo } from '../interfaces/get-assembly-info.inteface';
import { ProductsAssemblies } from '../entities/products-assemblies.entity';

export class GetAssemblyInfoDto {
  static mapModel(model: Assemblies, relationships: ProductsAssemblies[]): GetAssemblyInfo {
    return {
      id: model.id,
      article: model.article,
      title: model.title,
      description: model.description,
      products: model.products.map(product => {
        console.log('productId', product.id)
        console.log(relationships.find(el => el.productId === product.id))
        return {
          id: product.id,
          article: product.article,
          title: product.title,
          quantity: relationships.find(el => el.productId === product.id).quantity,
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
