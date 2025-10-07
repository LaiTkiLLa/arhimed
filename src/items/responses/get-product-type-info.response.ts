import { GetProductTypeInfo } from '../interfaces/get-product-type-info.interface';
import { ProductFieldTypes } from '../../common/enums/products.enum';

export const GetProductTypeInfoResponse: GetProductTypeInfo = {
  id: '62a12b0f-ac69-4af8-89ec-3c0511d2c4bf',
  title: 'Привод электрический',
  attributes: [
    {
      id: '5a076221-e11d-45c6-9e33-3db683953be4',
      title: 'I ном (А)',
      rank: 1,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      values: [
        {
          id: 'c8854561-e0aa-4b74-a16c-6c2893b94fd9',
          value: '1.2'
        },
        {
          id: '01adcb2a-e834-49d2-84c8-e7edcd8100df',
          value: '2.4'
        }
      ]
    },
    {
      id: 'e4ceda78-8e59-466a-9683-3f678f2f9a4f',
      title: 'ISO 5210, 5211',
      rank: 2,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      values: [
        {
          id: 'cb4ba779-dc43-436b-ac29-1c0be35cbe03',
          value: 'F03/F05'
        },
        {
          id: 'fd702796-2cb2-407f-8153-dc1e11bca040',
          value: 'F05/F07'
        }
      ]
    },
    {
      id: 'f18ccd40-9dda-4d2e-b042-cf713842083e',
      title: 'T окружающей среды min ',
      rank: 3,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      values: [
        {
          id: '3faf5312-4786-4234-b803-c7d2d4b5add3',
          value: '-20°C'
        },
        {
          id: 'b1a9bc13-c8c2-4559-b52f-dae28da7098b',
          value: '-40°C'
        }
      ]
    },
    {
      id: '957c0b1e-79fb-4731-8081-ad2242ce468b',
      title: 'T окружающей среды max',
      rank: 4,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      values: [
        {
          id: '74bf093d-024b-4daa-b9f1-930326a40ef9',
          value: '+70°C'
        }
      ]
    }
  ]
};
