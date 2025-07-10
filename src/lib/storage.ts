import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface ImageMetadata {
  frequencyId?: number;
  isCoverImage?: boolean;
  description?: string;
}

class StorageService {
  private readonly BUCKET_NAME = 'therapeutic-images';
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Inicializar bucket se não existir
   */
  async initializeBucket(): Promise<boolean> {
    try {
      // Verificar se bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);

      if (!bucketExists) {
        // Criar bucket
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: false, // Imagens privadas por padrão
          allowedMimeTypes: this.ALLOWED_TYPES,
          fileSizeLimit: this.MAX_FILE_SIZE
        });

        if (error) {
          console.error('Erro ao criar bucket:', error);
          return false;
        }
      }

      // Configurar políticas do bucket
      await this.setupBucketPolicies();
      return true;
    } catch (error) {
      console.error('Erro ao inicializar bucket:', error);
      return false;
    }
  }

  /**
   * Configurar políticas de acesso do bucket
   */
  private async setupBucketPolicies(): Promise<void> {
    try {
      // Política para upload (usuários autenticados podem fazer upload)
      await supabase.rpc('create_storage_policy', {
        policy_name: 'authenticated_upload',
        bucket_name: this.BUCKET_NAME,
        operation: 'INSERT',
        definition: 'auth.role() = \'authenticated\''
      });

      // Política para leitura (usuários podem ver suas próprias imagens)
      await supabase.rpc('create_storage_policy', {
        policy_name: 'user_read_own_images',
        bucket_name: this.BUCKET_NAME,
        operation: 'SELECT',
        definition: 'auth.uid()::text = (storage.foldername(name))[1]'
      });

      // Política para exclusão (usuários podem deletar suas próprias imagens)
      await supabase.rpc('create_storage_policy', {
        policy_name: 'user_delete_own_images',
        bucket_name: this.BUCKET_NAME,
        operation: 'DELETE',
        definition: 'auth.uid()::text = (storage.foldername(name))[1]'
      });
    } catch (error) {
      console.error('Erro ao configurar políticas do bucket:', error);
    }
  }

  /**
   * Validar arquivo antes do upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${this.ALLOWED_TYPES.join(', ')}`
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Gerar nome único para o arquivo
   */
  private generateUniqueFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${userId}/${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Fazer upload de imagem
   */
  async uploadImage(
    file: File, 
    metadata: ImageMetadata = {}
  ): Promise<UploadResult> {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Inicializar bucket se necessário
      await this.initializeBucket();

      // Gerar nome único
      const fileName = this.generateUniqueFileName(file.name, user.id);

      // Fazer upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      // Registrar no banco de dados
      const { error: dbError } = await supabase
        .from('user_images')
        .insert({
          user_id: user.id,
          image_path: uploadData.path,
          image_name: file.name,
          image_type: file.type,
          file_size: file.size,
          frequency_id: metadata.frequencyId,
          is_cover_image: metadata.isCoverImage || false,
          metadata: {
            description: metadata.description,
            uploaded_at: new Date().toISOString()
          }
        });

      if (dbError) {
        // Tentar remover arquivo do storage se falhou no banco
        await supabase.storage.from(this.BUCKET_NAME).remove([uploadData.path]);
        return { success: false, error: dbError.message };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(uploadData.path);

      return {
        success: true,
        url: urlData.publicUrl,
        path: uploadData.path
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return { success: false, error: 'Erro interno no upload' };
    }
  }

  /**
   * Listar imagens do usuário
   */
  async getUserImages(userId?: string): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_images')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao listar imagens:', error);
        return [];
      }

      // Adicionar URLs públicas
      return data.map(image => ({
        ...image,
        url: supabase.storage.from(this.BUCKET_NAME).getPublicUrl(image.image_path).data.publicUrl
      }));
    } catch (error) {
      console.error('Erro ao listar imagens:', error);
      return [];
    }
  }

  /**
   * Excluir imagem
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      // Buscar dados da imagem
      const { data: imageData, error: fetchError } = await supabase
        .from('user_images')
        .select('image_path, user_id')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !imageData) {
        console.error('Imagem não encontrada ou sem permissão');
        return false;
      }

      // Remover do storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([imageData.image_path]);

      if (storageError) {
        console.error('Erro ao remover do storage:', storageError);
      }

      // Remover do banco de dados
      const { error: dbError } = await supabase
        .from('user_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Erro ao remover do banco:', dbError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      return false;
    }
  }

  /**
   * Atualizar metadados da imagem
   */
  async updateImageMetadata(
    imageId: string, 
    metadata: Partial<ImageMetadata>
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const updateData: any = {};
      if (metadata.frequencyId !== undefined) updateData.frequency_id = metadata.frequencyId;
      if (metadata.isCoverImage !== undefined) updateData.is_cover_image = metadata.isCoverImage;
      if (metadata.description !== undefined) {
        updateData.metadata = { description: metadata.description };
      }

      const { error } = await supabase
        .from('user_images')
        .update(updateData)
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar metadados:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();