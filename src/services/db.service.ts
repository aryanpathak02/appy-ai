import { Model, RootFilterQuery } from "mongoose";

/**
 * db.service.ts — Generic reusable mongoose CRUD operations.
 * Pass any mongoose model in — works for User, Job, or any future model.
 */

export const dbService = {
  /** Find a single document matching the filter */
  findOne<T>(model: Model<T>, filter: RootFilterQuery<T>) {
    return model.findOne(filter).lean().exec();
  },

  /** Find a single document by its _id */
  findById<T>(model: Model<T>, id: string) {
    return model.findById(id).lean().exec();
  },

  /** Find all documents matching the filter */
  findMany<T>(model: Model<T>, filter: RootFilterQuery<T> = {}) {
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
