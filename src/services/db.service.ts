import { Model } from "mongoose";

/**
 * db.service.ts — Generic reusable mongoose CRUD operations.
 * Pass any mongoose model in — works for User, Job, or any future model.
 *
 * We use Record<string, unknown> for filter types because mongoose 9.x does not
 * export FilterQuery / QueryFilter as named exports, and the Parameters<> utility
 * resolves to an incompatible Query overload. At runtime mongoose accepts plain
 * objects as filters — this typing is intentionally permissive for a generic layer.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongoFilter = Record<string, any>;

export const dbService = {
  /** Find a single document matching the filter */
  findOne<T>(model: Model<T>, filter: MongoFilter) {
    return model.findOne(filter).lean().exec();
  },

  /** Find a single document by its _id */
  findById<T>(model: Model<T>, id: string) {
    return model.findById(id).lean().exec();
  },

  /** Find all documents matching the filter */
  findMany<T>(model: Model<T>, filter: MongoFilter = {}) {
    return model.find(filter).lean().exec();
  },

  /** Create a new document */
  create<T>(model: Model<T>, data: Partial<T>) {
    return model.create(data);
  },

  /** Update a document by _id and return the updated doc */
  update<T>(model: Model<T>, id: string, data: Parameters<Model<T>["findByIdAndUpdate"]>[1]) {
    return model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .lean()
      .exec();
  },

  /** Delete a document by _id */
  delete<T>(model: Model<T>, id: string) {
    return model.findByIdAndDelete(id).lean().exec();
  },
};
