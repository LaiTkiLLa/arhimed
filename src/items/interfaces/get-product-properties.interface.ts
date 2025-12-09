import { ProductFieldTypes } from '../../common/enums/products.enum';

export interface GetProductProperties {
  id: string;
  title: string;
  isRequired: boolean;
  isDisabled: boolean;
  fieldType: ProductFieldTypes;
  properties: {
    value: string;
    label: string;
  }[];
  value: null;
}
