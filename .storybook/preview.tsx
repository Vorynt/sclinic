import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import { useEffect } from "react";

import "../src/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/** Portals (Dialog, Select, …) mount under body — fonts must live on <html>. */
const fontRootClasses = [
  inter.variable,
  spaceGrotesk.variable,
  geistMono.variable,
  "font-sans",
  "antialiased",
] as const;

const withFontRoot: Decorator = (Story) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(...fontRootClasses);
    return () => root.classList.remove(...fontRootClasses);
  }, []);

  return (
    <div className="bg-background text-foreground w-full">
      <div className="p-4">
        <Story />
      </div>
    </div>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    a11y: {
      test: "todo",
    },
    backgrounds: { disable: true },
    docs: {
      toc: true,
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "html",
    }),
    withFontRoot,
  ],
  tags: ["autodocs"],
};

export default preview;
