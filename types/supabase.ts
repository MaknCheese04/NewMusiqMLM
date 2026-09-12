export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      album_artists: {
        Row: {
          album_artist_id: number
          album_id: number | null
          appearance: string
          artist_id: number | null
          created_at: string
        }
        Insert: {
          album_artist_id?: number
          album_id?: number | null
          appearance?: string
          artist_id?: number | null
          created_at?: string
        }
        Update: {
          album_artist_id?: number
          album_id?: number | null
          appearance?: string
          artist_id?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_artists_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["album_id"]
          },
          {
            foreignKeyName: "album_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      album_rating_totals: {
        Row: {
          album_key: string
          rating_count: number
          rating_sum: number
        }
        Insert: {
          album_key: string
          rating_count: number
          rating_sum: number
        }
        Update: {
          album_key?: string
          rating_count?: number
          rating_sum?: number
        }
        Relationships: []
      }
      album_ratings: {
        Row: {
          album_id: number | null
          album_key: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          album_id?: number | null
          album_key: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          album_id?: number | null
          album_key?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_ratings_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["album_id"]
          },
        ]
      }
      album_songs: {
        Row: {
          album_id: number | null
          created_at: string
          id: number
          song_id: number | null
        }
        Insert: {
          album_id?: number | null
          created_at?: string
          id?: number
          song_id?: number | null
        }
        Update: {
          album_id?: number | null
          created_at?: string
          id?: number
          song_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "album_songs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["album_id"]
          },
          {
            foreignKeyName: "album_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      albums: {
        Row: {
          album_id: number
          cover_url: string | null
          created_at: string
          name: string
          release_year: number | null
        }
        Insert: {
          album_id?: number
          cover_url?: string | null
          created_at?: string
          name: string
          release_year?: number | null
        }
        Update: {
          album_id?: number
          cover_url?: string | null
          created_at?: string
          name?: string
          release_year?: number | null
        }
        Relationships: []
      }
      artists: {
        Row: {
          artist_id: number
          artwork_url: string | null
          career: string | null
          created_at: string
          name: string
          personality: string | null
          portrait_url: string | null
          tagline: string | null
        }
        Insert: {
          artist_id?: number
          artwork_url?: string | null
          career?: string | null
          created_at?: string
          name: string
          personality?: string | null
          portrait_url?: string | null
          tagline?: string | null
        }
        Update: {
          artist_id?: number
          artwork_url?: string | null
          career?: string | null
          created_at?: string
          name?: string
          personality?: string | null
          portrait_url?: string | null
          tagline?: string | null
        }
        Relationships: []
      }
      genres: {
        Row: {
          created_at: string
          genre_id: number
        }
        Insert: {
          created_at?: string
          genre_id?: number
        }
        Update: {
          created_at?: string
          genre_id?: number
        }
        Relationships: []
      }
      playlist_songs: {
        Row: {
          created_at: string
          playlist_id: number | null
          playlist_song_id: number
          song_id: number | null
        }
        Insert: {
          created_at?: string
          playlist_id?: number | null
          playlist_song_id?: number
          song_id?: number | null
        }
        Update: {
          created_at?: string
          playlist_id?: number | null
          playlist_song_id?: number
          song_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["playlist_id"]
          },
          {
            foreignKeyName: "playlist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          name: string
          playlist_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          name: string
          playlist_id?: number
          user_id?: string
        }
        Update: {
          created_at?: string
          name?: string
          playlist_id?: number
          user_id?: string
        }
        Relationships: []
      }
      song_artists: {
        Row: {
          artist_id: number
          created_at: string
          id: number
          song_id: number
        }
        Insert: {
          artist_id: number
          created_at?: string
          id?: number
          song_id: number
        }
        Update: {
          artist_id?: number
          created_at?: string
          id?: number
          song_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "song_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "song_artists_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      song_rating_totals: {
        Row: {
          rating_count: number
          rating_sum: number
          track_key: string
        }
        Insert: {
          rating_count: number
          rating_sum: number
          track_key: string
        }
        Update: {
          rating_count?: number
          rating_sum?: number
          track_key?: string
        }
        Relationships: []
      }
      song_ratings: {
        Row: {
          rating: number
          song_id: number | null
          track_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          rating: number
          song_id?: number | null
          track_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          rating?: number
          song_id?: number | null
          track_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_ratings_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      song_stream_totals: {
        Row: {
          stream_count: number
          track_key: string
        }
        Insert: {
          stream_count?: number
          track_key: string
        }
        Update: {
          stream_count?: number
          track_key?: string
        }
        Relationships: []
      }
      song_streams: {
        Row: {
          song_id: number | null
          stream_id: number
          streamed_at: string
          track_key: string
          user_id: string | null
        }
        Insert: {
          song_id?: number | null
          stream_id?: number
          streamed_at?: string
          track_key: string
          user_id?: string | null
        }
        Update: {
          song_id?: number | null
          stream_id?: number
          streamed_at?: string
          track_key?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_streams_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["song_id"]
          },
        ]
      }
      songs: {
        Row: {
          created_at: string
          name: string
          song_id: number
        }
        Insert: {
          created_at?: string
          name: string
          song_id?: number
        }
        Update: {
          created_at?: string
          name?: string
          song_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
