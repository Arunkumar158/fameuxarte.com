import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-4DMQ6G8337"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4DMQ6G8337');
            `,
          }}
        />
        <meta name="msvalidate.01" content="A832E1D458E5C3D47E73A6CB8F2ED7F6" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 
