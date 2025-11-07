import { useState, useEffect } from "react";
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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuotes(data || []);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

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
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const { data, error } = await supabase
          .from('tips')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTips(data || []);
      } catch (error) {
        console.error('Error fetching tips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  return { tips, loading };
};

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('rating', { ascending: false });

        if (error) throw error;
        setBooks(data || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return { books, loading };
};