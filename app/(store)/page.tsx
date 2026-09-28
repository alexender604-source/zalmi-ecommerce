import { getHomepage } from '@/lib/content';
import { getSettings } from '@/lib/settings';
import { Hero } from '@/components/hero';
import { TrustStrip } from '@/components/trust-strip';
import { ProductGrid } from '@/components/product-grid';
import { CategoryGrid } from '@/components/category-grid';
import { PromoBanner } from '@/components/promo-banner';
import { BenefitsSection } from '@/components/benefits-section';
import { ReviewCarousel } from '@/components/review-carousel';
import { SectionHeading } from '@/components/section-heading';
import { WhatsAppCTA } from '@/components/whatsapp-cta';
import { SeoContent } from '@/components/seo-content';
import { StructuredData,siteUrl } from '@/lib/seo';
export default async function Home(){const [sections,settings]=await Promise.all([getHomepage(),getSettings()]);return <>
 <StructuredData value={{'@context':'https://schema.org','@type':'Organization',name:settings.storeName,url:siteUrl(),logo:new URL(settings.logo,siteUrl()).href,telephone:settings.phone}}/>
 <StructuredData value={{'@context':'https://schema.org','@type':'WebSite',name:settings.storeName,url:siteUrl()}}/>
 {sections.map(s=>{
  if(s.type==='HERO')return s.banner?<Hero key={s.id} banner={s.banner}/>:null;
  if(s.type==='TRUST')return <TrustStrip key={s.id} items={s.config.items||[]}/>;
  if(s.type==='PROMO')return s.banner?<PromoBanner key={s.id} banner={s.banner}/>:null;
  if(s.type==='BENEFITS')return <BenefitsSection key={s.id} title={s.title} config={s.config}/>;
  if(s.type==='WHATSAPP')return <WhatsAppCTA key={s.id} title={s.title} config={s.config} settings={settings}/>;
  if(s.type==='SEO')return <SeoContent key={s.id} blocks={s.config.blocks||[]}/>;
  return <section key={s.id} className={s.key==='speciality'?'bg-surface-muted':'bg-surface'}><div className="container-shell py-12 lg:py-16"><SectionHeading title={s.title} eyebrow={s.config.eyebrow} centered={['CATEGORIES','REVIEWS'].includes(s.type)} withLink={s.type==='PRODUCTS'} href={s.config.categorySlug?`/category/${s.config.categorySlug}`:'/shop'}/>{s.config.description&&<p className="mt-4 text-sm leading-7 text-muted">{s.config.description}</p>}{s.type==='PRODUCTS'&&<div className="mt-6"><ProductGrid products={s.products}/></div>}{s.type==='CATEGORIES'&&<CategoryGrid categories={s.categories}/>} {s.type==='REVIEWS'&&<ReviewCarousel reviews={s.reviews}/>}</div></section>;
 })}
 </>;}
