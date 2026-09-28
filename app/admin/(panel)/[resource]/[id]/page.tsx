import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/auth';
import { resources } from '@/lib/admin-resources';
import { getAdminRecord } from '@/lib/admin';
import { db } from '@/lib/db';
import { Editor } from '@/components/admin/editor';
import { RecordDetails } from '@/components/admin/record-details';
import { PrintButton } from '@/components/admin/print-button';
export default async function RecordPage({params}:{params:Promise<{resource:string;id:string}>}){const {resource,id}=await params;const config=resources[resource];if(!config)notFound();await requireAdminPage(resource);const isNew=id==='new';if(isNew&&['orders','customers','inventory','media','settings'].includes(resource))notFound();const record=isNew?config.defaults:await getAdminRecord(resource,id);if(!record)notFound();const initial=JSON.parse(JSON.stringify(record)) as Record<string,unknown>;const categories=['products','categories'].includes(resource)?await db.category.findMany({select:{id:true,name:true,parentId:true},orderBy:{sortOrder:'asc'}}):[];return <><div className="mb-6 flex justify-between"><h1 className="text-3xl font-bold">{isNew?'Add':'Edit'} {config.label}</h1>{resource==='orders'&&<PrintButton/>}</div><RecordDetails resource={resource} record={initial}/>{!config.readOnly&&<Editor resource={resource} id={isNew?undefined:id} initial={initial} categories={categories}/>}</>;}
