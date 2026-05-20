import { supabaseAdmin } from "@/lib/supabase";
import CategoryImageManager from "./CategoryImageManager";

async function getCategories() {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, imageUrl, description, sortOrder")
    .order("sortOrder", { ascending: true });
  return data ?? [];
}

export const metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Parts Categories</h1>
      <p className="text-gray-400 text-sm mb-8">
        Click the camera icon on any category to upload a custom image.
      </p>

      <CategoryImageManager categories={categories} />
    </div>
  );
}
