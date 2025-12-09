import { createApi } from "./api";

export default async function fetchFullConfig(): Promise<any> {
  return await createApi('/api/config')
}


export  async function updateFullConfig(body:any): Promise<any> {
  return await createApi('/api/config',{
    method:'POST',
    body
  })
}