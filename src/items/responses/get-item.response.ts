import { GetProduct } from '../interfaces/get-product.interface';
import { ProductFieldTypes } from '../../common/enums/products.enum';

export const GetItemResponse: GetProduct = {
  id: 'b0242502-b90d-427c-8d7c-5d070f0bc5eb',
  productTypeId: '6aeb58f9-f756-47e9-825f-67705a8ac60b',
  title: 'Дисковый затвор F-20',
  productProperties: [
    {
      id: 'a04ab7df-65c7-4156-b7f5-e4f5845eece1',
      title: 'Тип изделия',
      rank: 1,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'Дисковый'
    },
    {
      id: '3206211b-de49-45c4-ad80-cbdec01e9361',
      title: 'Температура окружающей среды (макс)',
      rank: 2,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: '+120°C'
    },
    {
      id: 'd63e1fd3-ec27-4988-ae0c-62d49f813b5b',
      title: 'Температура окружающей среды (мин)',
      rank: 3,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: '-20°C'
    },
    {
      id: '83bd3cb9-e775-497f-a1e3-29fddcc75832',
      title: 'Материал запорного органа',
      rank: 4,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'EN-GJL 400 чугун'
    },
    {
      id: '38ac9d57-91f5-492f-80d8-08c0964f1266',
      title: 'Материал корпуса',
      rank: 5,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'EN-GJL 250'
    },
    {
      id: 'b6e14d21-4e6a-4f77-ace1-27a3e9d68d91',
      title: 'Материал уплотнения',
      rank: 6,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'EPDM'
    },
    {
      id: '2c2666bc-db58-4dcc-9ab6-d1d94a301e77',
      title: 'Материал уплотнения штока',
      rank: 7,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'EPDM'
    },
    {
      id: '9c453572-d889-41ba-8299-6374f74f037d',
      title: 'Размер вала арматуры',
      rank: 8,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: '9x9'
    },
    {
      id: 'c3022858-886c-42bf-a2d9-859eeecdd131',
      title: 'Серия (для привода электрического)',
      rank: 9,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: '341'
    },
    {
      id: '76abec31-72e9-4a67-8217-0b62f930db95',
      title: 'Крутящий момент',
      rank: 10,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'Что здесь?'
    },
    {
      id: '3293f9ed-819e-4b4b-8014-ca7331d6184b',
      title: 'Строительная длина',
      rank: 11,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: '33'
    },
    {
      id: 'ddc625e9-2621-4d1b-814d-0135c8685803',
      title: 'Тип присоединения',
      rank: 12,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'Межфланцевый'
    },
    {
      id: '658e324a-cacb-47b1-bd9c-f5f077bfd539',
      title: 'Тип управления',
      rank: 13,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'Рукоятка'
    },
    {
      id: '6d44868f-d6a2-43a2-9462-32123b4cffd1',
      title: 'Условный проход (DN)',
      rank: 14,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: '40 мм'
    },
    {
      id: '1ea271e1-bd52-49cf-8f7a-796bd1d64213',
      title: 'Соответствие стандарту ISO',
      rank: 15,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'ISO 5210, 5211 (Дисковый затвор)'
    },
    {
      id: 'be8d9cd0-01a0-4879-9cf5-8d8180bf17aa',
      title: 'Тип конструкции',
      rank: 16,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'Что здесь?'
    },
    {
      id: 'cb633696-e8e7-49ce-93f0-3b5381d86831',
      title: 'Тип арматуры (позиционер)',
      rank: 17,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: 'Что здесь?'
    },
    {
      id: '1b47bbf2-5682-40f8-b941-052467682c7c',
      title: 'Характеристика',
      rank: 18,
      isRequired: true,
      isDisabled: false,
      fieldType: ProductFieldTypes.select,
      value: '*АВТ'
    }
  ]
};
