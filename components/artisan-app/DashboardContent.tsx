'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useLanguage, translations } from '@/app/context/LanguageContext';
import { TrendingUp, ShoppingBag, Users } from 'lucide-react';

export function DashboardContent() {
  const { language } = useLanguage();
  const t = translations[language];

  const products = [
    {
      id: 1,
      name: 'Leather Bag',
      image: 'bg-gradient-to-br from-amber-900 to-amber-700',
      price: '120 DH',
    },
    {
      id: 2,
      name: 'Moroccan Rug',
      image: 'bg-gradient-to-br from-red-700 to-orange-600',
      price: '450 DH',
    },
    {
      id: 3,
      name: 'Ceramic Pot',
      image: 'bg-gradient-to-br from-blue-600 to-blue-400',
      price: '85 DH',
    },
    {
      id: 4,
      name: 'Brass Lantern',
      image: 'bg-gradient-to-br from-yellow-700 to-yellow-500',
      price: '200 DH',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t.welcome}
        </h1>
        <p className="text-muted-foreground">{t.message}</p>
      </div>

      {/* Create Post CTA */}
      <Link href="/create" className="block mb-6">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold rounded-lg">
          + {t.createPost}
        </Button>
      </Link>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 text-center border-0 bg-card">
          <div className="flex justify-center mb-2">
            <ShoppingBag className="text-primary" size={24} />
          </div>
          <p className="text-2xl font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground">{t.myProducts}</p>
        </Card>
        <Card className="p-4 text-center border-0 bg-card">
          <div className="flex justify-center mb-2">
            <Users className="text-secondary" size={24} />
          </div>
          <p className="text-2xl font-bold text-foreground">28</p>
          <p className="text-xs text-muted-foreground">{t.clients}</p>
        </Card>
        <Card className="p-4 text-center border-0 bg-card">
          <div className="flex justify-center mb-2">
            <TrendingUp className="text-accent" size={24} />
          </div>
          <p className="text-2xl font-bold text-foreground">3.2K</p>
          <p className="text-xs text-muted-foreground">{t.views}</p>
        </Card>
      </div>

      {/* Products Grid */}
      <h2 className="text-xl font-bold text-foreground mb-4">{t.myProducts}</h2>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-0 bg-card hover:shadow-lg transition-shadow">
            <div className={`${product.image} h-32 w-full`} />
            <div className="p-3">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {product.name}
              </h3>
              <p className="text-primary font-bold text-sm">{product.price}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
