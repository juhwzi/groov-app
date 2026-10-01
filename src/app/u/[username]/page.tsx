import { PublicProfile } from "@/components/PublicProfile";
export default async function PublicUserPage({params}:{params:Promise<{username:string}>}){const {username}=await params;return <PublicProfile username={username}/>}
