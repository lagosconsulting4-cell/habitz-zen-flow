import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  created_at: string;
}

export interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  rating: number;
  image_url: string | null;
  affiliate_link: string | null;
  created_at: string;
}

export const useQuotes = () => {
  const { data: quotes = [], isLoading: loading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, text, author')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to reduce payload

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour - content rarely changes
  });

  const getDailyQuote = () => {
    if (quotes.length === 0) return null;

    // Get a consistent quote based on the current date
    const today = new Date().toDateString();
    const quoteIndex = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % quotes.length;
    return quotes[quoteIndex];
  };

  return { quotes, loading, getDailyQuote };
};

export const useTips = () => {
  const { data: tips = [], isLoading: loading } = useQuery({
    queryKey: ['tips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select('id, title, content, category, icon')
        .order('created_at', { ascending: false })
        .limit(30); // Limit to reduce payload

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour - content rarely changes
  });

  return { tips, loading };
};

export const useBooks = () => {
  const { data: books = [], isLoading: loading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, description, image_url, affiliate_link, rating')
        .order('rating', { ascending: false })
        .limit(20); // Limit to reduce payload

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 60 * 1000, // 1 hour - content rarely changes
  });

  return { books, loading };
};