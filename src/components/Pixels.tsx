import Script from "next/script";

/** Meta Pixel + Snapchat Pixel base code — fires automatically on every
 * page load (PageView / PAGE_VIEW) once the admin sets the pixel ID in the
 * dashboard. See PurchaseEvent.tsx for the one other event this app fires
 * (a confirmed order on /pay/callback). */
export function Pixels({ metaPixelId, snapPixelId }: { metaPixelId: string | null; snapPixelId: string | null }) {
  return (
    <>
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}
      {snapPixelId && (
        <Script id="snap-pixel" strategy="afterInteractive">
          {`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
{a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
r.src=n;var u=t.getElementsByTagName(s)[0];
u.parentNode.insertBefore(r,u);})(window,document,
'https://sc-static.net/scevent.min.js');
snaptr('init', '${snapPixelId}');
snaptr('track', 'PAGE_VIEW');`}
        </Script>
      )}
    </>
  );
}
