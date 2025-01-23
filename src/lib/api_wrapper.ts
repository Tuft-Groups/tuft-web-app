import axios, { AxiosError, AxiosRequestConfig } from "axios";
import FirebaseAuth from "./firebaseAuthClass";

type MakeApiCallProps = {
  url: string;
  body?: Record<string, any>;
  params?: Record<string, any>;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE";
  authRequired?: boolean;
};

export default async function makeApiCall(config: MakeApiCallProps) {
  const authToken = await new FirebaseAuth().getIDToken();
  if (!authToken && config.authRequired) throw new Error("Auth token not found");

  const headers: Record<string, any> = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + authToken,
  };

  const axiosConfig: AxiosRequestConfig = {
    url: process.env.NEXT_PUBLIC_TUFT_API + config.url,
    method: config.method,
    headers,
    data: config.body,
    params: config.params,
  };

  try {
    const res = await axios(axiosConfig);
    return res.data.data;
  } catch (e) {
    const error = e as AxiosError;
    console.error({ error: error.response?.data ?? error.message });

    throw error.response?.data ?? error.message;
  }
}
