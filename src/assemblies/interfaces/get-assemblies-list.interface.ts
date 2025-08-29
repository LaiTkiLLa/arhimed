export interface GetAssembliesList {
  count: number;
  rows: GetAssembliesRows[];
}

export interface GetAssembliesRows {
  id: string;
  article: string;
}
