import { NoResultError, sql } from 'kysely';

import Database from './Database';
import Model, { type ModelType } from './Model';
import applyPlugins from './plugins/applyPlugins';
import updatedAt from './plugins/updatedAt';
import slug from './plugins/slug';
import globalId from './plugins/globalId';

export {
  Database,
  Model,

  // plugins
  applyPlugins,
  updatedAt,
  slug,
  globalId,

  // kysely reexport
  NoResultError,
  sql,
};

// types
export type { ModelType };
