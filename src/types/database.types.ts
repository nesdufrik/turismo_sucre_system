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
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          password: string
          username: string
        }[]
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
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      categoriasservicio: {
        Row: {
          categoria_id: number
          color: string | null
          descripcion: string | null
          icono: string | null
          nombre: string | null
        }
        Insert: {
          categoria_id?: never
          color?: string | null
          descripcion?: string | null
          icono?: string | null
          nombre?: string | null
        }
        Update: {
          categoria_id?: never
          color?: string | null
          descripcion?: string | null
          icono?: string | null
          nombre?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ciudad: string | null
          cliente_id: number
          direccion: string | null
          documento_identidad: string | null
          email: string | null
          empresa: string | null
          fecha_creacion: string | null
          hoja_id: number | null
          nombre_completo: string | null
          notas_internas: string | null
          otros_datos: Json | null
          pais: string | null
          telefono: string | null
          tipo_cliente: string | null
        }
        Insert: {
          ciudad?: string | null
          cliente_id?: never
          direccion?: string | null
          documento_identidad?: string | null
          email?: string | null
          empresa?: string | null
          fecha_creacion?: string | null
          hoja_id?: number | null
          nombre_completo?: string | null
          notas_internas?: string | null
          otros_datos?: Json | null
          pais?: string | null
          telefono?: string | null
          tipo_cliente?: string | null
        }
        Update: {
          ciudad?: string | null
          cliente_id?: never
          direccion?: string | null
          documento_identidad?: string | null
          email?: string | null
          empresa?: string | null
          fecha_creacion?: string | null
          hoja_id?: number | null
          nombre_completo?: string | null
          notas_internas?: string | null
          otros_datos?: Json | null
          pais?: string | null
          telefono?: string | null
          tipo_cliente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_hoja_id_fkey"
            columns: ["hoja_id"]
            referencedRelation: "hojasdeprecios"
            referencedColumns: ["hoja_id"]
          },
        ]
      }
      componentespaquete: {
        Row: {
          cantidad: number | null
          paquete_id: number
          servicio_id: number
        }
        Insert: {
          cantidad?: number | null
          paquete_id: number
          servicio_id: number
        }
        Update: {
          cantidad?: number | null
          paquete_id?: number
          servicio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "componentespaquete_paquete_id_fkey"
            columns: ["paquete_id"]
            referencedRelation: "paquetes"
            referencedColumns: ["paquete_id"]
          },
          {
            foreignKeyName: "componentespaquete_servicio_id_fkey"
            columns: ["servicio_id"]
            referencedRelation: "servicios"
            referencedColumns: ["servicio_id"]
          },
        ]
      }
      configuracion_sistema: {
        Row: {
          created_at: string | null
          empresa_celular: string | null
          empresa_ciudad: string | null
          empresa_correo: string | null
          empresa_descripcion: string | null
          empresa_direccion: string | null
          empresa_fax: string | null
          empresa_logo_url: string | null
          empresa_nombre: string | null
          empresa_pais: string | null
          empresa_telefonos: string | null
          id: string
          porcentaje_comision_default: number
          porcentaje_impuesto_default: number
          tipo_cambio_oficial: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_celular?: string | null
          empresa_ciudad?: string | null
          empresa_correo?: string | null
          empresa_descripcion?: string | null
          empresa_direccion?: string | null
          empresa_fax?: string | null
          empresa_logo_url?: string | null
          empresa_nombre?: string | null
          empresa_pais?: string | null
          empresa_telefonos?: string | null
          id?: string
          porcentaje_comision_default?: number
          porcentaje_impuesto_default?: number
          tipo_cambio_oficial?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_celular?: string | null
          empresa_ciudad?: string | null
          empresa_correo?: string | null
          empresa_descripcion?: string | null
          empresa_direccion?: string | null
          empresa_fax?: string | null
          empresa_logo_url?: string | null
          empresa_nombre?: string | null
          empresa_pais?: string | null
          empresa_telefonos?: string | null
          id?: string
          porcentaje_comision_default?: number
          porcentaje_impuesto_default?: number
          tipo_cambio_oficial?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cotizaciones: {
        Row: {
          aprobado_por: string | null
          cantidad_pax: number | null
          cantidad_pax_ninos: number
          cliente_id: number | null
          codigo_referencia: string
          costo_tour_conductor: number
          cotizacion_id: number
          creado_por: string | null
          estado: string | null
          fecha_aprobacion: string | null
          fecha_creacion: string | null
          fecha_validez_hasta: string | null
          fuente_solicitud: string | null
          id_cuenta_bancaria: string | null
          meta_origen: Json | null
          moneda: string | null
          motivo_rechazo: string | null
          nombre_grupo: string | null
          notas_internas_agencia: string | null
          notas_para_cliente: string | null
          porcentaje_comision: number | null
          porcentaje_impuesto: number | null
          porcentaje_pago_ninos: number
          tiene_tour_conductor: boolean
          tipo_cambio: number | null
          total_general: number | null
        }
        Insert: {
          aprobado_por?: string | null
          cantidad_pax?: number | null
          cantidad_pax_ninos?: number
          cliente_id?: number | null
          codigo_referencia: string
          costo_tour_conductor?: number
          cotizacion_id?: never
          creado_por?: string | null
          estado?: string | null
          fecha_aprobacion?: string | null
          fecha_creacion?: string | null
          fecha_validez_hasta?: string | null
          fuente_solicitud?: string | null
          id_cuenta_bancaria?: string | null
          meta_origen?: Json | null
          moneda?: string | null
          motivo_rechazo?: string | null
          nombre_grupo?: string | null
          notas_internas_agencia?: string | null
          notas_para_cliente?: string | null
          porcentaje_comision?: number | null
          porcentaje_impuesto?: number | null
          porcentaje_pago_ninos?: number
          tiene_tour_conductor?: boolean
          tipo_cambio?: number | null
          total_general?: number | null
        }
        Update: {
          aprobado_por?: string | null
          cantidad_pax?: number | null
          cantidad_pax_ninos?: number
          cliente_id?: number | null
          codigo_referencia?: string
          costo_tour_conductor?: number
          cotizacion_id?: never
          creado_por?: string | null
          estado?: string | null
          fecha_aprobacion?: string | null
          fecha_creacion?: string | null
          fecha_validez_hasta?: string | null
          fuente_solicitud?: string | null
          id_cuenta_bancaria?: string | null
          meta_origen?: Json | null
          moneda?: string | null
          motivo_rechazo?: string | null
          nombre_grupo?: string | null
          notas_internas_agencia?: string | null
          notas_para_cliente?: string | null
          porcentaje_comision?: number | null
          porcentaje_impuesto?: number | null
          porcentaje_pago_ninos?: number
          tiene_tour_conductor?: boolean
          tipo_cambio?: number | null
          total_general?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            referencedRelation: "clientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cotizaciones_id_cuenta_bancaria_fkey"
            columns: ["id_cuenta_bancaria"]
            referencedRelation: "cuentas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas_bancarias: {
        Row: {
          banco: string
          created_at: string | null
          es_default: boolean | null
          id: string
          is_active: boolean | null
          moneda: string
          numero_cuenta: string
          tipo_cuenta: string
          titular: string
        }
        Insert: {
          banco: string
          created_at?: string | null
          es_default?: boolean | null
          id?: string
          is_active?: boolean | null
          moneda: string
          numero_cuenta: string
          tipo_cuenta: string
          titular: string
        }
        Update: {
          banco?: string
          created_at?: string | null
          es_default?: boolean | null
          id?: string
          is_active?: boolean | null
          moneda?: string
          numero_cuenta?: string
          tipo_cuenta?: string
          titular?: string
        }
        Relationships: []
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
            referencedRelation: "ubicaciones"
            referencedColumns: ["ubicacion_id"]
          },
        ]
      }
      itemscotizacion: {
        Row: {
          aplica_comision: boolean | null
          cantidad: number | null
          cotizacion_id: number | null
          descripcion_snapshot: string | null
          es_por_pax: boolean | null
          fecha_servicio: string | null
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
          aplica_comision?: boolean | null
          cantidad?: number | null
          cotizacion_id?: number | null
          descripcion_snapshot?: string | null
          es_por_pax?: boolean | null
          fecha_servicio?: string | null
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
          aplica_comision?: boolean | null
          cantidad?: number | null
          cotizacion_id?: number | null
          descripcion_snapshot?: string | null
          es_por_pax?: boolean | null
          fecha_servicio?: string | null
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
            referencedRelation: "cotizaciones"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "itemscotizacion_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            referencedRelation: "v_cotizaciones_detalles"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "itemscotizacion_habitacion_id_fkey"
            columns: ["habitacion_id"]
            referencedRelation: "tiposhabitacion"
            referencedColumns: ["habitacion_id"]
          },
          {
            foreignKeyName: "itemscotizacion_paquete_id_fkey"
            columns: ["paquete_id"]
            referencedRelation: "paquetes"
            referencedColumns: ["paquete_id"]
          },
          {
            foreignKeyName: "itemscotizacion_servicio_id_fkey"
            columns: ["servicio_id"]
            referencedRelation: "servicios"
            referencedColumns: ["servicio_id"]
          },
        ]
      }
      liquidaciones: {
        Row: {
          comprobante_pago: string | null
          comprobante_url: string | null
          cotizacion_id: number | null
          creado_por: string | null
          estado_pago: string
          fecha_liquidacion: string
          fecha_pago: string | null
          liquidacion_id: number
          metodo_pago: string | null
          monto_total: number
          notas: string | null
        }
        Insert: {
          comprobante_pago?: string | null
          comprobante_url?: string | null
          cotizacion_id?: number | null
          creado_por?: string | null
          estado_pago?: string
          fecha_liquidacion?: string
          fecha_pago?: string | null
          liquidacion_id?: number
          metodo_pago?: string | null
          monto_total: number
          notas?: string | null
        }
        Update: {
          comprobante_pago?: string | null
          comprobante_url?: string | null
          cotizacion_id?: number | null
          creado_por?: string | null
          estado_pago?: string
          fecha_liquidacion?: string
          fecha_pago?: string | null
          liquidacion_id?: number
          metodo_pago?: string | null
          monto_total?: number
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liquidaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            referencedRelation: "cotizaciones"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "liquidaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            referencedRelation: "v_cotizaciones_detalles"
            referencedColumns: ["cotizacion_id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          fecha_creacion: string | null
          id: string
          leida: boolean | null
          link: string | null
          mensaje: string
          metadata: Json | null
          tipo: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          fecha_creacion?: string | null
          id?: string
          leida?: boolean | null
          link?: string | null
          mensaje: string
          metadata?: Json | null
          tipo?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          fecha_creacion?: string | null
          id?: string
          leida?: boolean | null
          link?: string | null
          mensaje?: string
          metadata?: Json | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
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
      permissions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: number
          module: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: number
          module: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: number
          module?: string
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
            referencedRelation: "tiposhabitacion"
            referencedColumns: ["habitacion_id"]
          },
          {
            foreignKeyName: "precioshabitacion_hoja_id_fkey"
            columns: ["hoja_id"]
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
            referencedRelation: "hojasdeprecios"
            referencedColumns: ["hoja_id"]
          },
          {
            foreignKeyName: "preciosservicio_servicio_id_fkey"
            columns: ["servicio_id"]
            referencedRelation: "servicios"
            referencedColumns: ["servicio_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          profile_id: string
          status: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          profile_id: string
          status?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          profile_id?: string
          status?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: number
          role_id: number
        }
        Insert: {
          permission_id: number
          role_id: number
        }
        Update: {
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
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
            referencedRelation: "categoriasservicio"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "servicios_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
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
            referencedRelation: "hoteles"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      ubicaciones: {
        Row: {
          ciudad: string | null
          codigo: string | null
          pais: string | null
          ubicacion_id: number
        }
        Insert: {
          ciudad?: string | null
          codigo?: string | null
          pais?: string | null
          ubicacion_id?: never
        }
        Update: {
          ciudad?: string | null
          codigo?: string | null
          pais?: string | null
          ubicacion_id?: never
        }
        Relationships: []
      }
      user_invites: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          role: string
          token: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          role: string
          token?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invites_role_fkey"
            columns: ["role"]
            referencedRelation: "roles"
            referencedColumns: ["name"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          role_id: number
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          role_id: number
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      v_cotizaciones_detalles: {
        Row: {
          cantidad_pax: number | null
          cantidad_pax_ninos: number | null
          cliente_documento: string | null
          cliente_email: string | null
          cliente_empresa: string | null
          cliente_id: number | null
          cliente_nombre: string | null
          cliente_telefono: string | null
          codigo_referencia: string | null
          costo_tour_conductor: number | null
          cotizacion_id: number | null
          creado_por: string | null
          estado: string | null
          fecha_creacion: string | null
          fecha_validez_hasta: string | null
          fuente_solicitud: string | null
          id_cuenta_bancaria: string | null
          moneda: string | null
          nombre_grupo: string | null
          porcentaje_comision: number | null
          porcentaje_impuesto: number | null
          porcentaje_pago_ninos: number | null
          tiene_tour_conductor: boolean | null
          tipo_cambio: number | null
          total_general: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            referencedRelation: "clientes"
            referencedColumns: ["cliente_id"]
          },
          {
            foreignKeyName: "cotizaciones_id_cuenta_bancaria_fkey"
            columns: ["id_cuenta_bancaria"]
            referencedRelation: "cuentas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      v_liquidaciones_detalles: {
        Row: {
          cantidad_pax: number | null
          cliente_email: string | null
          cliente_empresa: string | null
          cliente_nombre: string | null
          codigo_referencia: string | null
          comprobante_pago: string | null
          comprobante_url: string | null
          cotizacion_id: number | null
          creado_por: string | null
          estado_pago: string | null
          fecha_liquidacion: string | null
          fecha_pago: string | null
          liquidacion_id: number | null
          metodo_pago: string | null
          moneda: string | null
          monto_total: number | null
          nombre_grupo: string | null
          notas: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liquidaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            referencedRelation: "cotizaciones"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "liquidaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            referencedRelation: "v_cotizaciones_detalles"
            referencedColumns: ["cotizacion_id"]
          },
        ]
      }
    }
    Functions: {
      assign_user_role: {
        Args: { target_role_name: string; target_user_id: string }
        Returns: undefined
      }
      check_permission: {
        Args: { required_permission: string }
        Returns: boolean
      }
      fn_sync_user_claims: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      generate_unique_quote_reference: { Args: never; Returns: string }
      get_audit_tables: { Args: never; Returns: string[] }
      get_invite_details: { Args: { lookup_token: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      jsonb_diff_val: { Args: { val1: Json; val2: Json }; Returns: Json }
      liquidar_cotizacion: {
        Args: { p_cotizacion_id: number; p_usuario_id: string }
        Returns: number
      }
      remove_user_roles: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      sync_profile_emails: { Args: never; Returns: undefined }
      system_assign_user_role: {
        Args: { target_role_id: number; target_user_id: string }
        Returns: undefined
      }
      system_delete_invite: { Args: { target_id: string }; Returns: undefined }
      system_find_invite_by_email: {
        Args: { lookup_email: string }
        Returns: {
          email: string
          id: string
          role: string
        }[]
      }
      toggle_user_status: {
        Args: { new_status: string; target_user_id: string }
        Returns: undefined
      }
      update_role_permissions: {
        Args: { new_permission_ids: number[]; target_role_id: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  pgbouncer: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
