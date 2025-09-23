import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/NavigationBar";
import { Book, ExternalLink, Lock, Crown } from "lucide-react";
import { booksHub, bookCategories } from "@/data/books";

const BooksHub = () => {
  const isPremium = false; // This would come from user subscription status
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredBooks = selectedCategory === "Todos" 
    ? booksHub 
    : booksHub.filter(book => book.category === selectedCategory);

  const availableBooks = filteredBooks.filter(book => !book.premium_only || isPremium);
  const lockedBooks = filteredBooks.filter(book => book.premium_only && !isPremium);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-light mb-2">
            Hub de <span className="font-medium gradient-text">Livros</span>
          </h1>
          <p className="text-muted-foreground font-light">
            Biblioteca curada para desenvolvimento pessoal masculino
          </p>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 mb-6 animate-slide-up">
          {bookCategories.map((category) => (
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

        {/* Available Books */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {availableBooks.map((book, index) => (
            <Card 
              key={book.id}
              className="glass-card p-6 hover:shadow-elegant transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-20 bg-muted/30 rounded-lg flex items-center justify-center">
                    <Book className="w-8 h-8 text-muted-foreground" />
                  </div>
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
                      onClick={() => window.open(book.link, '_blank')}
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

        {/* Locked Premium Books */}
        {lockedBooks.length > 0 && !isPremium && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Biblioteca Premium
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {lockedBooks.slice(0, 4).map((book, index) => (
                <Card 
                  key={book.id}
                  className="glass-card p-6 opacity-60 animate-slide-up"
                  style={{ animationDelay: `${(availableBooks.length + index) * 100}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-20 bg-muted/30 rounded-lg flex items-center justify-center">
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg leading-tight text-muted-foreground mb-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">por {book.author}</p>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {book.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Premium
                        </Badge>
                        <Button size="sm" variant="ghost" disabled>
                          <Lock className="w-3 h-3 mr-1" />
                          Bloqueado
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="glass-card p-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Biblioteca Premium Completa</h3>
                  <p className="text-muted-foreground font-light mb-4">
                    Acesse {lockedBooks.length} livros exclusivos, resumos estendidos e links diretos
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      <span>+{lockedBooks.length} livros premium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Links diretos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      <span>Resumos estendidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span>Acesso vitalício</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade para Premium
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  R$ 247/ano • Cancele quando quiser
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default BooksHub;