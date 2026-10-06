import { Link, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

type ExternalLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: Href;
};

export function ExternalLink({ href, onPress, ...props }: ExternalLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      target='_blank'
      onPress={(event) => {
        onPress?.(event);
        if (Platform.OS !== 'web') {
          event.preventDefault();
          void WebBrowser.openBrowserAsync(String(href));
        }
      }}
    />
  );
}
