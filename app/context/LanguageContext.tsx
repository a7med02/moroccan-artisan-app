'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'darija' | 'arabic' | 'french' | 'english';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('darija');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export const translations = {
  darija: {
    dashboard: 'الدار',
    createPost: 'نشر منتج',
    inbox: 'الصندوق',
    createNewPost: 'انشي منتوج جديد',
    myProducts: 'منتوجاتي',
    clients: 'الزباين',
    welcome: 'سلام عليكم',
    message: 'مرحبا بك في منصة الحرفيين المغاربة',
    step1: 'الخطوة 1: رفع الصورة أو الفيديو',
    step2: 'الخطوة 2: معلومات المنتوج',
    step3: 'الخطوة 3: الفيديو والمنشور المولدة',
    uploadMedia: 'اضغط لرفع الصورة أو الفيديو',
    imageVideo: 'صورة أو فيديو',
    productName: 'اسم المنتوج',
    productNamePlaceholder: 'مثلا: شنطة جلد محروفة',
    description: 'الوصف',
    descriptionPlaceholder: 'قول على منتوجك...',
    back: 'رجع',
    generateWithAI: 'وليد مع الذكاء الاصطناعي',
    generating: 'كتجولد فيديو جميل...',
    publish: 'نشر',
    selectLanguage: 'اختار اللغة',
    views: 'المشاهدات',
    noClients: 'شي عندك زباين',
    messageWithClient: 'رسالة مع الزبون',
    lastMessage: 'آخر رسالة',
    generatedVideo: 'الفيديو المولد',
    generatedPost: 'المنشور المولد',
    readyToPublish: 'جاهز باش تنشر',
  },
  arabic: {
    dashboard: 'لوحة التحكم',
    createPost: 'إنشاء منتج',
    inbox: 'صندوق الوارد',
    createNewPost: 'إنشاء منتج جديد',
    myProducts: 'منتجاتي',
    clients: 'العملاء',
    welcome: 'أهلا وسهلا',
    message: 'مرحبا بك في منصة الحرفيين المغاربة',
    step1: 'الخطوة 1: رفع الصورة أو الفيديو',
    step2: 'الخطوة 2: تفاصيل المنتج',
    step3: 'الخطوة 3: الفيديو والمنشور المُنتَج',
    uploadMedia: 'اضغط لرفع الصورة أو الفيديو',
    imageVideo: 'صورة أو فيديو',
    productName: 'اسم المنتج',
    productNamePlaceholder: 'مثال: حقيبة جلد مصنوعة يدويًا',
    description: 'الوصف',
    descriptionPlaceholder: 'أخبر عن منتجك...',
    back: 'رجوع',
    generateWithAI: 'إنتاج باستخدام الذكاء الاصطناعي',
    generating: 'جاري إنتاج فيديو جميل...',
    publish: 'نشر',
    selectLanguage: 'اختر اللغة',
    views: 'المشاهدات',
    noClients: 'لا توجد رسائل',
    messageWithClient: 'رسالة مع العميل',
    lastMessage: 'آخر رسالة',
    generatedVideo: 'الفيديو المُنتَج',
    generatedPost: 'المنشور المُنتَج',
    readyToPublish: 'جاهز للنشر',
  },
  french: {
    dashboard: 'Tableau de bord',
    createPost: 'Créer un produit',
    inbox: 'Boîte de réception',
    createNewPost: 'Créer un nouveau produit',
    myProducts: 'Mes produits',
    clients: 'Clients',
    welcome: 'Bienvenue',
    message: 'Bienvenue sur la plateforme des artisans marocains',
    step1: 'Étape 1: Télécharger l\'image ou la vidéo',
    step2: 'Étape 2: Détails du produit',
    step3: 'Étape 3: Vidéo et publication générées',
    uploadMedia: 'Cliquez pour télécharger l\'image ou la vidéo',
    imageVideo: 'Image ou vidéo',
    productName: 'Nom du produit',
    productNamePlaceholder: 'Ex: Sac en cuir fait à la main',
    description: 'Description',
    descriptionPlaceholder: 'Parlez de votre produit...',
    back: 'Retour',
    generateWithAI: 'Générer avec l\'IA',
    generating: 'Génération d\'une belle vidéo...',
    publish: 'Publier',
    selectLanguage: 'Sélectionner la langue',
    views: 'Vues',
    noClients: 'Aucun message',
    messageWithClient: 'Message avec le client',
    lastMessage: 'Dernier message',
    generatedVideo: 'Vidéo générée',
    generatedPost: 'Publication générée',
    readyToPublish: 'Prêt à publier',
  },
  english: {
    dashboard: 'Dashboard',
    createPost: 'Create Post',
    inbox: 'Inbox',
    createNewPost: 'Create New Product',
    myProducts: 'My Products',
    clients: 'Clients',
    welcome: 'Welcome',
    message: 'Welcome to the Moroccan artisans marketplace',
    step1: 'Step 1: Upload Image or Video',
    step2: 'Step 2: Product Details',
    step3: 'Step 3: Generated Video and Post',
    uploadMedia: 'Click to upload image or video',
    imageVideo: 'Image or video',
    productName: 'Product Name',
    productNamePlaceholder: 'E.g., Handmade Leather Bag',
    description: 'Description',
    descriptionPlaceholder: 'Tell about your product...',
    back: 'Back',
    generateWithAI: 'Generate with AI',
    generating: 'Generating beautiful video...',
    publish: 'Publish',
    selectLanguage: 'Select Language',
    views: 'Views',
    noClients: 'No messages',
    messageWithClient: 'Message with client',
    lastMessage: 'Last message',
    generatedVideo: 'Generated Video',
    generatedPost: 'Generated Post',
    readyToPublish: 'Ready to publish',
  },
};
