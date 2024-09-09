import { AppProps } from 'next/app';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingComponent from '@/components/ui/LoadingComponent'; // Ensure this path is correct

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const onRedirectCallback = (appState: any) => {
    // Ensure redirection directly to /chatbot after login
    router.push(appState?.returnTo || '/chatbot');
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN as string}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string}
      authorizationParams={{ redirect_uri: window.location.origin }}
      onRedirectCallback={onRedirectCallback}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}

export default MyApp;
