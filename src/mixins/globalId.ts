import { type SelectType, Selectable } from 'kysely';
import { type Model } from './model';

function base64(i: string): string {
  return Buffer.from(i, 'utf8').toString('base64');
}

function unbase64(i: string): string {
  return Buffer.from(i, 'base64').toString('utf8');
}

function fromGlobalId(globalId: string): {
  type: string;
  id: string;
} {
  const unbasedGlobalId = unbase64(globalId);
  const delimiterPos = unbasedGlobalId.indexOf(':');

  const type = unbasedGlobalId.substring(0, delimiterPos);
  const id: string | number = unbasedGlobalId.substring(delimiterPos + 1);

  if (!type || !id) {
    throw new Error('Node type or id is not defined in globalId');
  }

  return {
    type,
    id,
  };
}

export default function globalId<DB, TableName extends keyof DB & string, IdColumnName extends keyof DB[TableName] & string, TBase extends Model<DB, TableName, IdColumnName>>(Base: TBase) {
  type Table = DB[TableName];
  type IdColumn = SelectType<Table[IdColumnName]>;
  type Data = Selectable<Table>;
  
  return class GlobalId extends Base {
    static getGlobalId(data: Data): string {
      const value = data[this.id as unknown as keyof Data & string];
      if (typeof value === 'string' || typeof value === 'number') {
        return base64([this.table, value.toString()].join(':'));
      }
      
      throw new Error('Id is not defined');
    }

    static getLocalId(globalId: string) {
      const { type, id } = fromGlobalId(globalId);

      if (this.table !== type) {
        throw new Error(`Model ${this.table} is not model ${type}`);
      }

      return id;
    }

    static findByGlobalId(globalId: string) {
      const id = this.getLocalId(globalId) as IdColumn;
      return this.findById(id);
    }

    static getByGlobalId(globalId: string) {
      const id = this.getLocalId(globalId) as IdColumn;
      return this.getById(id);
    }

    static findByGlobalIds(globalIds: string[]) {
      const ids = globalIds.map((globalId) => this.getLocalId(globalId) as IdColumn);
      return this.findByIds(ids);
    }
  }
}

