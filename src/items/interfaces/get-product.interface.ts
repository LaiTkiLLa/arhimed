import { ProductFieldTypes } from '../../common/enums/products.enum';

export interface GetProduct {
  id: string;
  productTypeId: string;
  productProperties: {
    id: string;
    title: string;
    rank: number;
    isRequired: boolean;
    isDisabled: boolean;
    fieldType: ProductFieldTypes;
    value;
  }[];
}
