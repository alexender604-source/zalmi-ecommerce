import { getSettings,getNavigation,navigationUrl } from '@/lib/settings';
import { getCategories } from '@/lib/categories';
import { AnnouncementBar } from '@/components/announcement-bar';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FloatingWhatsApp } from '@/components/floating-whatsapp';
import { CartProvider } from '@/components/cart-provider';
export const dynamic='force-dynamic';
export const maxDuration=60;
export default async function StoreLayout({children}:{children:React.ReactNode}){
 const [settings,navigation,categories]=await Promise.all([getSettings(),getNavigation(),getCategories()]);
 const menus=navigation.filter(i=>!i.category||i.category.active).map(i=>({id:i.id,label:i.label,url:navigationUrl(i),parentId:i.parentId,location:i.location}));
 return <CartProvider><div className="min-h-screen bg-surface font-sans text-foreground"><AnnouncementBar text={settings.announcement}/><Header settings={settings} items={menus.filter(i=>i.location==='MAIN')}/><main>{children}</main><Footer settings={settings} items={menus.filter(i=>i.location!=='MAIN')} categories={categories.filter(c=>!c.parentId)}/><FloatingWhatsApp phone={settings.whatsapp}/></div></CartProvider>;
}
