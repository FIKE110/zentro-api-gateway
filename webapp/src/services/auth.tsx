import { createApi } from "./api";

type Token={
    token:string
}

export default async function AuthLogin(body:any): Promise<Token> {
  return await createApi('/auth/login',{
    method:'POST',
    body
  })
}