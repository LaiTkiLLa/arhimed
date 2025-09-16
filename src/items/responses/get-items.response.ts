import { GetItems } from '../interfaces/get-items.interface';

export const GetItemsResponse: GetItems = {
  count: 1,
  rows: [
    {
      id: 'a7239031-3b9d-4cc4-b5ce-ce198627cd2f',
      article: 'Какой то артикул',
      type: 'Привод пневматический',
      title: 'Какой то товар',
      attributes: [
        {
          id: '2b05e0d3-1d20-4926-a932-fcb0fa0913d7',
          value: '8 bar',
          property: 'PN '
        },
        {
          id: '28641611-6741-4a08-92af-9be90c9c70e1',
          value: 'F16',
          property: 'ISO 5210, 5211'
        },
        {
          id: '6015db12-e2b3-4bfc-b90f-a0a42c6ecab2',
          value: '+80°C',
          property: 'T окружающей среды max'
        },
        {
          id: 'ff880328-2e9f-4e72-b230-c88fceb8d1fe',
          value: 'PA',
          property: 'Серия'
        },
        {
          id: 'edf3f9ca-ab15-4fb4-99c0-f4dc13b49bea',
          value: 'Алюминиевый сплав, анодированный',
          property: 'Материал корпуса '
        },
        {
          id: 'e96d499a-80e3-4598-84d8-49aa19705c63',
          value: 'ЧТО ЭТО ТАКОЕ?',
          property: 'Крутящий момент'
        },
        {
          id: 'a486b238-dc9b-4bb1-98db-a203160114da',
          value: '67',
          property: 'Степень защиты (IP) '
        },
        {
          id: '3e847d59-b517-4d15-ae3a-1eff2ffb63b8',
          value: 'Двойного действия',
          property: 'Тип действия'
        },
        {
          id: '350674cb-b238-4a3f-88a0-2a19b7376c6a',
          value: '-20°C',
          property: 'T окружающей среды min'
        }
      ]
    }
  ]
};
