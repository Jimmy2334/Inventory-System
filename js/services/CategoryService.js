import { StorageManager } from "../utils/StorageManager.js";
import { Validator } from "../utils/Validator.js";
import { ActivityLogService } from "../services/ActivityLogService.js";

export class CategoryService {
  /************** getAll methoud***********/
  getAll() {
    return StorageManager.get("categories") ?? [];
  }

  /**************add category methoud***********/
  add(category) {
    //getAll categories
    const categories = this.getAll();
    //check category is empty or not
    if (!category || !category.trim()) {
      throw new Error("Category name is empty");
    }

    //check unique category
    const duplicateCategory = categories.find(
      (c) => c.toUpperCase() === category.toUpperCase(),
    );
    if (duplicateCategory) {
      throw new Error("Duplicate Category");
    }
    //push category
    categories.push(category);

    //add the product array to the local storage
    StorageManager.set("categories", categories);

    //save the activity
    ActivityLogService.log(`Added category: ${category}`);
  }

  /**************delete category methoud***********/
  delete(category) {
    //getAll categories
    const categories = this.getAll();
    //get the category i want to delete
    const deletedCategory = categories.find(
      (c) => c.toUpperCase() === category.toUpperCase(),
    );
    if (!deletedCategory) throw new Error("Category not found");

    //check if this category is in use or not
    const products = StorageManager.get("products") ?? [];

    const categoryInUse = products.find((p) => p.category === category);
    if (categoryInUse)
      throw new Error(
        `Cannot delete "${category}" it is used by existing products`,
      );
    //delete category from array
    const updatedCategories = categories.filter(
      (c) => c.toUpperCase() !== category.toUpperCase(),
    );
    //update the local storage
    StorageManager.set("categories", updatedCategories);
    //save the activity
    ActivityLogService.log(`Deleted category: ${category}`);
  }

  /**************edit category methoud***********/
  edit(category, updatedCategory) {
    //getAll categories
    const categories = this.getAll();
    //get the category i want to edit

    const editedCategory = categories.find(
      (c) => c.toUpperCase() === category.toUpperCase(),
    );

    if (!editedCategory) throw new Error("Category not found");
    //check if the update category name exist
    const duplicate = categories.find(
      (c) => c.toUpperCase() === updatedCategory.toUpperCase(),
    );
    if (duplicate) throw new Error("Category already exists");
    //edit product from array
    const updatedCategories = categories.map((c) => {
      if (c.toUpperCase() === category.toUpperCase()) {
        return updatedCategory;
      }
      return c;
    });
    //update the local storage
    StorageManager.set("categories", updatedCategories);
    //save the activity
    ActivityLogService.log(
      `Edited category from ${category} to ${updatedCategory}`,
    );
    /***********************Update products that have old category name ******************** */
    const products = StorageManager.get("products") ?? [];
    const updateProducts = products.map((p) => {
      if (p.category.toUpperCase() === category.toUpperCase()) {
        return { ...p, category: updatedCategory };
      } else {
        return p;
      }
    });
    //update the local storage
    StorageManager.set("products", updateProducts);
    //save the activity
    ActivityLogService.log(
      `updated Products category name from ${category} to ${updatedCategory}`,
    );
  }
}
