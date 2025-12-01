import { GetAssembliesList } from '../interfaces/get-assemblies-list.interface';

export const GetAssembliesListResponse: GetAssembliesList = {
  count: 2,
  rows: [
    {
      id: 'dee266ca-4793-4f6e-876d-a85eba7a005e',
      article: 'Какой то артикул',
      title: 'Наименование',
      productsCount: 5,
      description: 'Описание сборки'
    },
    {
      id: '57fb018f-353e-4e15-adeb-df59bfe52bf7',
      article: 'Какой то артикул',
      title: 'Наименование',
      productsCount: 5,
      description: 'Описание сборки'
    }
  ]
};
