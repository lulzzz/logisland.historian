import { ITag, Tag } from '../modele/tag';
import { TagUtils } from '../modele/TagUtils';

export enum TypesName {
  TAGS = 'tags',
  DOMAIN = 'domain',
  SERVER = 'server',
  GROUP = 'group',
  FOLDER = 'folder',
  TAG_OPC = 'opc-tag',
  TAG_HISTORIAN = 'historian-tag',
  TAG_IN_DATASET = 'tag-in-dataset',
}

export namespace TypesName {
  export function getType(tag: ITag): TypesName {
    if (TagUtils.isHistorianTag(tag)) return TypesName.TAG_HISTORIAN;
    return TypesName.TAG_OPC;
  }
}
