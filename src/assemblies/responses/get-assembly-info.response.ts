import { GetAssemblyInfo } from '../interfaces/get-assembly-info.inteface';
import { ProductFieldTypes } from '../../common/enums/products.enum';

export const GetAssemblyInfoResponse: GetAssemblyInfo = {
  id: '57fb018f-353e-4e15-adeb-df59bfe52bf7',
  article: 'Какой то артикул',
  title: 'Наименование',
  products: [
    {
      id: '7391067e-f8df-407b-91ad-38756e46fc31',
      article: 'Какой то артикул',
      title: 'Какой то товар',
      quantity: 5,
      type: {
        id: '6aeb58f9-f756-47e9-825f-67705a8ac60b',
        title: 'Затвор'
      },
      attributes: [
        {
          value: 'Дисковый',
          title: 'Тип изделия',
          id: '8189bcc3-512b-4f24-9ad5-64d78e2dbf5e',
          isRequired: true,
          isDisabled: false,
          fieldType: ProductFieldTypes.select
        },
        {
          value: '+120°C',
          title: 'Температура окружающей среды (макс)',
          id: '06c629aa-88a6-4678-abea-bd94bb46e9f3',
          isRequired: true,
          isDisabled: false,
          fieldType: ProductFieldTypes.input
        },
        {
          value: '-20°C',
          title: 'Температура окружающей среды (мин)',
          id: 'f295952b-5845-49de-b3e8-dff2b683aefc',
          isRequired: true,
          isDisabled: false,
          fieldType: ProductFieldTypes.input
        },
        {
          value: 'EN-GJL 400 чугун',
          title: 'Материал запорного органа',
          id: 'cecaabff-99e0-4e74-8776-a3fc30987856',
          isRequired: true,
          isDisabled: false,
          fieldType: ProductFieldTypes.select
        }
      ]
    }
  ]
};
