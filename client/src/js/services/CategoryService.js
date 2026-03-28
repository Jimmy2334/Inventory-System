import { StorageManager } from "../utils/StorageManager.js";
import { Validator } from "../utils/Validator.js";
import { ActivityLogService } from "../services/ActivityLogService.js";

export class CategoryService {
  /************** getAll methoud***********/
  async getAll() {
    return await StorageManager.getAll("categories");
  }

  /**************add category methoud***********/
  async add(categoryName) {
    //getAll categories
    const categories = await this.getAll();

    //check category is empty or not
    if (!categoryName || !categoryName.trim()) {
      throw new Error("Category name is empty");
    }

    //check unique category
    const duplicateCategory = categories.find(
      (c) => c.name.toUpperCase() === categoryName.toUpperCase(),
    );
    if (duplicateCategory) {
      throw new Error("Duplicate Category");
    }
    //add id to category
    const category = {};
    category.name = categoryName.trim();
    category.id = crypto.randomUUID();
    //push category
    categories.push(category);

    //add to storage
    await StorageManager.create("categories", category);

    //save the activity
    await ActivityLogService.log(
      "category added",
      `Added category: ${categoryName}`,
    );
  }

  /**************delete category methoud***********/
  async delete(categoryId) {
    const categories = await this.getAll();
    //get the category i want to delete
    const deletedCategory = categories.find((c) => c.id === categoryId);
    if (!deletedCategory) throw new Error("Category not found");

    //check if this category is in use or not
    const products = await StorageManager.getAll("products");

    const categoryInUse = products.find((p) => p.categoryId === categoryId);
    if (categoryInUse)
      throw new Error(
        `Cannot delete "${deletedCategory.name}" it is used by existing products`,
      );
    //delete category from array
    const updatedCategories = categories.filter((c) => c.id !== categoryId);
    //update the local storage

    //delete category
    await StorageManager.delete("categories", categoryId);
    await ActivityLogService.log(
      "category deleted",
      `Deleted category: ${deletedCategory.name}`,
    );
  }

  /**************edit category methoud***********/
  async edit(categoryId, newName) {
    const categories = await this.getAll();
    //get the category i want to edit

    const editedCategory = categories.find((c) => c.id === categoryId);

    if (!editedCategory) throw new Error("Category not found");
    //check if the update category name exist
    const duplicate = categories.find(
      (c) => c.name.toUpperCase() === newName.toUpperCase(),
    );
    if (duplicate) throw new Error("Category already exists");
    //edit product from array
    const updatedCategories = categories.map((c) => {
      return c.id === categoryId ? { ...c, name: newName } : c;
    });
    //update the local storage

    //patch category name
    await StorageManager.patch("categories", categoryId, { name: newName });

    //save the activity
    await ActivityLogService.log(
      "category edited",
      `Edited category from ${editedCategory.name} to ${newName}`,
    );
  }
}
