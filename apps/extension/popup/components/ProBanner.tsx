import { browser } from "../../src/lib/browser";

interface ProBannerProps {
  onConnect?: () => void;
}

export function ProBanner({ onConnect }: ProBannerProps) {
  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    } else {
      const callbackUrl = browser.runtime.getURL("auth-callback.html");
      const url = `https://toolhaus.dev/extension-auth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
      browser.tabs.create({ url });
    }
  };

  return (
    <div className="pro-banner">
      <div className="pro-banner-content">
        <span className="pro-banner-title">Pro tools locked</span>
        <span className="pro-banner-desc">
          Connect your account to unlock JWT Decoder, Hash Generator, and all 25
          tools.
        </span>
      </div>
      <a
        href="#"
        className="pro-banner-cta"
        onClick={(e) => {
          e.preventDefault();
          handleConnect();
        }}
      >
        Connect Account
      </a>
    </div>
  );
}
