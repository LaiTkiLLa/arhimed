import { ProductFieldTypes } from '../../common/enums/products.enum';

export interface GetAssemblyInfo {
  id: string;
  article: string;
  products: {
    id: string;
    article: string;
    title: string;
    quantity: number;
    type: {
      id: string;
      title: string;
    };
    attributes: {
      value: string;
      title: string;
      id: string;
      isRequired: boolean;
      isDisabled: boolean;
      fieldType: ProductFieldTypes;
    }[];
  }[];
}
