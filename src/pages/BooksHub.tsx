import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Book, ExternalLink, Loader2 } from "lucide-react";
import { useBooks } from "@/hooks/useSupabaseData";

const BooksHub = () => {
  const { books, loading } = useBooks();
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = useMemo(() => {
    const unique = new Set<string>();
    books.forEach((b) => b.category && unique.add(b.category));
    return ["Todos", ...Array.from(unique.values())];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === "Todos") return books;
    return books.filter((b) => b.category === selectedCategory);
  }, [books, selectedCategory]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            Hub de <span className="font-medium gradient-text">Livros</span>
          </h1>
          <p className="text-muted-foreground font-light">
            Biblioteca curada para desenvolvimento pessoal masculino
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 animate-slide-up">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <Card className="glass-card p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {filteredBooks.map((book, index) => (
              <Card
                key={book.id}
                className="glass-card p-6 hover:shadow-elegant transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {book.image_url ? (
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-16 h-20 rounded-lg object-cover border border-border/40"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-muted/30 rounded-lg flex items-center justify-center">
                      <Book className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-lg leading-tight">{book.title}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">por {book.author}</p>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {book.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {book.category}
                    </Badge>

                    <Button
                      size="sm"
                      className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
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
            ))}
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default BooksHub;
