export interface SermonWithRelations {
  id: string; user_id: string; title: string; content: Record<string, unknown> | string; plain_text: string;
  cover_id: string | null; is_favorite: boolean; archived: boolean; archived_at: string | null;
  archived_reason: string | null; created_at: string; updated_at: string;
  categories?: Array<{ category: { id: string; name: string; color: string | null } }>;
  tags?: Array<{ tag: { id: string; name: string } }>;
  cover?: { id: string; url: string; is_premium: boolean } | null
}
