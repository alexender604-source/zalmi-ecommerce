import { CatalogListing } from '@/components/catalog-listing';
export const metadata={title:'Shop'};
export default async function Shop({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){return <div className="container-shell py-12"><h1 className="text-3xl font-bold">Shop the collection</h1><CatalogListing params={await searchParams}/></div>;}
