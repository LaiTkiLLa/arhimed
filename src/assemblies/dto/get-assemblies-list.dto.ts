import { Assemblies } from '../entities/assemblies.entity';
import { GetAssembliesRows } from '../interfaces/get-assemblies-list.interface';

export class GetAssembliesListDto {
  static mapModels(models: Assemblies[]): GetAssembliesRows[] {
    return models.map(model => {
      return {
        id: model.id,
        article: model.article
      };
    });
  }
}
