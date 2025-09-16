export interface GetItems {
  count: number;
  rows: GetItemsRows[];
}

export interface GetItemsRows {
  id: string;
  article: string;
  type: string;
  title: string;
  attributes: {
    id: string;
    value: string;
    property: string;
  }[];
}
