import { supabase } from "@/integrations/supabase/client";

/**
 * Gera uma URL assinada para download seguro de arquivos
 * @param bucket - Nome do bucket (ex: 'bonus-ebooks')
 * @param path - Caminho do arquivo no bucket
 * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
 * @returns URL assinada ou null em caso de erro
 */
export async function getSignedDownloadUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Erro ao gerar URL assinada:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Erro ao gerar URL assinada:", error);
    return null;
  }
}

/**
 * Faz o download de um arquivo do Supabase Storage
 * @param bucket - Nome do bucket
 * @param path - Caminho do arquivo
 * @param fileName - Nome do arquivo para download
 */
export async function downloadFile(
  bucket: string,
  path: string,
  fileName: string
): Promise<boolean> {
  try {
    // Gera URL assinada
    const signedUrl = await getSignedDownloadUrl(bucket, path);

    if (!signedUrl) {
      throw new Error("Não foi possível gerar URL de download");
    }

    // Cria um link temporário e dispara o download
    const link = document.createElement("a");
    link.href = signedUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Erro ao fazer download:", error);
    return false;
  }
}

/**
 * Lista arquivos de um bucket
 * @param bucket - Nome do bucket
 * @param path - Caminho da pasta (opcional)
 */
export async function listFiles(bucket: string, path: string = "") {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      console.error("Erro ao listar arquivos:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return [];
  }
}

/**
 * Faz upload de um arquivo para o Supabase Storage
 * @param bucket - Nome do bucket
 * @param path - Caminho de destino
 * @param file - Arquivo a ser enviado
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      console.error("Erro ao fazer upload:", error);
      return null;
    }

    return data.path;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return null;
  }
}

/**
 * Remove um arquivo do Supabase Storage
 * @param bucket - Nome do bucket
 * @param path - Caminho do arquivo
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error("Erro ao deletar arquivo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return false;
  }
}
