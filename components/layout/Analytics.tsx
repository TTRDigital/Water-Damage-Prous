import Script from "next/script";

/*
 * Google Analytics 4: the old site's tag (G-F3JQ9WQY4G) by default; NEXT_PUBLIC_GA_ID overrides it
 * ("off" removes it). NEXT_PUBLIC_GTM_ID adds a Tag Manager container (the old site had none).
 * Both load after the page has finished loading, so they never slow it down.
 * Clicks on [data-track="click_to_call"] are sent as events.
 */
const gaEnv = process.env.NEXT_PUBLIC_GA_ID;
const GA_ID = gaEnv === "off" ? "" : gaEnv || "G-F3JQ9WQY4G";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const TRACK_CLICKS = `document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('[data-track]');if(!a)return;var n=a.getAttribute('data-track'),p={link_url:a.href||'',page:location.pathname};if(window.gtag)window.gtag('event',n,p);else(window.dataLayer=window.dataLayer||[]).push(Object.assign({event:n},p))});`;

export function Analytics() {
  return (
    <>
      {GTM_ID ? (
        <Script id="gtm" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      ) : null}
      {GA_ID ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
          <Script id="ga" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      ) : null}
      {GA_ID || GTM_ID ? (
        <Script id="track-clicks" strategy="lazyOnload">
          {TRACK_CLICKS}
        </Script>
      ) : null}
    </>
  );
}
