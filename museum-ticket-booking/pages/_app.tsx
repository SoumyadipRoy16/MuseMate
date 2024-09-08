import { Auth0Provider } from '@auth0/auth0-react'
import type { AppProps } from 'next/app'
import '../app/globals.css'

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN as string;
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  )
}
export default MyApp
