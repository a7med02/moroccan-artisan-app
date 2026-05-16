'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage, translations } from '@/app/context/LanguageContext';
import { MessageCircle, MessageSquare } from 'lucide-react';

export function InboxContent() {
  const { language } = useLanguage();
  const t = translations[language];

  const getClientMessages = () => {
    const messagesByLanguage: Record<string, any[]> = {
      darija: [
        {
          id: 1,
          name: 'فاطمة المغربية',
          lastMessage: 'فشنو تاريخ الجاهزية؟',
          time: '2 ساعات',
          unread: 1,
        },
        {
          id: 2,
          name: 'حسن بن علي',
          lastMessage: 'الخدمة ديالك زوينة! واحد سؤال...',
          time: '4 ساعات',
          unread: 0,
        },
        {
          id: 3,
          name: 'أميرة بوتيك',
          lastMessage: 'كنتاع بشنائطك',
          time: 'يوم',
          unread: 2,
        },
        {
          id: 4,
          name: 'محمد للمحلات',
          lastMessage: 'طلب خاص',
          time: 'يومين',
          unread: 0,
        },
        {
          id: 5,
          name: 'ليلى للمجموعات',
          lastMessage: 'شحال من الكميات ديالك',
          time: '3 أيام',
          unread: 0,
        },
      ],
      arabic: [
        {
          id: 1,
          name: 'فاطمة المغربية',
          lastMessage: 'متى سيكون جاهزًا؟',
          time: 'قبل ساعتين',
          unread: 1,
        },
        {
          id: 2,
          name: 'حسن بن علي',
          lastMessage: 'عمل جميل! هل يمكنك...',
          time: 'قبل 4 ساعات',
          unread: 0,
        },
        {
          id: 3,
          name: 'أميرة بوتيك',
          lastMessage: 'مهتمة بحقائبك',
          time: 'قبل يوم',
          unread: 2,
        },
        {
          id: 4,
          name: 'محمد للمتاجر',
          lastMessage: 'استفسار طلب مخصص',
          time: 'قبل يومين',
          unread: 0,
        },
        {
          id: 5,
          name: 'ليلى كوليكشنز',
          lastMessage: 'سؤال عن توفر المخزون',
          time: 'قبل 3 أيام',
          unread: 0,
        },
      ],
      french: [
        {
          id: 1,
          name: 'Fatima Al-Morocco',
          lastMessage: 'Quand sera-ce prêt?',
          time: 'Il y a 2 heures',
          unread: 1,
        },
        {
          id: 2,
          name: 'Hassan Ben Ali',
          lastMessage: 'Beau travail! Pouvez-vous...',
          time: 'Il y a 4 heures',
          unread: 0,
        },
        {
          id: 3,
          name: 'Amira Boutique',
          lastMessage: 'Intéressée par vos sacs',
          time: 'Il y a 1 jour',
          unread: 2,
        },
        {
          id: 4,
          name: 'Mohammed Stores',
          lastMessage: 'Demande de commande personnalisée',
          time: 'Il y a 2 jours',
          unread: 0,
        },
        {
          id: 5,
          name: 'Layla Collections',
          lastMessage: 'Question sur la disponibilité du stock',
          time: 'Il y a 3 jours',
          unread: 0,
        },
      ],
      english: [
        {
          id: 1,
          name: 'Fatima Al-Morocco',
          lastMessage: 'When will it be ready?',
          time: '2 hours ago',
          unread: 1,
        },
        {
          id: 2,
          name: 'Hassan Ben Ali',
          lastMessage: 'Beautiful work! Can you...',
          time: '4 hours ago',
          unread: 0,
        },
        {
          id: 3,
          name: 'Amira Boutique',
          lastMessage: 'Interested in your bags',
          time: '1 day ago',
          unread: 2,
        },
        {
          id: 4,
          name: 'Mohammed Stores',
          lastMessage: 'Custom order inquiry',
          time: '2 days ago',
          unread: 0,
        },
        {
          id: 5,
          name: 'Layla Collections',
          lastMessage: 'Stock availability question',
          time: '3 days ago',
          unread: 0,
        },
      ],
    };
    return messagesByLanguage[language] || messagesByLanguage.english;
  };

  const clients = getClientMessages();

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t.inbox}
        </h1>
        <p className="text-muted-foreground">{t.messageWithClient}</p>
      </div>

      <div className="space-y-3">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="border-0 bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {client.name}
                  </h3>
                  {client.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
                      {client.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {client.lastMessage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {client.time}
                </p>
              </div>
              <a
                href={`https://wa.me/+212xxxxxxxxx?text=Hi%20${encodeURIComponent(client.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                aria-label={`Message ${client.name}`}
              >
                <MessageCircle className="text-primary" size={24} />
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State Message */}
      <div className="mt-12 text-center">
        <MessageSquare
          className="mx-auto text-muted-foreground mb-3"
          size={48}
        />
        <p className="text-muted-foreground">
          {t.noClients}
        </p>
      </div>
    </div>
  );
}
