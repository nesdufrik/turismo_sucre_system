/**
 * Utilidades para procesamiento de imágenes en el cliente
 */

export const ImageUtils = {
  /**
   * Procesa una imagen para usarla como avatar:
   * - Redimensiona a un tamaño cuadrado (default 256px)
   * - Recorta al centro para evitar deformaciones
   * - Convierte a formato WebP para máxima compresión
   */
  async processAvatar(file: File, size = 256): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'))
            return
          }

          // Calcular dimensiones para el recorte cuadrado central (Object-fit: cover)
          let sx = 0, sy = 0, sw = img.width, sh = img.height
          
          if (img.width > img.height) {
            sx = (img.width - img.height) / 2
            sw = img.height
          } else {
            sy = (img.height - img.width) / 2
            sh = img.width
          }

          // Dibujar con suavizado
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)
          
          // Convertir a WebP
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Error al generar el Blob de la imagen'))
            },
            'image/webp',
            0.85 // Calidad del 85% (balance ideal peso/calidad)
          )
        }
        
        img.onerror = () => reject(new Error('Error al cargar la imagen en memoria'))
      }
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'))
    })
  }
}
