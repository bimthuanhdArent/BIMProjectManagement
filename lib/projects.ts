import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "project-images";
const TABLE_NAME = "projects";

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  warnings: number;
  file_size_mb: number;
  image_url: string | null;
  created_at: string;
}

export interface RevitProject {
  id: string;
  name: string;
  warnings: number;
  fileSizeMb: number;
  imageUrl: string | null;
  createdAt: Date;
}

function rowToProject(row: ProjectRow): RevitProject {
  return {
    id: row.id,
    name: row.name,
    warnings: row.warnings ?? 0,
    fileSizeMb: Number(row.file_size_mb) ?? 0,
    imageUrl: row.image_url ?? null,
    createdAt: new Date(row.created_at),
  };
}

export async function fetchProjects(userId: string): Promise<{ data: RevitProject[]; error: Error | null }> {
  const client = supabase;
  if (!client) {
    return { data: [], error: new Error("Supabase is not configured.") };
  }
  try {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return { data: [], error: new Error(error.message) };
    return { data: (data ?? []).map((r) => rowToProject(r as ProjectRow)), error: null };
  } catch (e) {
    return { data: [], error: e instanceof Error ? e : new Error("Connection error.") };
  }
}

export async function addProject(
  userId: string,
  payload: { name: string; warnings: number; fileSizeMb: number; imageUrl?: string | null }
): Promise<{ data: RevitProject | null; error: Error | null }> {
  const client = supabase;
  if (!client) {
    return { data: null, error: new Error("Supabase is not configured.") };
  }
  try {
    const { data, error } = await client
      .from(TABLE_NAME)
      .insert({
        user_id: userId,
        name: payload.name,
        warnings: payload.warnings,
        file_size_mb: payload.fileSizeMb,
        image_url: payload.imageUrl ?? null,
      })
      .select()
      .single();
    if (error) return { data: null, error: new Error(error.message) };
    return { data: rowToProject(data as ProjectRow), error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error("Failed to add project.") };
  }
}

export async function deleteProject(projectId: string): Promise<{ error: Error | null }> {
  const client = supabase;
  if (!client) {
    return { error: new Error("Supabase is not configured.") };
  }
  try {
    const { error } = await client.from(TABLE_NAME).delete().eq("id", projectId);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e : new Error("Failed to delete project.") };
  }
}

export async function uploadProjectImage(file: File): Promise<{ url: string | null; error: Error | null }> {
  const client = supabase;
  if (!client) {
    return { url: null, error: new Error("Supabase is not configured.") };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;
  try {
    const { error } = await client.storage.from(BUCKET_NAME).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return { url: null, error: new Error(error.message) };
    const { data: urlData } = client.storage.from(BUCKET_NAME).getPublicUrl(path);
    return { url: urlData.publicUrl, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e : new Error("Image upload failed.") };
  }
}
