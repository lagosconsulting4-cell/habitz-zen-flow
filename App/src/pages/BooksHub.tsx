import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Book, ExternalLink, Loader2 } from "lucide-react";
import { useBooks } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import { isBonusEnabled } from "@/config/bonusFlags";

const BooksHub = () => {
  const { books, loading } = useBooks();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const unique = new Set<string>();
    books.forEach((b) => b.category && unique.add(b.category));
    return ["Todos", ...Array.from(unique.values())];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === "Todos") return books;
    return books.filter((b) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  useEffect(() => {
    if (!isBonusEnabled("books")) {
      navigate("/bonus", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-6 max-w-4xl"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground flex items-center gap-3 mb-2">
            <Book className="w-8 h-8 text-primary" />
            Hub de Livros
          </h1>
          <p className="text-muted-foreground">
            Biblioteca curada para desenvolvimento pessoal masculino
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary border border-border text-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <Card className="rounded-2xl bg-card border border-border p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="rounded-2xl bg-card border border-border p-6 hover:border-primary/50 transition-all duration-300">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {book.image_url ? (
                        <img
                          src={book.image_url}
                          alt={book.title}
                          className="w-16 h-20 rounded-lg object-cover border border-border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <Book className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg leading-tight text-foreground">{book.title}</h3>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">por {book.author}</p>

                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                        {book.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
                          {book.category}
                        </Badge>

                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                          onClick={() => window.open(book.affiliate_link ?? '#', "_blank")}
                          disabled={!book.affiliate_link}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver Livro
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <NavigationBar />
    </div>
  );
};

export default BooksHub;
