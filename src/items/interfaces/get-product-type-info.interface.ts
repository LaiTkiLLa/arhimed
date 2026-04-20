import { ProductFieldTypes } from '../../common/enums/products.enum';

export interface GetProductTypeInfo {
  id: string;
  title: string;
  description: string;
  markedForDeletion: boolean;
  attributes: {
    id: string;
    title: string;
    rank: number;
    isRequired: boolean;
    isDisabled: boolean;
    fieldType: ProductFieldTypes;
    values: {
      id: string;
      value: string;
    }[];
  }[];
}
