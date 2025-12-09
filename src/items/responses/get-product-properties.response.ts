import { GetProductProperties } from '../interfaces/get-product-properties.interface';
import { ProductFieldTypes } from '../../common/enums/products.enum';

export const GetProductPropertiesResponse: GetProductProperties[] = [
  {
    id: '3c0fb8f3-c7db-47c8-999b-5c1c4c978bb0',
    title: 'ISO 5210, 5211',
    isRequired: true,
    isDisabled: false,
    fieldType: ProductFieldTypes.select,
    properties: [
      {
        value: 'F05/F07',
        label: 'F05/F07'
      },
      {
        value: 'F16',
        label: 'F16'
      }
    ],
    value: null
  },
  {
    id: 'e24b9757-b63c-4b8c-96f5-3021e7c71f6f',
    title: 'T окружающей среды min',
    isRequired: true,
    isDisabled: false,
    fieldType: ProductFieldTypes.select,
    properties: [
      {
        value: '-20°C',
        label: '-20°C'
      },
      {
        value: '-40°C',
        label: '-40°C'
      }
    ],
    value: null
  },
  {
    id: '3d471e6a-32ed-4097-bd09-62984351d3f2',
    title: 'T окружающей среды max',
    isRequired: true,
    isDisabled: false,
    fieldType: ProductFieldTypes.select,
    properties: [
      {
        value: '+80°C',
        label: '+80°C'
      },
      {
        value: '+150°C',
        label: '+150°C'
      }
    ],
    value: null
  },
  {
    id: '84c82c60-c542-4647-a303-fa15c2503e47',
    title: 'Материал корпуса ',
    isRequired: true,
    isDisabled: false,
    fieldType: ProductFieldTypes.select,
    properties: [
      {
        value: 'Алюминиевый сплав, анодированный',
        label: 'Алюминиевый сплав, анодированный'
      }
    ],
    value: null
  },
  {
    id: '7acc110d-8661-4f51-a465-25bc6b7377de',
    title: 'Серия',
    isRequired: true,
    isDisabled: false,
    fieldType: ProductFieldTypes.select,
    properties: [
      {
        value: 'PA',
        label: 'PA'
      }
    ],
    value: null
  },
  {
    id: 'c66cbfcc-8fb2-4736-9779-7d0a23b8b4cf',
    title: 'Степень защиты (IP) ',
    isRequired: true,
    isDisabled: false,
    fieldType: ProductFieldTypes.select,
    properties: [
      {
        value: '67',
        label: '67'
      }
    ],
    value: null
  },
  {
    id: 'cc1391f4-05ce-4ff9-b26b-711a37a921a1',
    title: 'Тип действия',
    isRequired: true,
    isDisabled: false,
    fieldType: ProductFieldTypes.select,
    properties: [
      {
        value: 'Двойного действия',
        label: 'Двойного действия'
      }
    ],
    value: null
  }
];
