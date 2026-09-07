import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'Edzésnaplóm', description:'Edzések, sorozatok és fejlődés. Az Edzésnapló mentéseivel.',manifest:'/manifest.webmanifest'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="hu"><body>{children}</body></html>}
