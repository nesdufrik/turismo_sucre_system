export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      auditoria: {
        Row: {
          accion: string
          id: string
          ip_address: unknown
          registro_id: number
          tabla_nombre: string
          timestamp: string | null
          user_agent: string | null
          usuario_id: string | null
          valores_anteriores: Json | null
          valores_nuevos: Json | null
        }
        Insert: {
          accion: string
          id?: string
          ip_address?: unknown
          registro_id: number
          tabla_nombre: string
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
          valores_anteriores?: Json | null
          valores_nuevos?: Json | null
        }
        Update: {
          accion?: string
          id?: string
          ip_address?: unknown
          registro_id?: number
          tabla_nombre?: string
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
          valores_anteriores?: Json | null
          valores_nuevos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      categoriasservicio: {
        Row: {
          categoria_id: number
          nombre: string | null
        }
        Insert: {
          categoria_id?: never
          nombre?: string | null
        }
        Update: {
          categoria_id?: never
          nombre?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cliente_id: number
          email: string | null
          empresa: string | null
          fecha_creacion: string | null
          hoja_id: number | null
          nombre_completo: string | null
          telefono: string | null
        }
        Insert: {
          cliente_id?: never
          email?: string | null
          empresa?: string | null
          fecha_creacion?: string | null
          hoja_id?: number | null
          nombre_completo?: string | null
          telefono?: string | null
        }
        Update: {
          cliente_id?: never
          email?: string | null
          empresa?: string | null
          fecha_creacion?: string | null
          hoja_id?: number | null
          nombre_completo?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_hoja_id_fkey"
            columns: ["hoja_id"]
            isOneToOne: false
            referencedRelation: "hojasdeprecios"
            referencedColumns: ["hoja_id"]
          },
        ]
      }
      componentespaquete: {
        Row: {
          cantidad: number | null
          paquete_id: number | null
          servicio_id: number | null
        }
        Insert: {
          cantidad?: number | null
          paquete_id?: number | null
          servicio_id?: number | null
        }
        Update: {
          cantidad?: number | null
          paquete_id?: number | null
          servicio_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "componentespaquete_paquete_id_fkey"
            columns: ["paquete_id"]
            isOneToOne: false
            referencedRelation: "paquetes"
            referencedColumns: ["paquete_id"]
          },
          {
            foreignKeyName: "componentespaquete_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["servicio_id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          cliente_id: number | null
          cotizacion_id: number
          estado: string | null
          fecha_creacion: string | null
          fecha_validez_hasta: string | null
          fuente_solicitud: string | null
          moneda: string | null
          notas_internas_agencia: string | null
          notas_para_cliente: string | null
          total_general: number | null
        }
        Insert: {
          cliente_id?: number | null
          cotizacion_id?: never
          estado?: string | null
          fecha_creacion?: string | null
          fecha_validez_hasta?: string | null
          fuente_solicitud?: string | null
          moneda?: string | null
          notas_internas_agencia?: string | null
          notas_para_cliente?: string | null
          total_general?: number | null
        }
        Update: {
          cliente_id?: number | null
          cotizacion_id?: never
          estado?: string | null
          fecha_creacion?: string | null
          fecha_validez_hasta?: string | null
          fuente_solicitud?: string | null
          moneda?: string | null
          notas_internas_agencia?: string | null
          notas_para_cliente?: string | null
          total_general?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["cliente_id"]
          },
        ]
      }
      hojasdeprecios: {
        Row: {
          es_default: boolean | null
          hoja_id: number
          nombre: string | null
        }
        Insert: {
          es_default?: boolean | null
          hoja_id?: never
          nombre?: string | null
        }
        Update: {
          es_default?: boolean | null
          hoja_id?: never
          nombre?: string | null
        }
        Relationships: []
      }
      hoteles: {
        Row: {
          categoria: string | null
          hotel_id: number
          incluye_impuestos: boolean | null
          info_desayuno: string | null
          nombre: string | null
          ubicacion_id: number | null
        }
        Insert: {
          categoria?: string | null
          hotel_id?: never
          incluye_impuestos?: boolean | null
          info_desayuno?: string | null
          nombre?: string | null
          ubicacion_id?: number | null
        }
        Update: {
          categoria?: string | null
          hotel_id?: never
          incluye_impuestos?: boolean | null
          info_desayuno?: string | null
          nombre?: string | null
          ubicacion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hoteles_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["ubicacion_id"]
          },
        ]
      }
      itemscotizacion: {
        Row: {
          cantidad: number | null
          cotizacion_id: number | null
          descripcion_snapshot: string | null
          fecha_servicio_fin: string | null
          fecha_servicio_inicio: string | null
          habitacion_id: number | null
          item_id: number
          numero_pax: number | null
          paquete_id: number | null
          precio_unitario_snapshot: number | null
          servicio_id: number | null
          subtotal_item: number | null
        }
        Insert: {
          cantidad?: number | null
          cotizacion_id?: number | null
          descripcion_snapshot?: string | null
          fecha_servicio_fin?: string | null
          fecha_servicio_inicio?: string | null
          habitacion_id?: number | null
          item_id?: never
          numero_pax?: number | null
          paquete_id?: number | null
          precio_unitario_snapshot?: number | null
          servicio_id?: number | null
          subtotal_item?: number | null
        }
        Update: {
          cantidad?: number | null
          cotizacion_id?: number | null
          descripcion_snapshot?: string | null
          fecha_servicio_fin?: string | null
          fecha_servicio_inicio?: string | null
          habitacion_id?: number | null
          item_id?: never
          numero_pax?: number | null
          paquete_id?: number | null
          precio_unitario_snapshot?: number | null
          servicio_id?: number | null
          subtotal_item?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itemscotizacion_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "itemscotizacion_habitacion_id_fkey"
            columns: ["habitacion_id"]
            isOneToOne: false
            referencedRelation: "tiposhabitacion"
            referencedColumns: ["habitacion_id"]
          },
          {
            foreignKeyName: "itemscotizacion_paquete_id_fkey"
            columns: ["paquete_id"]
            isOneToOne: false
            referencedRelation: "paquetes"
            referencedColumns: ["paquete_id"]
          },
          {
            foreignKeyName: "itemscotizacion_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["servicio_id"]
          },
        ]
      }
      paquetes: {
        Row: {
          descripcion: string | null
          nombre_paquete: string | null
          paquete_id: number
        }
        Insert: {
          descripcion?: string | null
          nombre_paquete?: string | null
          paquete_id?: never
        }
        Update: {
          descripcion?: string | null
          nombre_paquete?: string | null
          paquete_id?: never
        }
        Relationships: []
      }
      precioshabitacion: {
        Row: {
          habitacion_id: number | null
          hoja_id: number | null
          precio_hab_id: number
          precio_por_noche: number | null
          temporada: string | null
        }
        Insert: {
          habitacion_id?: number | null
          hoja_id?: number | null
          precio_hab_id?: never
          precio_por_noche?: number | null
          temporada?: string | null
        }
        Update: {
          habitacion_id?: number | null
          hoja_id?: number | null
          precio_hab_id?: never
          precio_por_noche?: number | null
          temporada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precioshabitacion_habitacion_id_fkey"
            columns: ["habitacion_id"]
            isOneToOne: false
            referencedRelation: "tiposhabitacion"
            referencedColumns: ["habitacion_id"]
          },
          {
            foreignKeyName: "precioshabitacion_hoja_id_fkey"
            columns: ["hoja_id"]
            isOneToOne: false
            referencedRelation: "hojasdeprecios"
            referencedColumns: ["hoja_id"]
          },
        ]
      }
      preciosservicio: {
        Row: {
          hoja_id: number | null
          max_pax: number | null
          min_pax: number | null
          precio_id: number
          precio_por_persona: number | null
          servicio_id: number | null
          temporada: string | null
          valido_desde: string | null
          valido_hasta: string | null
        }
        Insert: {
          hoja_id?: number | null
          max_pax?: number | null
          min_pax?: number | null
          precio_id?: never
          precio_por_persona?: number | null
          servicio_id?: number | null
          temporada?: string | null
          valido_desde?: string | null
          valido_hasta?: string | null
        }
        Update: {
          hoja_id?: number | null
          max_pax?: number | null
          min_pax?: number | null
          precio_id?: never
          precio_por_persona?: number | null
          servicio_id?: number | null
          temporada?: string | null
          valido_desde?: string | null
          valido_hasta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preciosservicio_hoja_id_fkey"
            columns: ["hoja_id"]
            isOneToOne: false
            referencedRelation: "hojasdeprecios"
            referencedColumns: ["hoja_id"]
          },
          {
            foreignKeyName: "preciosservicio_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["servicio_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          profile_id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          profile_id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          profile_id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      servicios: {
        Row: {
          categoria_id: number | null
          codigo: string | null
          descripcion: string | null
          duracion_texto: string | null
          nombre: string | null
          servicio_id: number
          ubicacion_id: number | null
        }
        Insert: {
          categoria_id?: number | null
          codigo?: string | null
          descripcion?: string | null
          duracion_texto?: string | null
          nombre?: string | null
          servicio_id?: never
          ubicacion_id?: number | null
        }
        Update: {
          categoria_id?: number | null
          codigo?: string | null
          descripcion?: string | null
          duracion_texto?: string | null
          nombre?: string | null
          servicio_id?: never
          ubicacion_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "servicios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categoriasservicio"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "servicios_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            isOneToOne: false
            referencedRelation: "ubicaciones"
            referencedColumns: ["ubicacion_id"]
          },
        ]
      }
      tiposhabitacion: {
        Row: {
          capacidad_personas: number | null
          habitacion_id: number
          hotel_id: number | null
          precio_por_noche: number | null
          tipo: string | null
        }
        Insert: {
          capacidad_personas?: number | null
          habitacion_id?: never
          hotel_id?: number | null
          precio_por_noche?: number | null
          tipo?: string | null
        }
        Update: {
          capacidad_personas?: number | null
          habitacion_id?: never
          hotel_id?: number | null
          precio_por_noche?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiposhabitacion_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hoteles"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      ubicaciones: {
        Row: {
          ciudad: string | null
          ubicacion_id: number
        }
        Insert: {
          ciudad?: string | null
          ubicacion_id?: never
        }
        Update: {
          ciudad?: string | null
          ubicacion_id?: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

