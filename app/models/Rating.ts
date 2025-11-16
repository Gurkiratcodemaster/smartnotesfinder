import Database from "@/lib/database";
import { v4 as uuidv4 } from 'uuid';

export interface IRating {
  id: string;
  file_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class Rating {
  static async create(ratingData: {
    file_id: string;
    user_id: string;
    rating: number;
    comment?: string;
  }): Promise<IRating> {
    const id = uuidv4();
    const now = new Date();

    const ratingRecord = {
      id,
      file_id: ratingData.file_id,
      user_id: ratingData.user_id,
      rating: ratingData.rating,
      review: ratingData.comment || undefined,
    };

    await Database.createRating(ratingRecord);

    return {
      id,
      file_id: ratingData.file_id,
      user_id: ratingData.user_id,
      rating: ratingData.rating,
      comment: ratingData.comment,
      created_at: now,
      updated_at: now
    };
  }

  static async findByFileAndUser(fileId: string, userId: string): Promise<IRating | null> {
    const rating = await Database.getRatingByFileAndUser(fileId, userId) as any;

    if (!rating) return null;

    return {
      id: rating.id,
      file_id: rating.file_id,
      user_id: rating.user_id,
      rating: rating.rating,
      comment: rating.review,
      created_at: new Date(rating.created_at),
      updated_at: new Date(rating.updated_at)
    };
  }

  static async findByFile(fileId: string): Promise<IRating[]> {
    const ratings = await Database.getRatingsByFile(fileId) as any[];

    return ratings.map(rating => ({
      id: rating.id,
      file_id: rating.file_id,
      user_id: rating.user_id,
      rating: rating.rating,
      comment: rating.review,
      created_at: new Date(rating.created_at),
      updated_at: new Date(rating.updated_at)
    }));
  }

  static async updateById(id: string, updateData: {
    rating?: number;
    comment?: string;
  }): Promise<boolean> {
    try {
      // Map comment to review for database
      const dbUpdateData = {
        rating: updateData.rating,
        review: updateData.comment
      };
      await Database.updateRating(id, dbUpdateData);
      return true;
    } catch (error) {
      console.error('Error updating rating:', error);
      return false;
    }
  }

  static async deleteById(id: string): Promise<boolean> {
    try {
      await Database.deleteRating(id);
      return true;
    } catch (error) {
      console.error('Error deleting rating:', error);
      return false;
    }
  }

  static async getAverageRating(fileId: string): Promise<number> {
    const result = await Database.getAverageRating(fileId);
    return result?.average || 0;
  }

  static async getRatingCount(fileId: string): Promise<number> {
    const result = await Database.getRatingCount(fileId);
    return result?.count || 0;
  }

  static async list(limit: number = 50, offset: number = 0): Promise<IRating[]> {
    const ratings = await Database.getRatings(limit, offset) as any[];

    return ratings.map(rating => ({
      id: rating.id,
      file_id: rating.file_id,
      user_id: rating.user_id,
      rating: rating.rating,
      comment: rating.review,
      created_at: new Date(rating.created_at),
      updated_at: new Date(rating.updated_at)
    }));
  }
}

export default Rating;